import React, { useState, useEffect, useRef } from 'react';
import { FaHatWizard, FaPlay, FaRegCopy, FaCheck, FaMagic } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { io } from 'socket.io-client';
import { pageTransitionVariants, staggerContainer, staggerItem } from '../utils/animations';
import styles from './Solo.module.css';

const Solo = () => {
    const [code, setCode] = useState('function calculateFibonacci(n) {\n  if (n <= 1) return n;\n  return calculateFibonacci(n - 1) + calculateFibonacci(n - 2);\n}');
    const [isAsking, setIsAsking] = useState(false);
    const [oracleResponse, setOracleResponse] = useState(null);
    const [copied, setCopied] = useState(false);
    const [language, setLanguage] = useState('javascript');
    const [isGenerating, setIsGenerating] = useState(false);

    const socketRef = useRef();
    const editorRef = useRef();

    useEffect(() => {
        socketRef.current = io('http://localhost:5000');

        socketRef.current.on('ai-generating', (status) => {
            setIsGenerating(status);
        });

        socketRef.current.on('ai-generated-code', (data) => {
            setCode(data.code);
            // Simulate oracle feedback for the generated code
            setOracleResponse({
                issue: 'Code Generated Successfully',
                why: 'The Oracle has manifested the logic you requested.',
                fix: data.code,
                optimization: 'Review the generated logic for edge cases.'
            });
        });

        return () => socketRef.current.disconnect();
    }, []);

    const handleAskOracle = () => {
        setIsAsking(true);
        setOracleResponse(null);

        // Simulate a "thinking" phase before sending to backend for analysis
        // In a full implementation, we'd have a specific socket event for analysis
        setTimeout(() => {
            // Re-using the generateCodeOnly for simple logic or we could add an analyze event
            socketRef.current.emit('ai-generate', {
                roomId: 'SOLO_' + Date.now(),
                instruction: 'Review this code for performance and provide an optimized version.',
                code,
                language
            });
            setIsAsking(false);
        }, 1000);
    };

    const handleGenerate = (e) => {
        if (e.key === 'Enter' && code.includes('/generate')) {
            const lines = code.split('\n');
            const lastLine = lines[lines.length - 1];
            if (lastLine.startsWith('/generate')) {
                const instruction = lastLine.replace('/generate', '').trim();
                const codeContext = lines.slice(0, -1).join('\n');

                socketRef.current.emit('ai-generate', {
                    roomId: 'SOLO_GEN',
                    instruction,
                    code: codeContext,
                    language
                });

                // Remove the /generate line immediately
                setCode(codeContext);
            }
        }
    };

    const handleImproveCode = () => {
        const selection = window.getSelection().toString();
        if (selection) {
            socketRef.current.emit('ai-generate', {
                roomId: 'SOLO_IMPROVE',
                instruction: 'Improve this specific code snippet for readability and performance.',
                code: selection,
                language
            });
        } else {
            handleAskOracle();
        }
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
                    <button className={styles.improveBtn} onClick={handleImproveCode} disabled={isGenerating}>
                        <FaMagic /> Improve Code
                    </button>
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
                    <div className={styles.editorWrapper}>
                        {isGenerating && (
                            <div className={styles.editorOverlay}>
                                <div className={styles.loadingPulse}></div>
                                <span>The Oracle is weaving code...</span>
                            </div>
                        )}
                        <textarea
                            ref={editorRef}
                            className={styles.editor}
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            onKeyDown={handleGenerate}
                            spellCheck="false"
                        />
                    </div>
                </main>

                {/* Right: AI Oracle Panel */}
                <aside className={styles.oraclePanel}>
                    <div className={styles.oracleHeader}>
                        <FaHatWizard size={20} color="var(--color-primary-gold)" />
                        <h3>The Oracle</h3>
                    </div>

                    <div className={styles.oracleContent}>
                        {!oracleResponse && !isAsking && !isGenerating && (
                            <motion.div
                                className={styles.oracleEmptyState}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <p>The Oracle slumbers. Write your code and seek its wisdom when you require guidance.</p>
                                <p className={styles.hintText}>Try typing <code>/generate &lt;prompt&gt;</code> or select code and click Improve.</p>
                            </motion.div>
                        )}

                        {(isAsking || isGenerating) && (
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
                                    <h4>🔍 Analysis</h4>
                                    <p className={styles.issueText}>{oracleResponse.issue}</p>
                                </motion.div>

                                <motion.div variants={staggerItem} className={styles.responseSection}>
                                    <h4>⚠ Context</h4>
                                    <p>{oracleResponse.why}</p>
                                </motion.div>

                                <motion.div variants={staggerItem} className={styles.responseSection}>
                                    <div className={styles.fixHeader}>
                                        <h4>🛠 Manifestation</h4>
                                        <button className={styles.copyBtn} onClick={copyFix} title="Copy Fix">
                                            {copied ? <FaCheck color="var(--color-primary-gold)" /> : <FaRegCopy />}
                                        </button>
                                    </div>
                                    <pre className={styles.codeBlock}>
                                        <code>{oracleResponse.fix}</code>
                                    </pre>
                                </motion.div>

                                <motion.div variants={staggerItem} className={styles.responseSection}>
                                    <h4>✨ Wisdom</h4>
                                    <p className={styles.tipText}>{oracleResponse.optimization}</p>
                                </motion.div>
                            </motion.div>
                        )}
                    </div>

                    <div className={styles.oracleFooter}>
                        <motion.button
                            className={`${styles.askBtn} glow-hover`}
                            onClick={handleAskOracle}
                            disabled={isAsking || isGenerating}
                            whileHover={!(isAsking || isGenerating) ? { scale: 1.05, boxShadow: '0 0 15px rgba(212, 175, 55, 0.4)' } : {}}
                            whileTap={!(isAsking || isGenerating) ? { scale: 0.95 } : {}}
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
