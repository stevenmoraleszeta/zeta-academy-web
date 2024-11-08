import { ReactNode } from "react";
import styles from "./services.module.css";
import Image from "next/image";

interface ServiceProps {
    displayText: string,
    nonDisplayedText: string,
    imageURL: string,
    children: ReactNode,
}

export default function Service(props: ServiceProps) {
    const { displayText, nonDisplayedText, children, imageURL } = props;
    return (
        <>
            <div className={styles.serviceContentContainer}>
                <Image alt="backImgService" src={imageURL} width={400} height={500} className={styles.backImgService}></Image>
                <p className={styles.displayedText}>{displayText}</p>
                <p className={styles.onHoverText}>{nonDisplayedText}</p>
                <div className={styles.childrenContainer}>
                    {children}
                </div>
            </div>
        </>
    )
};

/* style={{ backgroundImage: `url(${imageURL})` }} */