import styles from "./cursoCard.module.css";
import Image from "next/image";

interface cardProps {
    imgSrc: string,
    titleText: string,
    descText: string,
    width: number,
    height: number,
    icon: string,
};

export default function CursoCard(props: cardProps) {
    const { imgSrc, titleText, descText, height, width, icon } = props
    return (
        <>
            <div className={styles.cardContainer}>
                <div className={styles.imgContainer}>
                    <Image className={styles.courseImg} width={width}
                        height={height} src={imgSrc} alt="imageCurso">
                    </Image>
                </div>
                <Image className={styles.iconImg} width={200} height={200} src={icon} alt="pythonLogo"></Image>
                <div className={styles.textContainer}>
                    <h2>{titleText}</h2>
                    <p>{descText}</p>
                </div>
            </div>
        </>
    );
};