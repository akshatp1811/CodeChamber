import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaCopy, FaDoorOpen, FaMagic } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { db } from '../../config/firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import styles from './CreateChamberModal.module.css';

const generateCustomRoomId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `CC-${result}`;
};

const CreateChamberModal = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [chamberName, setChamberName] = useState('');
    const [mode, setMode] = useState('normal'); // 'normal' | 'gamified'
    const [isForging, setIsForging] = useState(false);
    const [error, setError] = useState('');

    // Success State Variables
    const [successRoomId, setSuccessRoomId] = useState(null);
    const [toastMessage, setToastMessage] = useState('');

    const handleForgeChamber = async (e) => {
        e.preventDefault();
        setError('');

        if (!chamberName.trim()) {
            setError('The chamber requires a name.');
            return;
        }

        if (!user) {
            setError('You must be authenticated to forge a chamber.');
            return;
        }

        setIsForging(true);

        try {
            const newRoomId = generateCustomRoomId();
            const roomDocRef = doc(db, 'rooms', newRoomId);

            const roomData = {
                roomId: newRoomId,
                chamberName: chamberName.trim(),
                createdBy: user.uid,
                createdByName: user.name || 'Anonymous Tactician',
                members: [user.uid],
                createdAt: serverTimestamp(),
                teamXP: 0,
                teamLevel: 1,
                mode: mode,
                codeContent: "// The Chamber opens. Start building together...\n"
            };

            await setDoc(roomDocRef, roomData);

            // Transition to Success UI
            setSuccessRoomId(newRoomId);
        } catch (err) {
            console.error("Error forging chamber:", err);
            setError('The forge failed. The network magic faded.');
        } finally {
            setIsForging(false);
        }
    };

    const copyToClipboard = () => {
        if (successRoomId) {
            navigator.clipboard.writeText(successRoomId);
            setToastMessage('Room ID Copied!');
            setTimeout(() => setToastMessage(''), 3000);
        }
    };

    const handleEnterChamber = () => {
        if (successRoomId) {
            onClose();
            navigate(`/chamber/${successRoomId}`);
        }
    };

    const resetAndClose = () => {
        setChamberName('');
        setMode('normal');
        setSuccessRoomId(null);
        setError('');
        setToastMessage('');
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className={styles.overlay}>
                    <motion.div
                        className={styles.modal}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                    >
                        <button className={styles.closeBtn} onClick={resetAndClose}>
                            <FaTimes />
                        </button>

                        {!successRoomId ? (
                            <form onSubmit={handleForgeChamber} className={styles.formContainer}>
                                <h2 className={styles.title}>
                                    <FaMagic className={styles.titleIcon} /> Forge Chamber
                                </h2>

                                <div className={styles.inputGroup}>
                                    <label>Chamber Name</label>
                                    <input
                                        type="text"
                                        value={chamberName}
                                        onChange={(e) => setChamberName(e.target.value)}
                                        placeholder="E.g. Project Phoenix"
                                        maxLength={30}
                                        disabled={isForging}
                                        autoFocus
                                    />
                                </div>

                                <div className={styles.modeToggleGroup}>
                                    <label>Chamber Mode</label>
                                    <div className={styles.modes}>
                                        <button
                                            type="button"
                                            className={`${styles.modeBtn} ${mode === 'normal' ? styles.activeMode : ''}`}
                                            onClick={() => setMode('normal')}
                                            disabled={isForging}
                                        >
                                            Normal
                                        </button>
                                        <button
                                            type="button"
                                            className={`${styles.modeBtn} ${mode === 'gamified' ? styles.activeMode : ''}`}
                                            onClick={() => setMode('gamified')}
                                            disabled={isForging}
                                        >
                                            Gamified
                                        </button>
                                    </div>
                                </div>

                                {error && <p className={styles.errorMessage}>{error}</p>}

                                <div className={styles.actionGroup}>
                                    <button type="button" className={styles.cancelBtn} onClick={resetAndClose} disabled={isForging}>
                                        Cancel
                                    </button>
                                    <button type="submit" className={styles.primaryBtn} disabled={isForging}>
                                        {isForging ? 'Forging...' : 'Forge Chamber'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <motion.div
                                className={styles.successContainer}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                            >
                                <h2 className={styles.successTitle}>Chamber Forged Successfully</h2>
                                <p className={styles.subtitle}>Invite your peers to join the realm.</p>

                                <div className={styles.roomIdBox}>
                                    <span className={styles.roomIdLabel}>Room ID:</span>
                                    <span className={styles.roomIdValue}>{successRoomId}</span>
                                    <button className={styles.copyBtn} onClick={copyToClipboard} title="Copy ID">
                                        <FaCopy />
                                    </button>
                                </div>

                                <AnimatePresence>
                                    {toastMessage && (
                                        <motion.div
                                            className={styles.toast}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            {toastMessage}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <button className={styles.enterBtn} onClick={handleEnterChamber}>
                                    <FaDoorOpen /> Enter Chamber
                                </button>
                            </motion.div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CreateChamberModal;
