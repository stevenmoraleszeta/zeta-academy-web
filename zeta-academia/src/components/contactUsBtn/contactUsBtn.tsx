"use client";

import styles from './contactUsBtn.module.css'

interface ContactUsBtnProps {
    link?: string,
}

export default function ContactUsBtn(props: ContactUsBtnProps) {
    const { link } = props;

    const handleLink = () => {
        window.open(link)
    }

    return (
        <button onClick={handleLink} className={styles.link}>Contáctanos</button>
    )
}