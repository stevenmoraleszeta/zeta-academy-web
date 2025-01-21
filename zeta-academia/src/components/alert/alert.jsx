import React from "react";
import styles from './alert.module.css';

export function AlertComponent({ title, description, children }) {
    return (
        <div className={styles.modalContainer}>
            <div className={styles.modalContentContainer}>
                <p className={styles.title}>{title}</p>
                <p className={styles.description}>{description}</p>
                <div className={styles.btnsContainer}>
                    {children}
                </div>
            </div>
        </div>
    );
}

export function AlertButton({ text, funct }) {
    return (
        <button onClick={funct}>{text}</button>
    );
}
