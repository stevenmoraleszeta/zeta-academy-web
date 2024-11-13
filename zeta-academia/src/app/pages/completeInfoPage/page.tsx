"use client"

import { useEffect, useState } from "react";
import styles from "./completeInformation.module.css";
import Image from "next/image";

import { useAuth } from "@/context/AuthContext";
import { getAuth, updateProfile } from 'firebase/auth';
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { useRouter } from "next/navigation";

export default function CompleteInformation() {
    const { currentUser, updateCurrentUser } = useAuth();
    const auth = getAuth();
    const [userInfo, setUserInfo] = useState({
        displayName: '',
        number: '',
        edad: '',
        pais: '',
    });
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (currentUser) {
            setUserInfo({
                displayName: currentUser.displayName || '',
                number: currentUser.number || '',
                edad: currentUser.edad || '',
                pais: currentUser.pais || '',
            });
            setLoading(false);
        }
    }, [currentUser]);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setUserInfo((prevInfo) => ({
            ...prevInfo,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            if (auth.currentUser) {
                await updateProfile(auth.currentUser, {
                    displayName: userInfo.displayName,
                });
                const userDoc = doc(db, "users", auth.currentUser.uid);
                await setDoc(userDoc, {
                    displayName: userInfo.displayName,
                    number: userInfo.number,
                    edad: userInfo.edad,
                    pais: userInfo.pais,
                }, { merge: true });
                router.push('/platform')
            }
        } catch (err) {
            console.log('Error al actualizar usuario: ' + err)
        }
    }

    if (loading) {
        return <div>Cargando...</div>;
    }

    return (
        <>
            <section className={styles.completeInfoMainSection}>
                <div className={styles.formContainer}>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.instructionsContainer}>
                            <Image alt="zetaLogo" src={'https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2FZetaLogoCpp.PNG?alt=media&token=6b854bc7-b25f-4b5c-b2ba-b0298372b67e'} width={1000} height={1000} className={styles.zetaImgLogo}></Image>
                            <p className={styles.instructions}>Bienvenido Steven Morales Fallas, por favor rellena estos campos antes de continuar para mejorar la experiencia de usuario.</p>
                        </div>
                        <div className={styles.firstFieldsContainer}>
                            <div className={styles.firstFieldsContainer}>
                                <p className={styles.formLabelTxt}>Nombre Completo</p>
                                <input type="text" name="displayName" value={userInfo.displayName} onChange={handleChange} required />
                                <p className={styles.formLabelTxt}>Número Telefónico</p>
                                <input type="number" name="number" value={userInfo.number} onChange={handleChange} required />
                            </div>
                            <div className={styles.secondFieldsContainer}>
                                <div className={styles.countryContainer}>
                                    <p className={styles.formLabelTxt}>País</p>
                                    <select name="pais" id="countrySelector" onChange={handleChange}>
                                        <option disabled defaultValue={'Sin País'} selected>Seleccionar país</option>
                                        <option value="Costa Rica">Costa Rica</option>
                                        <option value="Nicaragua">Nicaragua</option>
                                        <option value="El Salvador">El Salvador</option>
                                        <option value="Colombia">Colombia</option>
                                        <option value="México">México</option>
                                        <option value="Estados Unidos">Estados Unidos</option>
                                    </select>
                                </div>
                                <div className={styles.ageContainer}>
                                    <p className={styles.formLabelTxt}>Edad</p>
                                    <input min={0} type="number" name='edad' value={userInfo.edad} required onChange={handleChange} />
                                </div>
                            </div>
                            <button type="submit" className={styles.completeBtn}>Completar</button>
                        </div>
                    </form>
                </div>
            </section >
        </>
    )
}