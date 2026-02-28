import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { FaMicrophone, FaPaperPlane, FaSmile, FaCrown, FaRobot, FaPlay, FaTerminal, FaFileCode, FaFolder, FaPlus, FaTrash, FaFolderPlus, FaChevronRight, FaChevronDown } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { doc, onSnapshot, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { pageTransitionVariants } from '../utils/animations';
import styles from './ChamberRoom.module.css';

const ChamberRoom = () => {
    const { id } = useParams();
    const { user } = useAuth();

    // Realtime member tracking state
    const [roomMembers, setRoomMembers] = useState([]);

    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([
        { id: 1, user: 'System', text: 'Welcome to the Chamber. Connecting to the Oracle...', isOracle: false }
    ]);
    const [isRecording, setIsRecording] = useState(false);
    const [isOracleTyping, setIsOracleTyping] = useState(false);
    const [files, setFiles] = useState([]);
    const [activeFileId, setActiveFileId] = useState(null);
    const [expandedFolders, setExpandedFolders] = useState([]);
    const [language, setLanguage] = useState('javascript');
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [oracleMessages, setOracleMessages] = useState([]);
    const [oracleInput, setOracleInput] = useState('');
    const [chatHeight, setChatHeight] = useState(50); // percentage for main chat
    const isResizing = useRef(false);

    const socketRef = useRef();
    const editorRef = useRef();
    const messagesEndRef = useRef(null);
    const oracleChatEndRef = useRef(null);

    useEffect(() => {
        // Connect to backend
        socketRef.current = io('http://localhost:5000');

        socketRef.current.emit('join-room', id || 'MAIN');

        socketRef.current.on('room-ready', (data) => {
            setFiles(data.files);
            setActiveFileId(data.activeFileId);
            setLanguage(data.language);
            if (data.oracleChat) setOracleMessages(data.oracleChat);
            if (data.messages && data.messages.length > 0) {
                setMessages(data.messages);
            }
        });

        socketRef.current.on('file-sync', (data) => {
            setFiles(prev => prev.map(f => f.id === data.fileId ? { ...f, content: data.content } : f));
        });

        socketRef.current.on('file-created', (file) => {
            setFiles(prev => [...prev, file]);
        });

        socketRef.current.on('file-deleted', (fileId) => {
            setFiles(prev => prev.filter(f => f.id !== fileId && f.parentId !== fileId));
            setActiveFileId(prevId => prevId === fileId ? null : prevId);
        });

        socketRef.current.on('folder-created', (folder) => {
            setFiles(prev => [...prev, folder]);
        });

        socketRef.current.on('active-file-synced', (fileId) => {
            setActiveFileId(fileId);
        });

        socketRef.current.on('receive-message', (msg) => {
            setMessages(prev => [...prev, msg]);
        });

        socketRef.current.on('oracle-typing', (isTyping) => {
            setIsOracleTyping(isTyping);
        });

        socketRef.current.on('oracle-chat-response', (data) => {
            setOracleMessages(prev => [...prev, { sender: 'oracle', text: data.text }]);
        });

        socketRef.current.on('oracle-chat-sync', (history) => {
            setOracleMessages(history);
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, [id]);

    // Firestore Integration: Realtime Members Sync
    useEffect(() => {
        if (!user || !id) return;

        const roomRef = doc(db, 'rooms', id);

        const unsubscribe = onSnapshot(roomRef, async (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();

                // Add self if not in members list
                if (data.members && !data.members.includes(user.uid)) {
                    try {
                        await updateDoc(roomRef, { members: arrayUnion(user.uid) });
                    } catch (e) {
                        console.error('Failed to append to members list', e);
                    }
                }

                // Fetch real user profiles for each UID in members array
                if (data.members) {
                    const profiles = await Promise.all(
                        data.members.map(async (uid) => {
                            const userDoc = await getDoc(doc(db, 'users', uid));
                            if (userDoc.exists()) {
                                return { uid, ...userDoc.data() };
                            }
                            return { uid, name: 'Unknown Tactician', rank: 'Novice' };
                        })
                    );
                    setRoomMembers(profiles);
                }
            }
        });

        return () => unsubscribe();
    }, [id, user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOracleTyping]);

    useEffect(() => {
        oracleChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [oracleMessages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (message.trim()) {
            socketRef.current.emit('send-message', {
                roomId: id || 'MAIN',
                message,
                user: user?.name || 'You'
            });
            setMessage('');
        }
    };

    const handleFileUpdate = (newContent) => {
        setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, content: newContent } : f));
        socketRef.current.emit('file-update', {
            roomId: id || 'MAIN',
            fileId: activeFileId,
            content: newContent
        });
    };

    const handleFileCreate = (parentId = null) => {
        const name = prompt('Enter file name:');
        if (name) {
            const newFile = {
                id: Date.now().toString(),
                name,
                type: 'file',
                content: '// New file...',
                parentId
            };
            setFiles(prev => [...prev, newFile]);
            setActiveFileId(newFile.id);
            socketRef.current.emit('file-create', { roomId: id || 'MAIN', file: newFile });
        }
    };

    const handleFolderCreate = (parentId = null) => {
        const name = prompt('Enter folder name:');
        if (name) {
            const newFolder = {
                id: Date.now().toString(),
                name,
                type: 'folder',
                parentId
            };
            setFiles(prev => [...prev, newFolder]);
            socketRef.current.emit('folder-create', { roomId: id || 'MAIN', folder: newFolder });
        }
    };

    const handleFileDelete = (fileId, e) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this?')) {
            setFiles(prev => prev.filter(f => f.id !== fileId && f.parentId !== fileId));
            socketRef.current.emit('file-delete', { roomId: id || 'MAIN', fileId });
            if (activeFileId === fileId) setActiveFileId(null);
        }
    };

    const handleFileSelect = (fileId) => {
        setActiveFileId(fileId);
        socketRef.current.emit('active-file-change', { roomId: id || 'MAIN', fileId });
    };

    const toggleFolder = (folderId) => {
        setExpandedFolders(prev =>
            prev.includes(folderId) ? prev.filter(fid => fid !== folderId) : [...prev, folderId]
        );
    };

    const handleEditorDidMount = (editor) => {
        editorRef.current = editor;
    };

    const handleRunCode = () => {
        setIsRunning(true);
        setOutput('');

        const originalLog = console.log;
        const originalError = console.error;
        let logs = [];

        console.log = (...args) => {
            logs.push(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' '));
        };
        console.error = (...args) => {
            logs.push(`Error: ${args.join(' ')}`);
        };

        try {
            // eslint-disable-next-line no-eval
            eval(activeFile?.content || '');
            setOutput(logs.join('\n') || 'Program executed successfully (no output).');
        } catch (err) {
            setOutput(`Execution Error: ${err.message}`);
        } finally {
            console.log = originalLog;
            console.error = originalError;
            setIsRunning(false);
        }
    };

    const handleOracleChat = (e) => {
        if (e) e.preventDefault();
        const question = oracleInput.trim();
        if (!question) return;

        const newUserMsg = { sender: 'user', text: question };
        setOracleMessages(prev => [...prev, newUserMsg]);
        setOracleInput('');

        socketRef.current.emit('oracle-chat-query', {
            roomId: id || 'MAIN',
            question,
            code: activeFile?.content || '',
            language,
            chatHistory: oracleMessages
        });
    };

    const startResizing = (e) => {
        isResizing.current = true;
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', stopResizing);
        document.body.style.cursor = 'ns-resize';
    };

    const handleMouseMove = (e) => {
        if (!isResizing.current) return;
        const container = document.getElementById('chat-column');
        if (container) {
            const rect = container.getBoundingClientRect();
            const newHeight = ((e.clientY - rect.top) / rect.height) * 100;
            if (newHeight > 20 && newHeight < 80) {
                setChatHeight(newHeight);
            }
        }
    };

    const stopResizing = () => {
        isResizing.current = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', stopResizing);
        document.body.style.cursor = 'default';
    };

    const activeFile = files.find(f => f.id === activeFileId);

    return (
        <motion.div
            className={styles.roomContainer}
            variants={pageTransitionVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            {/* Left: Members & Explorer Panel */}
            <aside className={styles.leftPanel}>
                <section className={styles.membersArea}>
                    <div className={styles.panelHeader}>
                        <span>CHAMBER MEMBERS</span>
                        <FaCrown color="var(--color-primary-gold)" />
                    </div>
                    <ul className={styles.memberList}>
                        {roomMembers.map((m) => (
                            <li key={m.uid} className={styles.memberItem}>
                                <div className={styles.memberAvatar}>
                                    {m.photoURL ? (
                                        <img src={m.photoURL} alt={m.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                    ) : (
                                        m.rank === 'Emperor' ? <FaCrown color="var(--color-primary-gold)" /> : m.name[0]
                                    )}
                                </div>
                                <div className={styles.memberInfo}>
                                    <span className={styles.memberName}>{m.uid === user?.uid ? `${m.name} (You)` : m.name}</span>
                                    <span className={styles.memberRank}>{m.rank}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className={styles.explorerArea}>
                    <div className={styles.panelHeader}>
                        <span>EXPLORER</span>
                        <div className={styles.explorerActions}>
                            <button onClick={() => handleFileCreate()} title="New File"><FaPlus size={12} /></button>
                            <button onClick={() => handleFolderCreate()} title="New Folder"><FaFolderPlus size={12} /></button>
                        </div>
                    </div>
                    <div className={styles.fileTree}>
                        {files.filter(f => !f.parentId).map(file => (
                            <FileItem
                                key={file.id}
                                item={file}
                                files={files}
                                activeId={activeFileId}
                                expanded={expandedFolders}
                                onSelect={handleFileSelect}
                                onToggle={toggleFolder}
                                onDelete={handleFileDelete}
                                onCreateFile={handleFileCreate}
                                onCreateFolder={handleFolderCreate}
                            />
                        ))}
                    </div>
                </section>
            </aside>

            {/* Middle: Shared Code Editor (50% Width) */}
            <section className={styles.editorPanel}>
                <div className={styles.editorTabs}>
                    <div className={styles.tab}>{activeFile?.name || 'No file selected'}</div>
                    <button className={styles.runBtn} onClick={handleRunCode} disabled={isRunning}>
                        <FaPlay /> {isRunning ? 'Running...' : 'Run Code'}
                    </button>
                </div>
                <div className={styles.editorContainer}>
                    <Editor
                        height="100%"
                        language={language}
                        theme="vs-dark"
                        value={activeFile?.content || ''}
                        onChange={handleFileUpdate}
                        onMount={handleEditorDidMount}
                        options={{
                            fontSize: 14,
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            fontFamily: 'JetBrains Mono, monospace',
                            padding: { top: 16 }
                        }}
                    />
                </div>
                {output && (
                    <div className={styles.terminal}>
                        <div className={styles.terminalHeader}>
                            <FaTerminal size={12} /> TERMINAL
                            <button className={styles.clearBtn} onClick={() => setOutput('')}>Clear</button>
                        </div>
                        <pre className={styles.terminalOutput}>{output}</pre>
                    </div>
                )}
            </section>

            {/* Right: Stacked Chat Boxes (50% Width) */}
            <div className={styles.rightColumn} id="chat-column">
                <main className={styles.chatPanel} style={{ height: `${chatHeight}%` }}>
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
                                                <span className={styles.oracleHint}>Details in Oracle Panel ↓</span>
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

                <div className={styles.verticalResizer} onMouseDown={startResizing} />

                <aside className={styles.toolsPanel} style={{ height: `${100 - chatHeight}%` }}>
                    <div className={styles.panelHeader}>
                        <h3>The Great Oracle's Sanctum</h3>
                        <FaRobot color="var(--color-primary-gold)" />
                    </div>

                    <div className={styles.oracleChatArea}>
                        {oracleMessages.length === 0 ? (
                            <div className={styles.oracleEmptyState}>
                                <p>The Oracle's wisdom is absolute. Speak and be enlightened.</p>
                                <p className={styles.hintText}>Type <strong>@AI</strong> in main chat or message below.</p>
                            </div>
                        ) : (
                            <div className={styles.oracleMessages}>
                                {oracleMessages.map((msg, idx) => (
                                    <div key={idx} className={`${styles.oracleMsg} ${msg.sender === 'user' ? styles.userMsg : styles.oracleMsgBubble}`}>
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {msg.text}
                                        </ReactMarkdown>
                                    </div>
                                ))}
                                <div ref={oracleChatEndRef} />
                            </div>
                        )}
                        {isOracleTyping && (
                            <div className={styles.oracleTyping}>
                                <div className={styles.typingDot}></div>
                                <div className={styles.typingDot}></div>
                                <div className={styles.typingDot}></div>
                            </div>
                        )}
                    </div>

                    <form className={styles.oracleInputForm} onSubmit={handleOracleChat}>
                        <input
                            type="text"
                            placeholder="Seek guidance..."
                            value={oracleInput}
                            onChange={(e) => setOracleInput(e.target.value)}
                            disabled={isOracleTyping}
                        />
                        <button type="submit" disabled={isOracleTyping || !oracleInput.trim()}>
                            <FaPaperPlane />
                        </button>
                    </form>
                </aside>
            </div>
        </motion.div>
    );
};

const FileItem = ({ item, files, activeId, expanded, onSelect, onToggle, onDelete, onCreateFile, onCreateFolder }) => {
    const isFolder = item.type === 'folder';
    const isExpanded = expanded.includes(item.id);
    const children = files.filter(f => f.parentId === item.id);

    return (
        <div className={styles.treeItemWrapper}>
            <div
                className={`${styles.treeItem} ${activeId === item.id ? styles.activeTreeItem : ''}`}
                onClick={() => isFolder ? onToggle(item.id) : onSelect(item.id)}
            >
                <div className={styles.itemMain}>
                    {isFolder ? (isExpanded ? <FaChevronDown size={10} /> : <FaChevronRight size={10} />) : <FaFileCode size={14} />}
                    {isFolder && <FaFolder size={14} color="var(--color-primary-gold)" />}
                    <span className={styles.itemName}>{item.name}</span>
                </div>
                <div className={styles.itemActions}>
                    {isFolder && <FaPlus size={10} onClick={(e) => { e.stopPropagation(); onCreateFile(item.id); }} title="New File" />}
                    {isFolder && <FaFolderPlus size={10} onClick={(e) => { e.stopPropagation(); onCreateFolder(item.id); }} title="New Folder" />}
                    <FaTrash size={10} className={styles.deleteIcon} onClick={(e) => onDelete(item.id, e)} title="Delete" />
                </div>
            </div>
            {isFolder && isExpanded && (
                <div className={styles.treeChildren}>
                    {children.map(child => (
                        <FileItem
                            key={child.id}
                            item={child}
                            files={files}
                            activeId={activeId}
                            expanded={expanded}
                            onSelect={onSelect}
                            onToggle={onToggle}
                            onDelete={onDelete}
                            onCreateFile={onCreateFile}
                            onCreateFolder={onCreateFolder}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ChamberRoom;
