import CursoCard from "@/components/cursoCard/cursoCard";
import styles from "./mainPage.module.css";

export function MainPage() {
    return (
        <>
            <section className={styles.welcomeSection}>
                <div className={styles.contentContainer}>
                    <div className={styles.infoContainer}>
                        <h1 className={styles.welcomeTitle}>Desbloquea tu</h1>
                        <h1 className={styles.dynamicMessage}>Potencial</h1>
                        <h4 className={styles.welcomeSubtitle}>Aprendé con los mejores</h4>
                        <button className={styles.coursesBtn}>Ver cursos en línea</button>
                    </div>
                    <div className={styles.componentContainer}>
                        <CursoCard imgSrc="https://www.ionos.es/digitalguide/fileadmin/DigitalGuide/Teaser/cgi-skripte-auf--apache-aktivieren.jpg" descText="Conviértete en programador con Python desde cero. Avanza a tu ritmo y cuenta con el apoyo de tutores especializados." titleText="Introducción a la Programación con Python" width={500}
                            height={500}></CursoCard>
                    </div>
                </div>
            </section >
        </>
    );
};