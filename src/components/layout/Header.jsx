import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaMoon, FaSun } from 'react-icons/fa';
import logoImg from '../../assets/logo.png';
import { useGameMode } from '../../context/GameModeContext';
import { useSound } from '../../context/SoundContext';
import { useAuth } from '../../context/AuthContext';
import styles from './Header.module.css';

const Header = () => {
    const { isGamified, toggleGamified } = useGameMode();
    const { playSound } = useSound();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const isSolo = true;

    const handleModeSwitch = () => {
        playSound('parchment');
        toggleGamified();
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <header className={styles.header}>
            <div className={styles.left}>
                <img src={logoImg} alt="CodeChamber Logo" className={styles.logoImg} />
                <h1 className={styles.title}>CodeChamber</h1>
            </div>

            <nav className={styles.center}>
                <NavLink to="/" className={({ isActive }) => isActive ? styles.active : ''}>Home</NavLink>
                {user && <NavLink to="/dashboard" className={({ isActive }) => isActive ? styles.active : ''}>Dashboard</NavLink>}
                {isGamified && user && <NavLink to="/leaderboard" className={({ isActive }) => isActive ? styles.active : ''}>Leaderboard</NavLink>}
                {user && <NavLink to="/profile" className={({ isActive }) => isActive ? styles.active : ''}>Profile</NavLink>}
            </nav>

            <div className={styles.right}>
                <button className={styles.toggleBtn} onClick={handleModeSwitch} title="Toggle Mode">
                    {isGamified ? 'Gamified Mode' : 'Clean Mode'}
                </button>
                {user && (
                    <button className={styles.toggleBtn} title="Toggle Solo/Room">
                        {isSolo ? 'Solo' : 'Room'}
                    </button>
                )}
                {user ? (
                    <>
                        <div className={styles.avatar}>
                            {user.photoURL ? (
                                <img src={user.photoURL} alt="Profile" style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid var(--color-primary-gold)' }} />
                            ) : (
                                <FaUserCircle size={24} color="var(--color-primary-gold)" />
                            )}
                        </div>
                        <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
                    </>
                ) : (
                    <button className={styles.toggleBtn} onClick={() => navigate('/login')}>Login / Register</button>
                )}
            </div>
        </header>
    );
};

export default Header;
