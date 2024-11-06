import CursoCard from "@/components/cursoCard/cursoCard";
import styles from "./mainPage.module.css";

export function MainPage() {
    return (
        <>
            <section className={styles.mainSection}>
                <div className={styles.contentContainer}>
                    <div className={styles.infoContainer}>
                        <h1 className={styles.mainTitle}>Desbloquea tu</h1>
                        <h1 className={styles.dynamicMessage}>Potencial</h1>
                        <h4 className={styles.mainSubtitle}>Aprende con los mejores</h4>
                        <button className={styles.coursesBtn}>Ver cursos en línea</button>
                    </div>
                    <div className={styles.componentContainer}>
                        <CursoCard icon="https://s3.dualstack.us-east-2.amazonaws.com/pythondotorg-assets/media/community/logos/python-logo-only.png" imgSrc="https://www.ionos.es/digitalguide/fileadmin/DigitalGuide/Teaser/cgi-skripte-auf--apache-aktivieren.jpg" descText="Conviértete en programador con Python desde cero. Avanza a tu ritmo y cuenta con el apoyo de tutores especializados." titleText="Introducción a la Programación con Python" width={500}
                            height={500}></CursoCard>
                    </div>
                </div>
            </section >
            <section className={styles.benefitsSection}>
                <div className={styles.benefitsTextContainer}>
                    <h1 className={styles.benefitsTitle}>Conéctate y aprende en vivo desde casa</h1>
                    <h2 className={styles.benefitsSubtitle}>Apoyo personalizado las 24 horas del día</h2>
                    <button className={styles.coursesBtn}>Ver cursos en vivo</button>
                </div>
            </section >
        </>
    );
};