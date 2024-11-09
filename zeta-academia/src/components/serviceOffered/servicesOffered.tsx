"use client"

import { ReactNode, useState } from "react";
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
    const [isHovered, setIsHovered] = useState(false);

    return (
        <>
            <div className={styles.serviceContentContainer} onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}>
                <Image alt="backImgService" src={imageURL} width={400} height={500} className={styles.backImgService}></Image>
                {!isHovered && (
                    <p className={styles.displayedText}>{displayText}</p>
                )}
                {isHovered && (
                    <p className={styles.onHoverText}>{nonDisplayedText}</p>
                )}
                <div className={styles.childrenContainer}>
                    {children}
                </div>
            </div>
        </>
    )
};