import React from 'react';

const Login = () => {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '80vh',
            padding: '2rem'
        }}>
            <div className="card glow-hover" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Authentication</h2>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
                    Verify your identity to enter the CodeChamber.
                </p>
                <button style={{
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
                    gap: '10px'
                }}>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" width="20" />
                    Continue with Google
                </button>
            </div>
        </div>
    );
};

export default Login;
