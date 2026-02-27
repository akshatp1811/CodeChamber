import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLaptopCode, FaUsers, FaMedal, FaStar, FaUserCircle, FaSpinner } from 'react-icons/fa';
import { useGameMode } from '../context/GameModeContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { pageTransitionVariants, staggerContainer, staggerItem } from '../utils/animations';
import styles from './Dashboard.module.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const { isGamified, toggleGamified } = useGameMode();
    const { user, loading } = useAuth();

    // Redirect to login if unauthenticated after loading
    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    const mockLeaderboard = [
        { rank: 1, name: 'TheEmperor', xp: 15200 },
        { rank: 2, name: 'CodeNinja', xp: 12400 },
        { rank: 3, name: 'Archmage', xp: 2450 },
        { rank: 4, name: 'Newbie', xp: 850 },
    ];

    if (loading || !user) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', color: 'var(--color-primary-gold)' }}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                >
                    <FaSpinner size={40} />
                </motion.div>
            </div>
        );
    }

    const nextRankXp = 5000; // Placeholder until dynamic rank logic

    return (
        <motion.div
            className={styles.dashboardContainer}
            variants={pageTransitionVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <div className={styles.header}>
                <h2>The Empire Lobby</h2>
                <div className={styles.modeToggle}>
                    <label>Gamified Mode</label>
                    <input
                        type="checkbox"
                        checked={isGamified}
                        onChange={toggleGamified}
                    />
                </div>
            </div>

            <motion.div
                className={styles.grid}
                variants={staggerContainer}
                initial="hidden"
                animate="show"
            >
                {/* Left Sidebar: Profile Preview */}
                <motion.aside variants={staggerItem} className={`${styles.sidebar} card`} layout>
                    <div className={styles.profileHeader}>
                        <motion.div
                            className={styles.avatarLarge}
                            whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(212, 175, 55, 0.4)' }}
                        >
                            {user.photoURL ? (
                                <img src={user.photoURL} alt={user.name} referrerPolicy="no-referrer" />
                            ) : (
                                <FaUserCircle size={60} color="var(--color-primary-gold)" />
                            )}
                        </motion.div>
                        <h3>{user.name}</h3>
                        {isGamified && <p className={styles.rankTitle}>{user.rank || 'Novice'}</p>}
                    </div>

                    <AnimatePresence>
                        {isGamified && (
                            <motion.div
                                className={styles.gamificationSection}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className={styles.xpInfo}>
                                    <span>XP: {user.xp || 0}</span>
                                    <span>Next: {nextRankXp}</span>
                                </div>
                                <div className={styles.xpBarContainer}>
                                    <motion.div
                                        className={styles.xpBarFill}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${((user.xp || 0) / nextRankXp) * 100}%` }}
                                        transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                                    ></motion.div>
                                </div>

                                <div className={styles.badgesWrapper}>
                                    <h4>Badges</h4>
                                    <div className={styles.badgesList}>
                                        {user.badges && user.badges.length > 0 ? (
                                            user.badges.map((badge, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    className={styles.badge}
                                                    title={badge}
                                                    whileHover={{ scale: 1.1, rotate: 10 }}
                                                >
                                                    <FaStar color="var(--color-primary-gold)" />
                                                </motion.div>
                                            ))
                                        ) : (
                                            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>No badges earned yet.</span>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.aside>

                {/* Center: Main Actions */}
                <motion.main variants={staggerItem} className={styles.mainActions}>
                    <motion.div
                        className={`${styles.actionCard} card glow-hover`}
                        whileHover={{ y: -5, scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className={styles.actionIcon}><FaLaptopCode /></div>
                        <h3>Develop Solo</h3>
                        <p>Enter a private chamber with the AI Oracle. No distractions.</p>
                        <button className={styles.primaryBtn} onClick={() => navigate('/solo')}>
                            Start Solo Session
                        </button>
                    </motion.div>

                    <motion.div
                        className={`${styles.actionCard} card glow-hover`}
                        whileHover={{ y: -5, scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className={styles.actionIcon}><FaUsers /></div>
                        <h3>Co-op Chamber</h3>
                        <p>Create or join a real-time collaborative development room.</p>
                        <div className={styles.btnGroup}>
                            <button className={styles.primaryBtn} onClick={() => navigate('/chamber/create')}>
                                Create Chamber
                            </button>
                            <button className={styles.secondaryBtn}>
                                Join Chamber
                            </button>
                        </div>
                    </motion.div>
                </motion.main>

                {/* Right Sidebar: Leaderboard Preview */}
                {isGamified && (
                    <motion.aside variants={staggerItem} className={`${styles.leaderboardPreview} card`}>
                        <div className={styles.lbHeader}>
                            <FaMedal color="var(--color-primary-gold)" size={24} />
                            <h3>Top Tacticians</h3>
                        </div>
                        <ul className={styles.lbList}>
                            {mockLeaderboard.map((user) => (
                                <li key={user.rank} className={styles.lbItem}>
                                    <div className={styles.lbRank}>{user.rank}</div>
                                    <div className={styles.lbName}>{user.name}</div>
                                    <div className={styles.lbXp}>{user.xp} XP</div>
                                </li>
                            ))}
                        </ul>
                        <button className={styles.viewAllBtn} onClick={() => navigate('/leaderboard')}>
                            View Full Leaderboard
                        </button>
                    </motion.aside>
                )}
            </motion.div>
        </motion.div>
    );
};

export default Dashboard;
