import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserPlus, FaLock, FaGlobe } from 'react-icons/fa';
import styles from './Chamber.module.css';

const ChamberCreate = () => {
    const navigate = useNavigate();
    const [chamberName, setChamberName] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);

    const handleCreate = (e) => {
        e.preventDefault();
        if (chamberName.trim()) {
            // Navigate to a mock room ID
            navigate(`/chamber/room-${Math.floor(Math.random() * 10000)}`);
        }
    };

    return (
        <div className={styles.createContainer}>
            <div className={`${styles.createCard} card glow-hover`}>
                <div className={styles.iconHeader}>
                    <FaUserPlus size={40} color="var(--color-primary-gold)" />
                </div>
                <h2>Forge a New Chamber</h2>
                <p>Establish a synchronized space for your allies.</p>

                <form onSubmit={handleCreate} className={styles.createForm}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="chamberName">Chamber Name</label>
                        <input
                            id="chamberName"
                            type="text"
                            placeholder="e.g. Gryffindor Hackers"
                            value={chamberName}
                            onChange={(e) => setChamberName(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.visibilityToggle}>
                        <div
                            className={`${styles.toggleOption} ${!isPrivate ? styles.activeOption : ''}`}
                            onClick={() => setIsPrivate(false)}
                        >
                            <FaGlobe /> Public
                        </div>
                        <div
                            className={`${styles.toggleOption} ${isPrivate ? styles.activeOption : ''}`}
                            onClick={() => setIsPrivate(true)}
                        >
                            <FaLock /> Private
                        </div>
                    </div>

                    <button type="submit" className={styles.submitBtn}>
                        Open the Chamber
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChamberCreate;
