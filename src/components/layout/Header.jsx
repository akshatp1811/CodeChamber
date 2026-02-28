import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaUserCircle, FaMoon, FaSun } from 'react-icons/fa';
import logoImg from '../../assets/logo.png';
import { useGameMode } from '../../context/GameModeContext';
import { useSound } from '../../context/SoundContext';
import styles from './Header.module.css';

const Header = () => {
    const { isGamified, toggleGamified } = useGameMode();
    const { playSound } = useSound();
    const isSolo = true;

    const handleModeSwitch = () => {
        playSound('parchment');
        toggleGamified();
    };

    return (
        <header className={styles.header}>
            <div className={styles.left}>
                <img src={logoImg} alt="CodeChamber Logo" className={styles.logoImg} />
                <h1 className={styles.title}>CodeChamber</h1>
            </div>

            <nav className={styles.center}>
                <NavLink to="/" className={({ isActive }) => isActive ? styles.active : ''}>Home</NavLink>
                <NavLink to="/dashboard" className={({ isActive }) => isActive ? styles.active : ''}>Dashboard</NavLink>
                {isGamified && <NavLink to="/leaderboard" className={({ isActive }) => isActive ? styles.active : ''}>Leaderboard</NavLink>}
                <NavLink to="/profile" className={({ isActive }) => isActive ? styles.active : ''}>Profile</NavLink>
            </nav>

            <div className={styles.right}>
                <button className={styles.toggleBtn} onClick={handleModeSwitch} title="Toggle Mode">
                    {isGamified ? 'Gamified Mode' : 'Clean Mode'}
                </button>
                <button className={styles.toggleBtn} title="Toggle Solo/Room">
                    {isSolo ? 'Solo' : 'Room'}
                </button>
                <div className={styles.avatar}>
                    <FaUserCircle size={24} color="var(--color-primary-gold)" />
                </div>
                <button className={styles.logoutBtn}>Logout</button>
            </div>
        </header>
    );
};

export default Header;
