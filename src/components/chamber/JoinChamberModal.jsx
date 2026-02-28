import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaDoorOpen, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { db } from '../../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import styles from './JoinChamberModal.module.css';

const JoinChamberModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [roomId, setRoomId] = useState('');
    const [isJoining, setIsJoining] = useState(false);
    const [error, setError] = useState('');

    const handleJoinChamber = async (e) => {
        e.preventDefault();
        setError('');

        const trimmedId = roomId.trim().toUpperCase();

        if (!trimmedId) {
            setError('Please enter a Room ID to join.');
            return;
        }

        if (!/^CC-[A-Z0-9]{6}$/.test(trimmedId)) {
            setError('Invalid format. Room IDs look like "CC-XXXXXX".');
            return;
        }

        setIsJoining(true);

        try {
            // Validate against Firestore
            const roomRef = doc(db, 'rooms', trimmedId);
            const roomSnap = await getDoc(roomRef);

            if (roomSnap.exists()) {
                // Room verified, navigate straight inside
                onClose();
                navigate(`/chamber/${trimmedId}`);
            } else {
                setError('Chamber not found. The magic may have dissipated.');
            }
        } catch (err) {
            console.error("Error joining chamber:", err);
            setError('Connection failed. The weave is unstable.');
        } finally {
            setIsJoining(false);
        }
    };

    const resetAndClose = () => {
        setRoomId('');
        setError('');
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

                        <form onSubmit={handleJoinChamber} className={styles.formContainer}>
                            <h2 className={styles.title}>
                                <FaDoorOpen className={styles.titleIcon} /> Join Chamber
                            </h2>
                            <p className={styles.subtitle}>
                                Enter the unique ID provided by your peers.
                            </p>

                            <div className={styles.inputGroup}>
                                <label>Room ID</label>
                                <div className={styles.inputWrapper}>
                                    <FaSearch className={styles.searchIcon} />
                                    <input
                                        type="text"
                                        value={roomId}
                                        onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                                        placeholder="CC-XXXXXX"
                                        maxLength={9}
                                        disabled={isJoining}
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <AnimatePresence>
                                {error && (
                                    <motion.p
                                        className={styles.errorMessage}
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                    >
                                        {error}
                                    </motion.p>
                                )}
                            </AnimatePresence>

                            <div className={styles.actionGroup}>
                                <button type="button" className={styles.cancelBtn} onClick={resetAndClose} disabled={isJoining}>
                                    Cancel
                                </button>
                                <button type="submit" className={styles.primaryBtn} disabled={isJoining}>
                                    {isJoining ? 'Verifying...' : 'Enter Chamber'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default JoinChamberModal;
