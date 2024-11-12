"use client"

import styles from "./completeInformation.module.css";
import Image from "next/image";

export default function CompleteInformation() {

    const userName = 'User'

    const updateInformation = () => {
        console.log('submitted')
    }

    return (
        <>
            <section className={styles.completeInfoMainSection}>
                <div className={styles.formContainer}>
                    <form className={styles.form} onSubmit={updateInformation}>
                        <div className={styles.instructionsContainer}>
                            <Image alt="zetaLogo" src={'https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2FZetaLogoCpp.PNG?alt=media&token=6b854bc7-b25f-4b5c-b2ba-b0298372b67e'} width={1000} height={1000} className={styles.zetaImgLogo}></Image>
                            <p className={styles.instructions}>Bienvenido Steven Morales Fallas, porfavor rellena estos campos antes de continuar para mejorar la experiencia de usuario.</p>
                        </div>
                        <div className={styles.firstFieldsContainer}>
                            <div className={styles.firstFieldsContainer}>
                                <p>Nombre Completo</p>
                                <input type="text" />
                                <p>Número Telefónico</p>
                                <input type="number" />
                            </div>
                            <div className={styles.secondFieldsContainer}>
                                <div className={styles.countryContainer}>
                                    <p>País</p>
                                    <select name="" id="">
                                        <option value=""></option>
                                        <option value=""></option>
                                        <option value=""></option>
                                        <option value=""></option>
                                        <option value=""></option>
                                    </select>
                                </div>
                                <div className={styles.ageContainer}>
                                    <p>Edad</p>
                                    <input type="number" />
                                </div>
                            </div>
                            <button className={styles.completeBtn}>Completar</button>
                        </div>
                    </form>
                </div>
            </section >
        </>
    )
}