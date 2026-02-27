import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaMicrophone, FaPaperPlane, FaSmile, FaCrown } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { pageTransitionVariants } from '../utils/animations';
import styles from './ChamberRoom.module.css';

const ChamberRoom = () => {
    const { id } = useParams();
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([
        { id: 1, user: 'TheEmperor', text: 'Welcome to the Chamber. Let us begin.', isOracle: false },
        { id: 2, user: 'Oracle', text: 'I am present. Use /oracle to summon my guidance.', isOracle: true }
    ]);
    const [isRecording, setIsRecording] = useState(false);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (message.trim()) {
            setMessages(prev => [...prev, { id: Date.now(), user: 'You', text: message, isOracle: false }]);
            setMessage('');

            // Simulate oracle response if requested
            if (message.includes('/oracle')) {
                setTimeout(() => {
                    setMessages(prev => [...prev, {
                        id: Date.now() + 1,
                        user: 'Oracle',
                        text: 'I have analyzed the request. The architecture seems sound, but consider edge cases on line 42.',
                        isOracle: true
                    }]);
                }, 1500);
            }
        }
    };

    const members = [
        { name: 'TheEmperor', rank: 'Emperor', icon: <FaCrown color="var(--color-primary-gold)" /> },
        { name: 'Archmage', rank: 'Strategist' },
        { name: 'You', rank: 'Novice' }
    ];

    return (
        <motion.div
            className={styles.roomContainer}
            variants={pageTransitionVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            {/* Left: Members Panel */}
            <aside className={styles.membersPanel}>
                <div className={styles.panelHeader}>
                    <h3>Allies in Chamber</h3>
                    <span className={styles.roomBadge}>#{id || 'MAIN'}</span>
                </div>
                <ul className={styles.memberList}>
                    {members.map((m, idx) => (
                        <li key={idx} className={styles.memberItem}>
                            <div className={styles.memberAvatar}></div>
                            <div className={styles.memberInfo}>
                                <span className={styles.memberName}>{m.icon} {m.name}</span>
                                <span className={styles.memberRank}>{m.rank}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            </aside>

            {/* Center: Real-time Chat & Voice */}
            <main className={styles.chatPanel}>
                <div className={styles.messagesArea}>
                    <AnimatePresence>
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                className={`${styles.messageWrapper} ${msg.isOracle ? styles.oracleMsgWrapper : ''}`}
                                initial={{ opacity: 0, x: msg.user === 'You' ? 20 : -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                            >
                                <div className={styles.msgAvatar}>
                                    {msg.isOracle ? 'O' : msg.user.charAt(0)}
                                </div>
                                <div className={styles.msgContentBox}>
                                    <span className={styles.msgUser}>{msg.user}</span>
                                    <p className={styles.msgText}>{msg.text}</p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                <form className={styles.inputArea} onSubmit={handleSendMessage}>
                    <button type="button" className={styles.iconBtn}><FaSmile /></button>
                    <input
                        type="text"
                        className={styles.msgInput}
                        placeholder="Type a message or use /oracle..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                    <button
                        type="button"
                        className={`${styles.iconBtn} ${isRecording ? styles.recordingBtn : ''}`}
                        onClick={() => setIsRecording(!isRecording)}
                    >
                        <FaMicrophone />
                    </button>
                    <button type="submit" className={styles.sendBtn} disabled={!message.trim()}>
                        <FaPaperPlane />
                    </button>
                </form>
            </main>

            {/* Right: Code Block / Oracle Panel (Placeholder simplified for room mode) */}
            <aside className={styles.toolsPanel}>
                <div className={styles.panelHeader}>
                    <h3>Chamber Oracle</h3>
                </div>
                <div className={styles.toolsContent}>
                    <p className={styles.toolsHint}>Code blocks and active AI analysis will appear here when an ally shares logic or summons the Oracle.</p>
                </div>
            </aside>
        </motion.div>
    );
};

export default ChamberRoom;
