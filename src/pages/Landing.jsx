import React from 'react';
import { useNavigate } from 'react-router-dom';
import ParticleBackground from '../components/particles/ParticleBackground';
import GoldenEmpireDivider from '../components/ui/GoldenEmpireDivider';
import { useSound } from '../context/SoundContext';
import styles from './Landing.module.css';
import { FaHatWizard, FaUsers, FaMedal, FaLaptopCode } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { pageTransitionVariants, staggerContainer, staggerItem } from '../utils/animations';

import logoImg from '../assets/logo.png';

const Landing = () => {
    const navigate = useNavigate();
    const { playSound } = useSound();

    const handleEnterChamber = () => {
        playSound('chime');
        navigate('/login');
    };

    const handleScrollToFeatures = () => {
        playSound('parchment');
        document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
    };

    // Hero Custom Entry Animations (300ms ease-in-out + specific delays)
    const fadeUpVariant = (delayMs) => ({
        hidden: { opacity: 0, y: 20 },
        show: {
            opacity: 1, y: 0,
            transition: { duration: 0.3, delay: delayMs / 1000, ease: "easeInOut" }
        }
    });

    return (
        <motion.div
            className={styles.landingContainer}
            variants={pageTransitionVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransitionVariants.transition}
        >
            <ParticleBackground />

            {/* HERO SECTION */}
            <section className={styles.hero}>
                <div className={styles.heroContent}>

                    {/* Floating Logo */}
                    <div className={styles.heroLogoWrapper}>
                        <img
                            src={logoImg}
                            alt="CodeChamber Logo"
                            className={styles.heroLogo}
                        />
                    </div>

                    {/* Shimmering Title */}
                    <motion.h1
                        className={styles.heroTitle}
                        variants={fadeUpVariant(200)}
                        initial="hidden"
                        animate="show"
                    >
                        CodeChamber
                    </motion.h1>

                    <motion.h2
                        className={styles.heroSubtitle}
                        variants={fadeUpVariant(400)}
                        initial="hidden"
                        animate="show"
                    >
                        Where Developers Unite and AI Guides
                    </motion.h2>

                    <motion.p
                        className={styles.heroDescription}
                        variants={fadeUpVariant(400)}
                        initial="hidden"
                        animate="show"
                    >
                        A real-time AI-powered development chamber built for collaboration, courage, and innovation.
                    </motion.p>

                    <motion.div
                        className={styles.heroActions}
                        variants={fadeUpVariant(600)}
                        initial="hidden"
                        animate="show"
                    >
                        <motion.button
                            className={`${styles.primaryBtn} glow-hover`}
                            onClick={handleEnterChamber}
                            whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(246, 211, 101, 0.4)' }}
                            transition={{ duration: 0.2 }}
                        >
                            [ Enter the Chamber ]
                        </motion.button>
                        <motion.button
                            className={`${styles.secondaryBtn} glow-hover`}
                            onClick={handleScrollToFeatures}
                            whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(255, 255, 255, 0.2)' }}
                            transition={{ duration: 0.2 }}
                        >
                            [ View Features ]
                        </motion.button>
                    </motion.div>
                </div>
            </section>

            <GoldenEmpireDivider />

            {/* FEATURES SECTION */}
            <section id="features" className={styles.features}>
                <div className={styles.sectionHeader}>
                    <h2>The Arsenal</h2>
                    <div className={styles.divider}></div>
                </div>

                <motion.div
                    className={styles.featuresGrid}
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.2 }}
                >
                    <motion.div variants={staggerItem} className={`${styles.featureCard} card`}>
                        <FaHatWizard className={styles.featureIcon} />
                        <h3>AI Oracle Guidance</h3>
                        <p>Summon advanced intelligence to review, optimize, and fix your code in real-time.</p>
                    </motion.div>
                    <motion.div variants={staggerItem} className={`${styles.featureCard} card`}>
                        <FaUsers className={styles.featureIcon} />
                        <h3>Real-Time Collaboration</h3>
                        <p>Code alongside your peers seamlessly in live, synchronized development rooms.</p>
                    </motion.div>
                    <motion.div variants={staggerItem} className={`${styles.featureCard} card`}>
                        <FaMedal className={styles.featureIcon} />
                        <h3>Gamified Progression</h3>
                        <p>Earn XP, rise through ranks, and claim the Emperor's crown on the global leaderboard.</p>
                    </motion.div>
                    <motion.div variants={staggerItem} className={`${styles.featureCard} card`}>
                        <FaLaptopCode className={styles.featureIcon} />
                        <h3>Solo or Team Mode</h3>
                        <p>Forge ahead independently in a personal chamber, or invite allies to conquer bugs together.</p>
                    </motion.div>
                </motion.div>
            </section>

            {/* HOW IT WORKS SECTION */}
            <section className={styles.howItWorks}>
                <div className={styles.sectionHeader}>
                    <h2>The Journey</h2>
                    <div className={styles.divider}></div>
                </div>

                <div className={styles.stepsContainer}>
                    <div className={styles.step}>
                        <div className={styles.stepNumber}>1</div>
                        <h3>Choose Your Mode</h3>
                        <p>Decide whether to embrace gamification or stick to pure development.</p>
                    </div>

                    <div className={styles.stepConnector}></div>

                    <div className={styles.step}>
                        <div className={styles.stepNumber}>2</div>
                        <h3>Enter the Chamber</h3>
                        <p>Create a secure room or join an existing instance to begin.</p>
                    </div>

                    <div className={styles.stepConnector}></div>

                    <div className={styles.step}>
                        <div className={styles.stepNumber}>3</div>
                        <h3>Collaborate & Rise</h3>
                        <p>Write code, consult the Oracle, and rise to glory.</p>
                    </div>
                </div>
            </section>
        </motion.div>
    );
};

export default Landing;
