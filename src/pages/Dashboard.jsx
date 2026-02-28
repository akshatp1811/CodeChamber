import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLaptopCode, FaUsers, FaMedal, FaStar } from 'react-icons/fa';
import { useGameMode } from '../context/GameModeContext';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { pageTransitionVariants, staggerContainer, staggerItem } from '../utils/animations';
import CreateChamberModal from '../components/chamber/CreateChamberModal';
import JoinChamberModal from '../components/chamber/JoinChamberModal';
import styles from './Dashboard.module.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const { isGamified, toggleGamified } = useGameMode();
    const { user } = useAuth();
    const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
    const [isJoinModalOpen, setIsJoinModalOpen] = React.useState(false);

    // Default values if they are undefined or still loading via auth context.
    const displayUser = {
        name: user?.name || 'Tactician',
        rank: user?.rank || 'Novice',
        xp: user?.xp || 0,
        nextRankXp: 5000,
        badges: user?.badges || [],
        photoURL: user?.photoURL || null
    };

    const mockLeaderboard = [
        { rank: 1, name: 'TheEmperor', xp: 15200 },
        { rank: 2, name: 'CodeNinja', xp: 12400 },
        { rank: 3, name: 'Archmage', xp: 2450 },
        { rank: 4, name: 'Newbie', xp: 850 },
    ];

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
                <motion.aside variants={staggerItem} className={`${styles.sidebar} card`}>
                    <div className={styles.profileHeader}>
                        {displayUser.photoURL ? (
                            <motion.img
                                src={displayUser.photoURL}
                                alt={displayUser.name}
                                className={styles.avatarLarge}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                                whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(212, 175, 55, 0.4)' }}
                                style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #D4AF37' }}
                            />
                        ) : (
                            <motion.div
                                className={styles.avatarLarge}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                                whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(212, 175, 55, 0.4)' }}
                                style={{ width: '90px', height: '90px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #D4AF37' }}
                            >
                                <FaUserCircle size={90} color="var(--color-primary-gold)" />
                            </motion.div>
                        )}
                        <h3>{displayUser.name}</h3>
                        {isGamified && <p className={styles.rankTitle}>{displayUser.rank}</p>}
                    </div>

                    {isGamified && (
                        <div className={styles.gamificationSection}>
                            <div className={styles.xpInfo}>
                                <span>XP: {displayUser.xp}</span>
                                <span>Next: {displayUser.nextRankXp}</span>
                            </div>
                            <div className={styles.xpBarContainer}>
                                <motion.div
                                    className={styles.xpBarFill}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(displayUser.xp / displayUser.nextRankXp) * 100}%` }}
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                ></motion.div>
                            </div>

                            <div className={styles.badgesWrapper}>
                                <h4>Badges</h4>
                                <div className={styles.badgesList}>
                                    {displayUser.badges.map((badge, idx) => (
                                        <motion.div
                                            key={idx}
                                            className={styles.badge}
                                            title={badge}
                                            whileHover={{ scale: 1.1, rotate: 10 }}
                                        >
                                            <FaStar color="var(--color-primary-gold)" />
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
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
                            <button className={styles.primaryBtn} onClick={() => setIsCreateModalOpen(true)}>
                                Create Chamber
                            </button>
                            <button className={styles.secondaryBtn} onClick={() => setIsJoinModalOpen(true)}>
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

            <CreateChamberModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />

            <JoinChamberModal
                isOpen={isJoinModalOpen}
                onClose={() => setIsJoinModalOpen(false)}
            />
        </motion.div>
    );
};

export default Dashboard;
