import { ReactNode } from "react"
import styles from "./services.module.css"

interface ServiceProps {
    displayText: string,
    nonDisplayedText: string,
    children: ReactNode,
}

export default function Service(props: ServiceProps) {
    const { displayText, nonDisplayedText, children } = props;
    return (
        <>
            <div className={styles.serviceContentContainer}>
                <div className={styles.displayedContainer}>
                    <p>{displayText}</p>
                </div>
                <div className={styles.onHoverContainer}>
                    <p>{nonDisplayedText}</p>
                </div>
                <div className={styles.childrenContainer}>
                    {children}
                </div>
            </div>
        </>
    )
};