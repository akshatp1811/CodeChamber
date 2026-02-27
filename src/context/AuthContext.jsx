import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider, db } from '../config/firebase';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            try {
                if (currentUser) {
                    // Fetch user data from Firestore
                    const userDocRef = doc(db, 'users', currentUser.uid);
                    const userDocSnap = await getDoc(userDocRef);

                    let userData = {};

                    if (userDocSnap.exists()) {
                        userData = userDocSnap.data();
                    } else {
                        // Create new user profile if it doesn't exist
                        userData = {
                            name: currentUser.displayName || 'Developer',
                            email: currentUser.email,
                            photoURL: currentUser.photoURL || '',
                            xp: 0,
                            rank: "Novice",
                            badges: [],
                            createdAt: serverTimestamp()
                        };
                        try {
                            await setDoc(userDocRef, userData);
                        } catch (firestoreError) {
                            console.error("Firestore persistence error (permissions/offline):", firestoreError);
                            // Even if setDoc fails, we should still let them login with basic data
                        }
                    }

                    // Merge Google Auth and Firestore Data
                    setUser({
                        uid: currentUser.uid,
                        ...userData,
                        // Keep the original photoURL just in case
                        photoURL: currentUser.photoURL || userData.photoURL
                    });
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error("Critical Auth Error:", error);
                setAuthError(error.message);
            } finally {
                setLoading(false);
            }
        });
        return unsubscribe;
    }, []);

    const loginWithGoogle = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Error signing in with Google", error);
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out", error);
        }
    };

    const value = {
        user,
        loading,
        loginWithGoogle,
        logout
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: 'var(--color-bg)', color: 'var(--color-primary-gold)' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid rgba(212, 175, 55, 0.3)', borderTopColor: 'var(--color-primary-gold)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <h2 style={{ marginTop: '20px', fontFamily: 'var(--font-heading)' }}>Awakening the core...</h2>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (authError) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: 'var(--color-bg)', color: 'var(--color-crimson)' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)' }}>Authentication Error</h2>
                <p>{authError}</p>
                <button onClick={() => window.location.reload()} style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: 'var(--color-primary-gold)', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Retry</button>
            </div>
        )
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
