"use client";

import styles from './contactUsBtn.module.css'

interface ContactUsBtnProps {
    link?: string,
}

export default function ContactUsBtn(props: ContactUsBtnProps) {
    const { link } = props;
    return (
        <button className={styles.link}>Contáctanos</button>
    )
}