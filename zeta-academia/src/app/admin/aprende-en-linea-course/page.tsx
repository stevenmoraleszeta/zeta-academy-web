"use client";

import React from "react";
import styles from './page.module.css';

const AdminLearnOnlineCourse: React.FC = () => {
    return (
        <div className={styles.pageContainer}>
            <div className={styles.sideBar}>Barra lateral</div>
            <div className={styles.mainContent}>Contenido principal</div>
        </div>
    );
};

export default AdminLearnOnlineCourse;
