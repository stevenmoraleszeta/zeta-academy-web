"use client";

import styles from "./modal.module.css";
import { useEffect, useState } from "react";

export function Modal({ modalType }) {

    const { modal, setModal } = useState("");

    useEffect(() => {
        switch (modalType) {
            case "alert":
                setModal("alert")
                break;
            case "form":
                setModal("form")
                break;
            case "message":
                setModal("message")
                break;
            default:
                break;
        }
    });

    return (
        <>

        </>
    )
}

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