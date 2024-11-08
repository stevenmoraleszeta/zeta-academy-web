import CursoCard from "@/components/cursoCard/cursoCard";
import Service from "@/components/serviceOffered/servicesOffered";
import ContactUsBtn from "@/components/contactUsBtn/contactUsBtn";

import styles from "./mainPage.module.css";
import Image from "next/image";

export function MainPage() {
    return (
        <>
            {/* Main content */}
            <section className={styles.mainSection}>
                <div className={styles.contentContainer}>
                    <div className={styles.infoContainer}>
                        <h1 className={styles.mainTitle}>Desbloquea tu</h1>
                        <h1 className={styles.dynamicMessage}>Potencial</h1>
                        <h4 className={styles.mainSubtitle}>Aprende con los mejores</h4>
                        <button className={styles.coursesBtn}>Ver cursos en línea</button>
                    </div>
                    <div className={styles.componentContainer}>
                        <CursoCard icon="https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2FpythonIconPng.png?alt=media&token=6583f3bc-0ce1-42f8-adbe-75e4ede5e662" imgSrc='https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2FDALLE03.webp?alt=media&token=858d23a3-df7a-4b29-ba21-38bb56b27011' descText="Conviértete en programador con Python desde cero. Avanza a tu ritmo y cuenta con el apoyo de tutores especializados." titleText="Introducción a la Programación con Python" width={500}
                            height={500}></CursoCard>
                    </div>
                </div>
            </section >
            {/* benefits elements */}
            <section className={styles.benefitsSection}>
                <div className={styles.benefitsContentContainer}>
                    <div className={styles.iconsContainer}>
                        <Image className={styles.excelIcon} alt="icon" src="https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2FexcelIcon.png?alt=media&token=ae94876e-b189-4728-9ff0-56fd51014dbe" width={400} height={400}></Image>
                        <Image className={styles.sqlIcon} alt="icon" src="https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2FsqlPngIcon.png?alt=media&token=03f5dc8e-8bfb-4ee1-b18f-3e0764604815" width={400} height={400}></Image>
                        <Image className={styles.pythonIcon} alt="icon" src="https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2FpythonIconPng.png?alt=media&token=6583f3bc-0ce1-42f8-adbe-75e4ede5e662" width={400} height={400}></Image>
                    </div>
                    <div className={styles.benefitsTextContainer}>
                        <h1 className={styles.benefitsTitle}>Conéctate y aprende en vivo desde casa</h1>
                        <h2 className={styles.benefitsSubtitle}>Apoyo personalizado las 24 horas del día</h2>
                        <button className={styles.coursesBtn}>Ver cursos en vivo</button>
                    </div>
                </div>
            </section >
            {/* benefits elements */}
            <section className={styles.servicesSection}>
                <div className={styles.servicesTitle}>
                    <h1>Nosotros te ayudamos</h1>
                </div>
                <div className={styles.servicesMainContainer}>
                    <Service displayText="Realizamos tus proyectos de universidad" nonDisplayedText="Envíanos las instrucciones de tu proyecto universitario o de cualquier otra institución, y te cotizaremos el costo de realización">
                        <ContactUsBtn link=""></ContactUsBtn>
                    </Service>
                </div>
                <div className={styles.auxContactContainer}>
                    <h3>Cualquier otro asunto</h3>
                </div>
            </section>
        </>
    );
};