import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { FaGoogle } from 'react-icons/fa';

const Login = () => {
    const { user, loginWithGoogle, loading } = useAuth();

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '80vh',
            padding: '2rem'
        }}>
            <div className="card glow-hover" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '2rem', fontFamily: 'var(--font-heading)' }}>Authentication</h2>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
                    Verify your identity to enter the CodeChamber.
                </p>
                <button
                    onClick={loginWithGoogle}
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '1rem',
                        backgroundColor: '#fff',
                        color: '#000',
                        fontFamily: 'var(--font-body)',
                        fontWeight: '600',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        transition: 'transform 0.2s ease',
                        border: 'none'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <FaGoogle color="#4285F4" size={20} />
                    {loading ? 'Connecting...' : 'Continue with Google'}
                </button>
            </div>
        </div>
    );
};

export default Login;

