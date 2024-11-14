// src/app/login/page.tsx
"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./login.module.css";

function Login() {
    const { loginWithGoogle, currentUser, missingInfo } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (currentUser && missingInfo) {
            router.push("/pages/completeInfoPage");
        } else if (currentUser && !missingInfo){
            router.push("/cursos-en-linea");
        }
    }, [currentUser, missingInfo, router]);

    return (
        <section>
                <>
                    <div className={styles.loginMainContainer}>
                        <div className={styles.loginContainer}>
                            <div className={styles.imgContainer}>
                                <Image width={500} height={500} alt="zetaLogo" src={'https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2FZetaLogoCp.PNG?alt=media&token=4ab20b3d-09e0-403c-851a-154d51af90b6'} className={styles.zetaLogo}></Image>
                            </div>
                            <div className={styles.textContainer}>
                                <p className={styles.loginText}>Inicia sesión o crea tu cuenta con Google para acceder a más funcionalidades.</p>
                            </div>
                            <button className={styles.googleBtn} onClick={loginWithGoogle}>
                                <Image alt="googleLogo" width={500} height={500} src={'https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2FgoogleLogo.jpg?alt=media&token=0acdd2e2-fbcc-4607-ba96-248c94250906'} className={styles.googleBtnLogo}></Image>
                                <span>Continuar con Google</span>
                            </button>
                        </div>
                    </div>
                </>
            )
        </section>
    );
}

export default Login;
