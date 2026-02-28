import React, { useState, useEffect, useRef } from 'react';
import { FaHatWizard, FaPlay, FaRegCopy, FaCheck, FaMagic, FaTerminal, FaFileCode, FaFolder, FaPlus, FaTrash, FaFolderPlus, FaChevronRight, FaChevronDown, FaPaperPlane } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { io } from 'socket.io-client';
import Editor from '@monaco-editor/react';
import { pageTransitionVariants, staggerContainer, staggerItem } from '../utils/animations';
import { generateAIResponse, generateCodeOnly } from '../services/ai.service';
import styles from './Solo.module.css';

const Solo = () => {
    const [files, setFiles] = useState([
        { id: '1', name: 'fibonacci.js', type: 'file', content: 'function calculateFibonacci(n) {\n  if (n <= 1) return n;\n  return calculateFibonacci(n - 1) + calculateFibonacci(n - 2);\n}', parentId: null },
        { id: '2', name: 'utils', type: 'folder', parentId: null },
        { id: '3', name: 'constants.js', type: 'file', content: 'export const PI = 3.14159;', parentId: '2' }
    ]);
    const [activeFileId, setActiveFileId] = useState('1');
    const [expandedFolders, setExpandedFolders] = useState(['2']);
    const [isAsking, setIsAsking] = useState(false);
    const [oracleResponse, setOracleResponse] = useState(null);
    const [copied, setCopied] = useState(false);
    const [language, setLanguage] = useState('javascript');
    const [isGenerating, setIsGenerating] = useState(false);
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [oracleMessages, setOracleMessages] = useState([]);
    const [oracleInput, setOracleInput] = useState('');

    const socketRef = useRef();
    const editorRef = useRef();
    const oracleChatEndRef = useRef();

    useEffect(() => {
        socketRef.current = io('http://localhost:5000');

        socketRef.current.on('ai-generating', (status) => {
            setIsGenerating(status);
        });

        socketRef.current.on('ai-generated-code', (data) => {
            setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, content: data.code } : f));
            setOracleMessages(prev => [...prev, { sender: 'oracle', text: "Behold, I have manifested the logic you requested.", type: 'code', code: data.code }]);
        });

        socketRef.current.on('oracle-chat-response', (data) => {
            setOracleMessages(prev => [...prev, { sender: 'oracle', text: data.text }]);
        });

        return () => socketRef.current.disconnect();
    }, [activeFileId]);

    useEffect(() => {
        oracleChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [oracleMessages]);

    const handleAskOracle = async (e) => {
        if (e) e.preventDefault();
        const question = oracleInput.trim();
        if (!question && !oracleResponse) return;

        const finalQuestion = question || "Review this code for performance and provide an optimized version.";

        const newUserMsg = { sender: 'user', text: finalQuestion };
        setOracleMessages(prev => [...prev, newUserMsg]);
        setOracleInput('');

        setIsGenerating(true);
        try {
            const contextMsg = '';
            const codeContext = activeFile?.content || '';
            const responseText = await generateAIResponse(
                contextMsg,
                finalQuestion,
                codeContext,
                language,
                oracleMessages
            );
            setOracleMessages(prev => [...prev, { sender: 'oracle', text: responseText }]);
        } catch (error) {
            console.error(error);
            setOracleMessages(prev => [...prev, { sender: 'oracle', text: "My mystic energies are disrupted." }]);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleFileUpdate = (newContent) => {
        setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, content: newContent } : f));
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
        }
    };

    const handleFileDelete = (fileId, e) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this?')) {
            setFiles(prev => prev.filter(f => f.id !== fileId && f.parentId !== fileId));
            if (activeFileId === fileId) setActiveFileId(null);
        }
    };

    const toggleFolder = (folderId) => {
        setExpandedFolders(prev =>
            prev.includes(folderId) ? prev.filter(fid => fid !== folderId) : [...prev, folderId]
        );
    };

    const handleEditorDidMount = (editor) => {
        editorRef.current = editor;

        // Custom key listener for /generate
        editor.onKeyDown(async (e) => {
            if (e.keyCode === 3 /* Enter */) {
                const model = editor.getModel();
                const position = editor.getPosition();
                const lineContent = model.getLineContent(position.lineNumber);

                if (lineContent.startsWith('/generate')) {
                    const instruction = lineContent.replace('/generate', '').trim();
                    const fullCode = model.getValue();
                    const lines = fullCode.split('\n');
                    const codeContext = lines.filter((_, i) => i !== position.lineNumber - 1).join('\n');

                    setIsGenerating(true);
                    try {
                        const generatedCode = await generateCodeOnly(instruction, codeContext, language);

                        setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, content: generatedCode } : f));
                        setOracleMessages(prev => [...prev, { sender: 'oracle', text: "Behold, I have manifested the logic you requested.", type: 'code', code: generatedCode }]);
                    } catch (err) {
                        console.error(err);
                    } finally {
                        setIsGenerating(false);
                    }

                    // Remove the /generate line
                    editor.executeEdits('magic-ai', [{
                        range: {
                            startLineNumber: position.lineNumber,
                            startColumn: 1,
                            endLineNumber: position.lineNumber,
                            endColumn: lineContent.length + 1
                        },
                        text: ''
                    }]);
                }
            }
        });
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

    const handleImproveCode = async () => {
        const selection = editorRef.current.getSelection();
        const model = editorRef.current.getModel();
        const selectedText = model.getValueInRange(selection);

        if (selectedText) {
            setIsGenerating(true);
            try {
                const generatedCode = await generateCodeOnly("Improve this specific code snippet for readability and performance.", selectedText, language);

                setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, content: generatedCode } : f));
                setOracleMessages(prev => [...prev, { sender: 'oracle', text: "Behold, I have perfected the logic you highlighted.", type: 'code', code: generatedCode }]);
            } catch (err) {
                console.error(err);
            } finally {
                setIsGenerating(false);
            }
        } else {
            handleAskOracle();
        }
    };

    const copyFix = () => {
        navigator.clipboard.writeText(oracleResponse.fix);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const activeFile = files.find(f => f.id === activeFileId);

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
                    <button className={styles.runBtn} onClick={handleRunCode} disabled={isRunning}>
                        <FaPlay /> {isRunning ? 'Running...' : 'Run Code'}
                    </button>
                </div>
            </header>

            <div className={styles.workspace}>
                {/* Left: File Explorer */}
                <aside className={styles.filePanel}>
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
                                onSelect={setActiveFileId}
                                onToggle={toggleFolder}
                                onDelete={handleFileDelete}
                                onCreateFile={handleFileCreate}
                                onCreateFolder={handleFolderCreate}
                            />
                        ))}
                    </div>
                </aside>

                {/* Center: Editor */}
                <main className={styles.editorPanel}>
                    <div className={styles.editorTabs}>
                        <div className={styles.tab}>{activeFile?.name || 'No file selected'}</div>
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
                </main>
                <aside className={styles.oraclePanel}>
                    <div className={styles.oracleHeader}>
                        <FaHatWizard size={20} color="var(--color-primary-gold)" />
                        <h3>The Oracle's Sanctum</h3>
                    </div>

                    <div className={styles.oracleChatArea}>
                        {oracleMessages.length === 0 ? (
                            <div className={styles.oracleEmptyState}>
                                <p>The Oracle slumbers. Speak to the void, and it may answer.</p>
                                <p className={styles.hintText}>Try <code>/generate &lt;prompt&gt;</code> in editor or chat below.</p>
                            </div>
                        ) : (
                            <div className={styles.oracleMessages}>
                                {oracleMessages.map((msg, idx) => (
                                    <div key={idx} className={`${styles.oracleMsg} ${msg.sender === 'user' ? styles.userMsg : styles.oracleMsgBubble}`}>
                                        <div className={styles.msgText}>{msg.text}</div>
                                        {msg.type === 'code' && (
                                            <pre className={styles.oracleCodeBox}>
                                                <code>{msg.code}</code>
                                            </pre>
                                        )}
                                    </div>
                                ))}
                                <div ref={oracleChatEndRef} />
                            </div>
                        )}
                        {isGenerating && (
                            <div className={styles.oracleTyping}>
                                <div className={styles.dot}></div>
                                <div className={styles.dot}></div>
                                <div className={styles.dot}></div>
                            </div>
                        )}
                    </div>

                    <form className={styles.oracleInputForm} onSubmit={handleAskOracle}>
                        <input
                            type="text"
                            placeholder="Consult the Oracle..."
                            value={oracleInput}
                            onChange={(e) => setOracleInput(e.target.value)}
                            disabled={isGenerating}
                        />
                        <button type="submit" disabled={isGenerating || !oracleInput.trim()}>
                            <FaPaperPlane />
                        </button>
                    </form>
                </aside>
            </div >
        </motion.div >
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

export default Solo;
