import styles from "./cursoCard.module.css";
import Image from "next/image";

interface cardProps {
    imgSrc: string,
    titleText: string,
    descText: string,
    width: number,
    height: number,
};

export default function CursoCard(props: cardProps) {
    const { imgSrc, titleText, descText, height, width } = props
    return (
        <>
            <div className={styles.cardContainer}>
                <div className={styles.imgContainer}>
                    <Image className={styles.courseImg} width={width}
                        height={height} src={imgSrc} alt="imageCurso">
                    </Image>
                </div>
                <div className={styles.textContainer}>
                    <h2>{titleText}</h2>
                    <p>{descText}</p>
                </div>
            </div>
        </>
    );
};