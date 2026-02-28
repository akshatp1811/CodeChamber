import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaFeatherAlt } from 'react-icons/fa';
import { db } from '../../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import styles from './CreatePostModal.module.css';

const CreatePostModal = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tagsInput, setTagsInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleCreatePost = async (e) => {
        e.preventDefault();
        setError('');

        if (!title.trim() || !content.trim()) {
            setError('A Title and Scroll Content are required to forge.');
            return;
        }

        if (!user) {
            setError('You must be logged in to forge a scroll.');
            return;
        }

        setIsSubmitting(true);

        const tags = tagsInput
            .split(',')
            .map(t => t.trim().toLowerCase())
            .filter(t => t.length > 0);

        try {
            await addDoc(collection(db, 'posts'), {
                title: title.trim(),
                content: content.trim(),
                tags,
                authorId: user.uid,
                authorName: user.name || 'Anonymous Tactician',
                authorPhoto: user.photoURL || null,
                createdAt: serverTimestamp(),
                commentsCount: 0
            });

            // Reset and close
            setTitle('');
            setContent('');
            setTagsInput('');
            onClose();
        } catch (err) {
            console.error("Error creating post: ", err);
            setError('The Magic failed. Please try forging again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setTitle('');
        setContent('');
        setTagsInput('');
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
                        transition={{ duration: 0.3 }}
                    >
                        <button className={styles.closeBtn} onClick={handleClose}>
                            <FaTimes />
                        </button>

                        <form onSubmit={handleCreatePost} className={styles.formContainer}>
                            <h2 className={styles.title}>
                                <FaFeatherAlt className={styles.titleIcon} /> Forge a Scroll
                            </h2>
                            <p className={styles.subtitle}>
                                Share your knowledge, ask a doubt, or discuss the arcane arts of code.
                            </p>

                            <div className={styles.inputGroup}>
                                <label>Scroll Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="What knowledge do you seek or share?"
                                    maxLength={100}
                                    disabled={isSubmitting}
                                    autoFocus
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label>The Inscription (Content)</label>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Write your thoughts..."
                                    rows="6"
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label>Runes (Tags)</label>
                                <input
                                    type="text"
                                    value={tagsInput}
                                    onChange={(e) => setTagsInput(e.target.value)}
                                    placeholder="e.g., react, javascript, help (comma separated)"
                                    disabled={isSubmitting}
                                />
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
                                <button type="button" className={styles.cancelBtn} onClick={handleClose} disabled={isSubmitting}>
                                    Discard
                                </button>
                                <button type="submit" className={styles.primaryBtn} disabled={isSubmitting}>
                                    {isSubmitting ? 'Forging...' : 'Publish Scroll'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CreatePostModal;
