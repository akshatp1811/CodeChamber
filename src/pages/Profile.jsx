import React from 'react';
import { FaTrophy, FaStar, FaHistory, FaProjectDiagram, FaUserCircle, FaSpinner } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { pageTransitionVariants, staggerContainer, staggerItem } from '../utils/animations';
import { useAuth } from '../context/AuthContext';
import styles from './Profile.module.css';

const Profile = () => {
    const { user, loading } = useAuth();

    if (loading || !user) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', color: 'var(--color-primary-gold)' }}>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                    <FaSpinner size={40} />
                </motion.div>
            </div>
        );
    }

    const nextRankXp = 5000;

    // Format the firebase timestamp safely
    const joinDate = user.createdAt?.toDate ?
        user.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        : 'Recently';

    return (
        <motion.div
            className={styles.profileContainer}
            variants={pageTransitionVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <motion.header
                className={`${styles.profileHeader} card`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <motion.div
                    className={styles.avatarHuge}
                    whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(212, 175, 55, 0.4)' }}
                >
                    {user.photoURL ? (
                        <img src={user.photoURL} alt={user.name} referrerPolicy="no-referrer" />
                    ) : (
                        <FaUserCircle size={80} color="var(--color-primary-gold)" />
                    )}
                </motion.div>
                <div className={styles.userInfo}>
                    <h2>{user.name}</h2>
                    <div className={styles.rankBadge}>
                        <FaTrophy color="var(--color-primary-gold)" />
                        <span>{user.rank || 'Novice'}</span>
                    </div>
                    <p className={styles.joinDate}>Member since {joinDate}</p>
                </div>

                <div className={styles.xpWidget}>
                    <div className={styles.xpText}>
                        <span className={styles.currentXp}>{(user.xp || 0).toLocaleString()} XP</span>
                        <span className={styles.nextXp}>/ {nextRankXp.toLocaleString()} XP to Next Rank</span>
                    </div>
                    <div className={styles.progressBar}>
                        <motion.div
                            className={styles.progressFill}
                            initial={{ width: 0 }}
                            animate={{ width: `${((user.xp || 0) / nextRankXp) * 100}%` }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                        ></motion.div>
                    </div>
                </div>
            </motion.header>

            <motion.div
                className={styles.statsGrid}
                variants={staggerContainer}
                initial="hidden"
                animate="show"
            >
                <motion.div variants={staggerItem} className={`${styles.statCard} card glow-hover`}>
                    <FaProjectDiagram className={styles.statIcon} />
                    <h3>{user.contributions || 0}</h3>
                    <p>Total Contributions</p>
                </motion.div>
                <motion.div variants={staggerItem} className={`${styles.statCard} card glow-hover`}>
                    <FaHistory className={styles.statIcon} />
                    <h3>{user.roomsJoined || 0}</h3>
                    <p>Chambers Conquered</p>
                </motion.div>
            </motion.div>

            <section className={styles.badgesSection}>
                <div className={styles.sectionHeader}>
                    <h3>Honors & Badges</h3>
                    <div className={styles.divider}></div>
                </div>

                <motion.div
                    className={styles.badgesGrid}
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.2 }}
                >
                    {user.badges && user.badges.length > 0 ? (
                        user.badges.map((badge, idx) => (
                            <motion.div
                                key={idx}
                                variants={staggerItem}
                                className={`${styles.badgeCard} card`}
                                whileHover={{ y: -5, scale: 1.02 }}
                            >
                                <div className={styles.badgeIcon}>
                                    <FaStar size={30} color="var(--color-primary-gold)" />
                                </div>
                                <h4>{badge.name || badge}</h4>
                                <p>{badge.desc || 'An honorable CodeChamber badge.'}</p>
                            </motion.div>
                        ))
                    ) : (
                        <p style={{ color: 'var(--color-text-muted)' }}>No badges earned yet. Complete challenges to start collecting!</p>
                    )}
                </motion.div>
            </section>
        </motion.div>
    );
};

export default Profile;
