import React, { useState } from 'react';
import { FaCrown, FaStar, FaGlobe, FaUsers } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { pageTransitionVariants, staggerContainer, staggerItem } from '../utils/animations';
import styles from './Leaderboard.module.css';

const Leaderboard = () => {
    const [activeTab, setActiveTab] = useState('global');

    const mockGlobalData = [
        { rank: 1, name: 'TheEmperor', xp: 15200, tier: 'Emperor', badges: 12 },
        { rank: 2, name: 'CodeNinja', xp: 12400, tier: 'Warlord', badges: 9 },
        { rank: 3, name: 'ByteMaster', xp: 11050, tier: 'Warlord', badges: 8 },
        { rank: 4, name: 'SyntaxSorcerer', xp: 9800, tier: 'Architect', badges: 7 },
        { rank: 5, name: 'Archmage', xp: 2450, tier: 'Strategist', badges: 3 },
    ];

    return (
        <motion.div
            className={styles.lbContainer}
            variants={pageTransitionVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <header className={styles.lbHeader}>
                <div className={styles.titleWrapper}>
                    <FaCrown className={styles.titleIcon} />
                    <h2>The Empire Standings</h2>
                </div>
                <p>Glory to the highest contributors of the CodeChamber.</p>
            </header>

            <div className={styles.tabsContainer}>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'global' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('global')}
                >
                    <FaGlobe /> Global
                </button>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'chamber' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('chamber')}
                >
                    <FaUsers /> Current Chamber
                </button>
            </div>

            <motion.div
                className={`${styles.tableWrapper} card`}
                variants={staggerContainer}
                initial="hidden"
                animate="show"
            >
                <table className={styles.lbTable}>
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Tactician</th>
                            <th>Tier</th>
                            <th>XP</th>
                            <th>Badges</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockGlobalData.map((user) => (
                            <motion.tr
                                key={user.rank}
                                variants={staggerItem}
                                className={user.name === 'Archmage' ? styles.currentUserRow : ''}
                                whileHover={{ scale: 1.01, backgroundColor: 'rgba(212, 175, 55, 0.05)' }}
                            >
                                <td className={styles.rankCell}>
                                    {user.rank === 1 ? (
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1], filter: ['drop-shadow(0 0 2px rgba(212, 175, 55, 0.5))', 'drop-shadow(0 0 10px rgba(212, 175, 55, 1))', 'drop-shadow(0 0 2px rgba(212, 175, 55, 0.5))'] }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                        >
                                            <FaCrown color="var(--color-primary-gold)" />
                                        </motion.div>
                                    ) : `#${user.rank}`}
                                </td>
                                <td className={styles.nameCell}>
                                    <div className={styles.avatarSmall}></div>
                                    {user.name}
                                </td>
                                <td className={styles.tierCell}>{user.tier}</td>
                                <td className={styles.xpCell}>{user.xp.toLocaleString()}</td>
                                <td className={styles.badgesCell}>
                                    <FaStar color="var(--color-primary-gold)" /> {user.badges}
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>
        </motion.div>
    );
};

export default Leaderboard;
