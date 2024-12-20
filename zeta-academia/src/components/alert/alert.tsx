import { ReactNode } from "react";
import styles from './alert.module.css';

interface AlertProps {
    title?: string,
    description?: string,
    children: ReactNode,
}

export function AlertComponent(props: AlertProps) {
    const { title, description, children } = props;
    return (
        <>
            <div className={styles.modalContainer}>
                <p className={styles.title}>{title}</p>
                <p className={styles.description}>{description}</p>
                <div className={styles.btnsContainer}>
                    {children}
                </div>
            </div>
        </>
    )
};

interface btnsProps {
    text: string,
    funct: () => void,
}

export function AlertButton(props: btnsProps) {
    const { text, funct } = props;
    return (
        <>
            <button onClick={funct}>{text}</button>
        </>
    )
}