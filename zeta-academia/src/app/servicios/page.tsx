"use client"

import { useState } from "react"
import Image from "next/image"
import styles from "./services.module.css"
import Link from "next/link";

export default function Servicios() {
    document.title = "Servicios - ZETA";
    const [aprendeisHovered, setAprendeIsHovered] = useState(false);
    const [cursosVivoHovered, setCursosVivoHovered] = useState(false);
    const [clasesParticularesHovered, setClasesParticularesHovered] = useState(false);
    const [desarrolloHovered, setDesarrolloHovered] = useState(false);
    const [elaboracionProyectosHovered, setElaboracionProyectosHovered] = useState(false);
    const [otroHovered, setOtroHovered] = useState(false);

    return (
        <>
            <section className={styles.servicesMainSection}>
                <div className={styles.elementsContainer}>
                    <div className={styles.zetaLogoContainer}>
                        <Image className={styles.zetaLogoImg} width={1000} height={1000} src={'https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2FZetaLogoCpp.PNG?alt=media&token=6b854bc7-b25f-4b5c-b2ba-b0298372b67e'} alt="zetaLogo"></Image>
                    </div>
                    <div className={styles.servicesContainer}>
                        <div className={styles.firstMainContainer}>
                            <div className={styles.topContainer}>
                                <div id={styles.aprendeLinea} className={styles.serviceContainer} onMouseEnter={() => setAprendeIsHovered(true)}
                                    onMouseLeave={() => setAprendeIsHovered(false)}>
                                    {aprendeisHovered && (
                                        <>
                                            <div className={styles.textContainer}>
                                                <h2 className={styles.onHoveredText}>
                                                    Aprendé en línea con cursos asincrónicos a través de nuestra plataforma, donde contarás con el apoyo de tutores para resolver tus dudas.
                                                </h2>
                                            </div>
                                            <div className={styles.iconContainer}>
                                                <Link className={styles.linkBtn} href={'/cursos-en-linea'}>Ver cursos</Link>
                                            </div>
                                        </>
                                    )}
                                    {!aprendeisHovered && (
                                        <>
                                            <div className={styles.textContainer}>
                                                <h2 className={styles.textTitle}>
                                                    Aprende en línea.
                                                </h2>
                                            </div>
                                            <div className={styles.iconContainer}>
                                                <Image className={styles.iconImg} src={'https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FLaptopIconOrange.png?alt=media&token=2bf19c59-3d40-43a1-b0bd-fd3260952ecd'} alt="computerIconOrange" width={1000} height={1000}></Image>
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div id={styles.cursosVivo} className={styles.serviceContainer} onMouseEnter={() => setCursosVivoHovered(true)}
                                    onMouseLeave={() => setCursosVivoHovered(false)}>
                                    {cursosVivoHovered && (
                                        <>
                                            <div className={styles.textContainer}>
                                                <h2 className={styles.onHoveredText}>
                                                    Aprende con cursos en vivo y mentoría personalizada para resolver tus dudas en tiempo real y desarrollar proyectos semanales.
                                                </h2>
                                            </div>
                                            <div className={styles.iconContainer}>
                                                <Link className={styles.linkBtn} href={'/cursos-en-vivo'}>Ver cursos</Link>
                                            </div>
                                        </>
                                    )}
                                    {!cursosVivoHovered && (
                                        <>
                                            <div className={styles.textContainer}>
                                                <h2 className={styles.textTitle}>
                                                    Cursos en vivo.
                                                </h2>
                                            </div>
                                            <div className={styles.iconContainer}>
                                                <Image className={styles.iconImg} src={'https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FCertificadoIconOrange.png?alt=media&token=459c20e6-831d-4724-b99c-b6c3261db28e'} alt="computerIconOrange" width={1000} height={1000}></Image>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className={styles.bottomContainer}>
                                <div id={styles.clasesParticulares} className={styles.serviceContainer} onMouseEnter={() => setClasesParticularesHovered(true)}
                                    onMouseLeave={() => setClasesParticularesHovered(false)}>
                                    {clasesParticularesHovered && (
                                        <>
                                            <div className={styles.textContainer}>
                                                <h2 className={styles.onHoveredText}>
                                                    Impartimos clases partículares y mentorías el día y hora que mejor te quede, de programación, ofimática o computación.
                                                </h2>
                                            </div>
                                            <div className={styles.iconContainer}>
                                                <Link className={styles.linkBtn} href={'https://wa.link/q2kzi6'} target="_blank">Contacto</Link>
                                            </div>
                                        </>
                                    )}
                                    {!clasesParticularesHovered && (
                                        <>
                                            <div className={styles.textContainer}>
                                                <h2 className={styles.textTitle}>
                                                    Clases particulares.
                                                </h2>
                                            </div>
                                            <div className={styles.iconContainer}>
                                                <Image className={styles.iconBottomImgs} src={'https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FPersonNotifyIconOrange.png?alt=media&token=0af04a95-498f-430f-919b-f36e02c4e7cb'} alt="computerIconOrange" width={1000} height={1000}></Image>
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div id={styles.desarrolloSoftware} className={styles.serviceContainer} onMouseEnter={() => setDesarrolloHovered(true)}
                                    onMouseLeave={() => setDesarrolloHovered(false)}>
                                    {desarrolloHovered && (
                                        <>
                                            <div className={styles.textContainer}>
                                                <h2 className={styles.onHoveredText}>
                                                    Nos encargamos del desarrollo de tu sitio web, aplicación o software para tu emprendimiento o empresa. Cuéntanos tu idea y hagámosla realidad juntos.
                                                </h2>
                                            </div>
                                            <div className={styles.iconContainer}>
                                                <Link className={styles.linkBtn} href={'https://wa.link/ackd1n'} target="_blank">Contacto</Link>
                                            </div>
                                        </>
                                    )}
                                    {!desarrolloHovered && (
                                        <>
                                            <div className={styles.textContainer}>
                                                <h2 className={styles.textTitle}>
                                                    Desarrollo de Software.
                                                </h2>
                                            </div>
                                            <div className={styles.iconContainer}>
                                                <Image className={styles.iconBottomImgs} src={'https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FIdeaIconOrange.png?alt=media&token=bea543ee-a7f9-45da-ac66-df5b2839e067'} alt="computerIconOrange" width={1000} height={1000}></Image>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className={styles.secondMainContainer}>
                            <div id={styles.elaboracionProyectos} className={styles.serviceContainer} onMouseEnter={() => setElaboracionProyectosHovered(true)}
                                onMouseLeave={() => setElaboracionProyectosHovered(false)}>
                                {elaboracionProyectosHovered && (
                                    <>
                                        <div className={styles.textContainer}>
                                            <h2 className={styles.onHoveredText}>
                                                Te ayudamos con la realización de proyectos, exámenes o trabajos para universidad, colegio u otras instituciones.
                                            </h2>
                                        </div>
                                        <div className={styles.iconContainer}>
                                            <Link className={styles.linkBtn} href={'https://wa.link/ifz1ng'} target="_blank">Contacto</Link>
                                        </div>
                                    </>
                                )}
                                {!elaboracionProyectosHovered && (
                                    <>
                                        <div className={styles.textContainer}>
                                            <h2 className={styles.textTitle}>
                                                Elaboración de Proyectos.
                                            </h2>
                                        </div>
                                        <div className={styles.iconContainer}>
                                            <Image className={styles.iconImg} src={'https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FListaTareasIconOrange.png?alt=media&token=318160a1-89d3-4283-b35e-631fa70f278d'} alt="computerIconOrange" width={1000} height={1000}></Image>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div id={styles.otro} className={styles.serviceContainer} onMouseEnter={() => setOtroHovered(true)}
                                onMouseLeave={() => setOtroHovered(false)}>
                                {otroHovered && (
                                    <>
                                        <div className={styles.textContainer}>
                                            <h2 className={styles.onHoveredText}>
                                                Cualquier otra asunto, estamos para ayudarte.
                                            </h2>
                                        </div>
                                        <div className={styles.iconContainer}>
                                            <Link className={styles.linkBtn} href={'https://wa.link/qggv19'} target="_blank">Contacto</Link>
                                        </div>
                                    </>
                                )}
                                {!otroHovered && (
                                    <>
                                        <div className={styles.textContainer}>
                                            <h2 className={styles.textTitle}>
                                                Otro.
                                            </h2>
                                        </div>
                                        <div className={styles.iconContainer}>
                                            <Image className={styles.iconBottomImgs} src={'https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FDefaulImageIconOrange.png?alt=media&token=8f51793e-c5a5-43f1-8b03-d0e317707840'} alt="computerIconOrange" width={1000} height={1000}></Image>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}