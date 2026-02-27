import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { FaMicrophone, FaPaperPlane, FaSmile, FaCrown, FaRobot } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { pageTransitionVariants } from '../utils/animations';
import styles from './ChamberRoom.module.css';

const ChamberRoom = () => {
    const { id } = useParams();
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([
        { id: 1, user: 'System', text: 'Welcome to the Chamber. Connecting to the Oracle...', isOracle: false }
    ]);
    const [isRecording, setIsRecording] = useState(false);
    const [isOracleTyping, setIsOracleTyping] = useState(false);
    const [code, setCode] = useState('// Your shared code will appear here...');
    const [language, setLanguage] = useState('javascript');

    const socketRef = useRef();
    const messagesEndRef = useRef(null);

    useEffect(() => {
        // Connect to backend
        socketRef.current = io('http://localhost:5000');

        socketRef.current.emit('join-room', id || 'MAIN');

        socketRef.current.on('receive-message', (msg) => {
            setMessages(prev => [...prev, msg]);
        });

        socketRef.current.on('oracle-typing', (isTyping) => {
            setIsOracleTyping(isTyping);
        });

        socketRef.current.on('code-sync', (data) => {
            setCode(data.code);
            setLanguage(data.language);
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, [id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOracleTyping]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (message.trim()) {
            socketRef.current.emit('send-message', {
                roomId: id || 'MAIN',
                message,
                user: 'You' // Hardcoded for now, should come from auth
            });
            setMessage('');
        }
    };

    const handleCodeChange = (newCode) => {
        setCode(newCode);
        socketRef.current.emit('code-update', {
            roomId: id || 'MAIN',
            code: newCode,
            language
        });
    };

    const members = [
        { name: 'TheEmperor', rank: 'Emperor', icon: <FaCrown color="var(--color-primary-gold)" /> },
        { name: 'Archmage', rank: 'Strategist' },
        { name: 'You', rank: 'Novice' }
    ];

    const oracleMessages = messages.filter(m => m.isOracle);
    const latestOracleResponse = oracleMessages[oracleMessages.length - 1];

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
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className={styles.msgAvatar}>
                                    {msg.isOracle ? <FaRobot /> : msg.user.charAt(0)}
                                </div>
                                <div className={styles.msgContentBox}>
                                    <span className={styles.msgUser}>{msg.user}</span>
                                    {msg.isOracle ? (
                                        <div className={styles.oraclePreview}>
                                            {msg.text.substring(0, 100)}...
                                            <span className={styles.oracleHint}>Details in Oracle Panel →</span>
                                        </div>
                                    ) : (
                                        <p className={styles.msgText}>{msg.text}</p>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {isOracleTyping && (
                        <motion.div className={styles.oracleLoadingMsg} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div className={styles.typingDot}></div>
                            <div className={styles.typingDot}></div>
                            <div className={styles.typingDot}></div>
                            <span>The Oracle is consulting the scrolls...</span>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form className={styles.inputArea} onSubmit={handleSendMessage}>
                    <button type="button" className={styles.iconBtn}><FaSmile /></button>
                    <input
                        type="text"
                        className={styles.msgInput}
                        placeholder="Ask the Oracle (@AI)..."
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

            {/* Right: Oracle Panel */}
            <aside className={styles.toolsPanel}>
                <div className={styles.panelHeader}>
                    <h3>The Great Oracle</h3>
                    <FaRobot color="var(--color-primary-gold)" />
                </div>
                <div className={styles.oracleContent}>
                    {latestOracleResponse ? (
                        <motion.div
                            className={styles.oracleFullResponse}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    code({ node, inline, className, children, ...props }) {
                                        const match = /language-(\w+)/.exec(className || '')
                                        return !inline && match ? (
                                            <SyntaxHighlighter
                                                style={vscDarkPlus}
                                                language={match[1]}
                                                PreTag="div"
                                                {...props}
                                            >
                                                {String(children).replace(/\n$/, '')}
                                            </SyntaxHighlighter>
                                        ) : (
                                            <code className={className} {...props}>
                                                {children}
                                            </code>
                                        )
                                    }
                                }}
                            >
                                {latestOracleResponse.text}
                            </ReactMarkdown>
                        </motion.div>
                    ) : (
                        <div className={styles.toolsContent}>
                            <p className={styles.toolsHint}>
                                Type <strong>@AI &lt;question&gt;</strong> in the chat to summon the Oracle's wisdom.
                                It can see your recent messages and the shared code.
                            </p>
                        </div>
                    )}
                </div>
            </aside>
        </motion.div>
    );
};

export default ChamberRoom;
