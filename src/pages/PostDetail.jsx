import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, getDoc, collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, increment, updateDoc } from 'firebase/firestore';
import { FaArrowLeft, FaRegClock, FaUserCircle, FaPaperPlane } from 'react-icons/fa';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { pageTransitionVariants, staggerContainer, staggerItem } from '../utils/animations';
import styles from './PostDetail.module.css';

const PostDetail = () => {
    const { postId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchPostAndComments = async () => {
            try {
                // 1. Fetch Post Details (One-time fetch for now, can be real-time if needed)
                const docRef = doc(db, 'posts', postId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setPost({ id: docSnap.id, ...docSnap.data() });
                } else {
                    setPost(null);
                }

                // 2. Setup Real-time Listener for Comments
                const q = query(
                    collection(db, 'comments'),
                    where('postId', '==', postId),
                    orderBy('createdAt', 'asc')
                );

                const unsubscribe = onSnapshot(q, (snapshot) => {
                    const commentsData = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setComments(commentsData);
                });

                setLoading(false);
                return unsubscribe;
            } catch (err) {
                console.error("Error fetching post details:", err);
                setLoading(false);
            }
        };

        let unsubscribeFn;
        fetchPostAndComments().then(unsub => { unsubscribeFn = unsub; });

        return () => {
            if (unsubscribeFn) unsubscribeFn();
        };
    }, [postId]);

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !user || submitting) return;

        setSubmitting(true);
        try {
            // Add comment to comments collection
            await addDoc(collection(db, 'comments'), {
                postId,
                content: newComment.trim(),
                authorId: user.uid,
                authorName: user.name || 'Anonymous',
                authorPhoto: user.photoURL || null,
                createdAt: serverTimestamp()
            });

            // Increment comment count on the original post document
            const postRef = doc(db, 'posts', postId);
            await updateDoc(postRef, {
                commentsCount: increment(1)
            });

            setNewComment('');
        } catch (err) {
            console.error("Error adding comment: ", err);
            alert("Failed to add comment. The magic was interrupted.");
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'Just now';
        return new Date(timestamp.toDate()).toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    if (loading) return <div className={styles.loadingState}>Decrypting the ancient scroll...</div>;
    if (!post) return <div className={styles.emptyState}>This scroll does not exist or has been destroyed.</div>;

    return (
        <motion.div
            className={styles.postDetailContainer}
            variants={pageTransitionVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <button className={styles.backBtn} onClick={() => navigate('/community')}>
                <FaArrowLeft /> Back to Sanctuary
            </button>

            <article className={styles.mainPostCard}>
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

                <h1 className={styles.postTitle}>{post.title}</h1>

                <div className={styles.tagsArea}>
                    {post.tags && post.tags.map((tag, idx) => (
                        <span key={idx} className={styles.tag}>#{tag}</span>
                    ))}
                </div>

                <div className={styles.postContent}>
                    {post.content.split('\n').map((paragraph, idx) => (
                        <p key={idx}>{paragraph}</p>
                    ))}
                </div>
            </article>

            <section className={styles.commentsSection}>
                <h3 className={styles.commentsTitle}>Echoes of the Chamber ({comments.length})</h3>

                <form onSubmit={handleAddComment} className={styles.commentForm}>
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Share your wisdom..."
                        rows="3"
                        disabled={submitting || !user}
                    />
                    <div className={styles.formFooter}>
                        {!user && <span className={styles.loginWarning}>Log in to leave an echo.</span>}
                        <button type="submit" className={styles.submitCommentBtn} disabled={submitting || !user || !newComment.trim()}>
                            <FaPaperPlane /> {submitting ? 'Sending...' : 'Send'}
                        </button>
                    </div>
                </form>

                <div className={styles.commentsList}>
                    <AnimatePresence>
                        {comments.length === 0 ? (
                            <motion.p className={styles.noComments} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                No echoes yet. Be the first to speak.
                            </motion.p>
                        ) : (
                            comments.map((comment) => (
                                <motion.div
                                    key={comment.id}
                                    className={styles.commentCard}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className={styles.commentHeader}>
                                        <div className={styles.commentAuthor}>
                                            {comment.authorPhoto ? (
                                                <img src={comment.authorPhoto} alt={comment.authorName} className={styles.commentAuthorImg} />
                                            ) : (
                                                <FaUserCircle className={styles.commentAuthorIcon} />
                                            )}
                                            <span className={styles.commentAuthorName}>{comment.authorName}</span>
                                        </div>
                                        <span className={styles.commentDate}>{formatDate(comment.createdAt)}</span>
                                    </div>
                                    <div className={styles.commentContent}>
                                        {comment.content.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </section>
        </motion.div>
    );
};

export default PostDetail;
