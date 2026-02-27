import React, { useState, useEffect, useRef } from 'react';
import { FaHatWizard, FaPlay, FaRegCopy, FaCheck, FaMagic, FaTerminal, FaFileCode, FaFolder, FaPlus, FaTrash, FaFolderPlus, FaChevronRight, FaChevronDown } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { io } from 'socket.io-client';
import Editor from '@monaco-editor/react';
import { pageTransitionVariants, staggerContainer, staggerItem } from '../utils/animations';
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

    const socketRef = useRef();
    const editorRef = useRef();

    useEffect(() => {
        socketRef.current = io('http://localhost:5000');

        socketRef.current.on('ai-generating', (status) => {
            setIsGenerating(status);
        });

        socketRef.current.on('ai-generated-code', (data) => {
            setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, content: data.code } : f));
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
        const activeFile = files.find(f => f.id === activeFileId);
        setTimeout(() => {
            socketRef.current.emit('ai-generate', {
                roomId: 'SOLO_' + Date.now(),
                instruction: 'Review this code for performance and provide an optimized version.',
                code: activeFile?.content || '',
                language
            });
            setIsAsking(false);
        }, 1000);
    };

    const handleEditorDidMount = (editor) => {
        editorRef.current = editor;

        // Custom key listener for /generate
        editor.onKeyDown((e) => {
            if (e.keyCode === 3 /* Enter */) {
                const model = editor.getModel();
                const position = editor.getPosition();
                const lineContent = model.getLineContent(position.lineNumber);

                if (lineContent.startsWith('/generate')) {
                    const instruction = lineContent.replace('/generate', '').trim();
                    const fullCode = model.getValue();
                    const lines = fullCode.split('\n');
                    const codeContext = lines.filter((_, i) => i !== position.lineNumber - 1).join('\n');

                    socketRef.current.emit('ai-generate', {
                        roomId: 'SOLO_GEN',
                        instruction,
                        code: codeContext,
                        language
                    });

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

    const handleImproveCode = () => {
        const selection = editorRef.current.getSelection();
        const model = editorRef.current.getModel();
        const selectedText = model.getValueInRange(selection);

        if (selectedText) {
            socketRef.current.emit('ai-generate', {
                roomId: 'SOLO_IMPROVE',
                instruction: 'Improve this specific code snippet for readability and performance.',
                code: selectedText,
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
                            onChange={(value) => {
                                setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, content: value } : f));
                            }}
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
