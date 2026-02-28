import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { FaPlus, FaCommentAlt, FaRegClock, FaUserCircle } from 'react-icons/fa';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { pageTransitionVariants, staggerContainer, staggerItem } from '../utils/animations';
import CreatePostModal from '../components/community/CreatePostModal';
import styles from './Community.module.css';

const Community = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const postsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setPosts(postsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching posts:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const formatDate = (timestamp) => {
        if (!timestamp) return 'Just now';
        return new Date(timestamp.toDate()).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    };

    return (
        <motion.div
            className={styles.communityContainer}
            variants={pageTransitionVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <div className={styles.header}>
                <div className={styles.headerText}>
                    <h1 className={styles.title}>Community Sanctum</h1>
                    <p className={styles.subtitle}>Discuss, seek guidance, and share your scrolls of wisdom.</p>
                </div>
                <button
                    className={styles.forgeBtn}
                    onClick={() => setIsCreateModalOpen(true)}
                >
                    <FaPlus /> Forge a Scroll
                </button>
            </div>

            {loading ? (
                <div className={styles.loadingState}>Consulting the archives...</div>
            ) : posts.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>The archives are empty. Be the first to forge a scroll!</p>
                </div>
            ) : (
                <motion.div
                    className={styles.feed}
                    variants={staggerContainer}
                    initial="hidden"
                    animate="show"
                >
                    {posts.map(post => (
                        <motion.article
                            key={post.id}
                            className={styles.postCard}
                            variants={staggerItem}
                            onClick={() => navigate(`/community/post/${post.id}`)}
                            whileHover={{ y: -4, boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)", borderColor: "rgba(212, 175, 55, 0.4)" }}
                        >
                            <div className={styles.postHeader}>
                                <div className={styles.authorBadge}>
                                    {post.authorPhoto ? (
                                        <img src={post.authorPhoto} alt={post.authorName} className={styles.authorImg} />
                                    ) : (
                                        <FaUserCircle className={styles.authorIcon} />
                                    )}
                                    <span className={styles.authorName}>{post.authorName}</span>
                                </div>
                                <div className={styles.postMeta}>
                                    <FaRegClock /> {formatDate(post.createdAt)}
                                </div>
                            </div>

                            <h2 className={styles.postTitle}>{post.title}</h2>
                            <p className={styles.postPreview}>{post.content.substring(0, 150)}{post.content.length > 150 ? '...' : ''}</p>

                            <div className={styles.postFooter}>
                                <div className={styles.tagsArea}>
                                    {post.tags && post.tags.map((tag, idx) => (
                                        <span key={idx} className={styles.tag}>#{tag}</span>
                                    ))}
                                </div>
                                <div className={styles.commentsMeta}>
                                    <FaCommentAlt /> {post.commentsCount || 0}
                                </div>
                            </div>
                        </motion.article>
                    ))}
                </motion.div>
            )}

            <CreatePostModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </motion.div>
    );
};

export default Community;
