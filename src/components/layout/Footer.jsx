import React from 'react';
import { FaGithub } from 'react-icons/fa';
import styles from './Footer.module.css';

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.footerContent}>
                <div className={styles.container}>
                    <div className={styles.section}>
                        <h3>About CodeChamber</h3>
                        <p>Where Developers Unite and AI Guides.</p>
                    </div>

                    <div className={styles.section}>
                        <h3>Links</h3>
                        <a href="#" className={styles.link}>
                            <FaGithub /> GitHub Placeholder
                        </a>
                        <p className={styles.team}>Built by Team Gryffindor</p>
                    </div>

                    <div className={styles.section}>
                        <h3>Settings</h3>
                        <button className={styles.soundToggle}>
                            Toggle Ambient Sound
                        </button>
                    </div>
                </div>

                <div className={styles.bottom}>
                    <div className={styles.divider}></div>
                    <p>&copy; 2026 CodeChamber. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
