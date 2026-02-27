import React, { useState } from 'react';
import { FaHatWizard, FaPlay, FaRegCopy, FaCheck } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { pageTransitionVariants, staggerContainer, staggerItem } from '../utils/animations';
import styles from './Solo.module.css';

const Solo = () => {
    const [code, setCode] = useState('function calculateFibonacci(n) {\n  if (n <= 1) return n;\n  return calculateFibonacci(n - 1) + calculateFibonacci(n - 2);\n}');
    const [isAsking, setIsAsking] = useState(false);
    const [oracleResponse, setOracleResponse] = useState(null);
    const [copied, setCopied] = useState(false);

    const handleAskOracle = () => {
        setIsAsking(true);
        setOracleResponse(null);

        // Simulate AI API Call
        setTimeout(() => {
            setOracleResponse({
                issue: 'Performance Bottleneck Detected',
                why: 'The current recursive approach has an exponential time complexity O(2^n). It recalculates the same values multiple times, causing severe performance degradation for n > 35.',
                fix: 'function calculateFibonacci(n, memo = {}) {\n  if (n in memo) return memo[n];\n  if (n <= 1) return n;\n  \n  memo[n] = calculateFibonacci(n - 1, memo) + calculateFibonacci(n - 2, memo);\n  return memo[n];\n}',
                optimization: 'Using Top-Down Dynamic Programming (Memoization) reduces the time complexity to O(n) and space complexity to O(n).'
            });
            setIsAsking(false);
        }, 2000);
    };

    const copyFix = () => {
        navigator.clipboard.writeText(oracleResponse.fix);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            className={styles.soloContainer}
            variants={pageTransitionVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <header className={styles.chamberHeader}>
                <h2>Personal Development Chamber</h2>
                <div className={styles.controls}>
                    <button className={styles.runBtn}><FaPlay /> Run Code</button>
                </div>
            </header>

            <div className={styles.workspace}>
                {/* Left: File Explorer Placeholder */}
                <aside className={styles.filePanel}>
                    <div className={styles.panelHeader}>EXPLORER</div>
                    <ul className={styles.fileList}>
                        <li className={styles.activeFile}>fibonacci.js</li>
                        <li>utils.js</li>
                        <li>constants.js</li>
                    </ul>
                </aside>

                {/* Center: Editor Placeholder */}
                <main className={styles.editorPanel}>
                    <div className={styles.editorTabs}>
                        <div className={styles.tab}>fibonacci.js</div>
                    </div>
                    <textarea
                        className={styles.editor}
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        spellCheck="false"
                    />
                </main>

                {/* Right: AI Oracle Panel */}
                <aside className={styles.oraclePanel}>
                    <div className={styles.oracleHeader}>
                        <FaHatWizard size={20} color="var(--color-primary-gold)" />
                        <h3>The Oracle</h3>
                    </div>

                    <div className={styles.oracleContent}>
                        {!oracleResponse && !isAsking && (
                            <motion.div
                                className={styles.oracleEmptyState}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <p>The Oracle slumbers. Write your code and seek its wisdom when you require guidance.</p>
                            </motion.div>
                        )}

                        {isAsking && (
                            <motion.div
                                className={styles.oracleLoading}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <motion.div
                                    className={styles.spinner}
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                ></motion.div>
                                <p>The Oracle is examining your logic...</p>
                            </motion.div>
                        )}

                        {oracleResponse && (
                            <motion.div
                                className={styles.oracleResponseCard}
                                variants={staggerContainer}
                                initial="hidden"
                                animate="show"
                            >
                                <motion.div variants={staggerItem} className={styles.responseSection}>
                                    <h4>🔍 Issue Detected</h4>
                                    <p className={styles.issueText}>{oracleResponse.issue}</p>
                                </motion.div>

                                <motion.div variants={staggerItem} className={styles.responseSection}>
                                    <h4>⚠ Why It Happens</h4>
                                    <p>{oracleResponse.why}</p>
                                </motion.div>

                                <motion.div variants={staggerItem} className={styles.responseSection}>
                                    <div className={styles.fixHeader}>
                                        <h4>🛠 Suggested Fix</h4>
                                        <button className={styles.copyBtn} onClick={copyFix} title="Copy Fix">
                                            {copied ? <FaCheck color="var(--color-primary-gold)" /> : <FaRegCopy />}
                                        </button>
                                    </div>
                                    <pre className={styles.codeBlock}>
                                        <code>{oracleResponse.fix}</code>
                                    </pre>
                                </motion.div>

                                <motion.div variants={staggerItem} className={styles.responseSection}>
                                    <h4>✨ Optimization Tip</h4>
                                    <p className={styles.tipText}>{oracleResponse.optimization}</p>
                                </motion.div>
                            </motion.div>
                        )}
                    </div>

                    <div className={styles.oracleFooter}>
                        <motion.button
                            className={`${styles.askBtn} glow-hover`}
                            onClick={handleAskOracle}
                            disabled={isAsking}
                            whileHover={!isAsking ? { scale: 1.05, boxShadow: '0 0 15px rgba(212, 175, 55, 0.4)' } : {}}
                            whileTap={!isAsking ? { scale: 0.95 } : {}}
                        >
                            Ask Oracle
                        </motion.button>
                    </div>
                </aside>
            </div>
        </motion.div>
    );
};

export default Solo;
