import React from 'react';
import { FaTrophy, FaStar, FaHistory, FaProjectDiagram, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { pageTransitionVariants, staggerContainer, staggerItem } from '../utils/animations';
import styles from './Profile.module.css';

const Profile = () => {
    const { user } = useAuth();

    const formatJoinDate = (timestamp) => {
        if (!timestamp) return 'Recently';
        try {
            // Check if it's a Firestore Timestamp natively or a serializable number
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        } catch (e) {
            return 'Recently';
        }
    };

    const displayUser = {
        name: user?.name || 'Tactician',
        rank: user?.rank || 'Novice',
        xp: user?.xp || 0,
        nextRankXp: 5000,
        joinDate: formatJoinDate(user?.createdAt),
        contributions: 142, // Keeping gamification placeholders for future features
        roomsJoined: 15,
        photoURL: user?.photoURL || null,
        badges: [
            { name: 'First Blood', desc: 'Solved a bug in under 5 minutes' },
            { name: 'Oracle Adept', desc: 'Summoned the AI Oracle 50 times' },
            { name: 'Team Player', desc: 'Participated in 10 different Chambers' }
        ]
    };

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
                {displayUser.photoURL ? (
                    <motion.img
                        src={displayUser.photoURL}
                        alt={displayUser.name}
                        className={styles.avatarHuge}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(212, 175, 55, 0.4)' }}
                        style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #D4AF37' }}
                    />
                ) : (
                    <motion.div
                        className={styles.avatarHuge}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(212, 175, 55, 0.4)' }}
                        style={{ width: '150px', height: '150px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #D4AF37' }}
                    >
                        <FaUserCircle size={150} color="var(--color-primary-gold)" />
                    </motion.div>
                )}
                <div className={styles.userInfo}>
                    <h2>{displayUser.name}</h2>
                    <div className={styles.rankBadge}>
                        <FaTrophy color="var(--color-primary-gold)" />
                        <span>{displayUser.rank}</span>
                    </div>
                    <p className={styles.joinDate}>Member since {displayUser.joinDate}</p>
                </div>

                <div className={styles.xpWidget}>
                    <div className={styles.xpText}>
                        <span className={styles.currentXp}>{displayUser.xp.toLocaleString()} XP</span>
                        <span className={styles.nextXp}>/ {displayUser.nextRankXp.toLocaleString()} XP to Next Rank</span>
                    </div>
                    <div className={styles.progressBar}>
                        <motion.div
                            className={styles.progressFill}
                            initial={{ width: 0 }}
                            animate={{ width: `${(displayUser.xp / displayUser.nextRankXp) * 100}%` }}
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
                    <h3>{displayUser.contributions}</h3>
                    <p>Total Contributions</p>
                </motion.div>
                <motion.div variants={staggerItem} className={`${styles.statCard} card glow-hover`}>
                    <FaHistory className={styles.statIcon} />
                    <h3>{displayUser.roomsJoined}</h3>
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
                    {displayUser.badges.map((badge, idx) => (
                        <motion.div
                            key={idx}
                            variants={staggerItem}
                            className={`${styles.badgeCard} card`}
                            whileHover={{ y: -5, scale: 1.02 }}
                        >
                            <div className={styles.badgeIcon}>
                                <FaStar size={30} color="var(--color-primary-gold)" />
                            </div>
                            <h4>{badge.name}</h4>
                            <p>{badge.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </section>
        </motion.div>
    );
};

export default Profile;
