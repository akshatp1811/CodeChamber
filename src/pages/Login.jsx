import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaGoogle } from 'react-icons/fa';

const Login = () => {
    const { loginWithGoogle, user } = useAuth();
    const navigate = useNavigate();

    // Redirect to dashboard if already logged in
    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const handleLogin = async () => {
        await loginWithGoogle();
        navigate('/dashboard');
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '80vh',
            padding: '2rem'
        }}>
            <div className="card glow-hover" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '2rem', color: 'var(--color-primary-gold)' }}>Authentication</h2>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
                    Verify your identity to enter the CodeChamber.
                </p>
                <button
                    onClick={handleLogin}
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
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <FaGoogle color="#DB4437" size={20} />
                    Continue with Google
                </button>
            </div>
        </div>
    );
};

export default Login;
