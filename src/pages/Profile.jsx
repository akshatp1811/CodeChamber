import React from 'react';
import { FaTrophy, FaStar, FaHistory, FaProjectDiagram } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { pageTransitionVariants, staggerContainer, staggerItem } from '../utils/animations';
import styles from './Profile.module.css';

const Profile = () => {
    const user = {
        name: 'Archmage',
        rank: 'Strategist',
        xp: 2450,
        nextRankXp: 5000,
        joinDate: 'Oct 2026',
        contributions: 142,
        roomsJoined: 15,
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
                <motion.div
                    className={styles.avatarHuge}
                    whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(212, 175, 55, 0.4)' }}
                ></motion.div>
                <div className={styles.userInfo}>
                    <h2>{user.name}</h2>
                    <div className={styles.rankBadge}>
                        <FaTrophy color="var(--color-primary-gold)" />
                        <span>{user.rank}</span>
                    </div>
                    <p className={styles.joinDate}>Member since {user.joinDate}</p>
                </div>

                <div className={styles.xpWidget}>
                    <div className={styles.xpText}>
                        <span className={styles.currentXp}>{user.xp.toLocaleString()} XP</span>
                        <span className={styles.nextXp}>/ {user.nextRankXp.toLocaleString()} XP to Next Rank</span>
                    </div>
                    <div className={styles.progressBar}>
                        <motion.div
                            className={styles.progressFill}
                            initial={{ width: 0 }}
                            animate={{ width: `${(user.xp / user.nextRankXp) * 100}%` }}
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
                    <h3>{user.contributions}</h3>
                    <p>Total Contributions</p>
                </motion.div>
                <motion.div variants={staggerItem} className={`${styles.statCard} card glow-hover`}>
                    <FaHistory className={styles.statIcon} />
                    <h3>{user.roomsJoined}</h3>
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
                    {user.badges.map((badge, idx) => (
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
