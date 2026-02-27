import React from 'react';
import styles from './GoldenEmpireDivider.module.css';
import skylineImg from '../../assets/golden-skyline.png';

const GoldenEmpireDivider = () => {
    return (
        <div
            className={styles.dividerWrapper}
            style={{ backgroundImage: `url(${skylineImg})` }}
        >
            <div className={styles.particleOverlay}></div>
        </div>
    );
};

export default GoldenEmpireDivider;
