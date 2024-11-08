// File: src/components/navbar/Navbar.jsx
"use client"; // Esto indica que el componente es un Client Component

// Importaciones de Next.js y React
import Link from 'next/link';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext'; // Asegúrate de que este contexto esté bien configurado en Next.js
import defaultProfileImage from '../../assets/img/defaultProfileImage.jpg';

// Importar estilos
import styles from './Navbar.module.css'; // Los estilos globales pueden ir en _app.js

function Navbar() {
    const { currentUser, isAdmin } = useAuth();
    const [profileImage, setProfileImage] = useState(null);

    useEffect(() => {
        if (currentUser) {
            setProfileImage(currentUser.photoURL || defaultProfileImage);
        } else {
            setProfileImage(null);
        }
    }, [currentUser]);

    return (
        <div className={styles.topnav} id="myTopnav">
            <Image alt='ZetaLogo' src="https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2FZetaLogo.png?alt=media&token=d8e33971-ceb0-4d9e-a617-2f026fe4467c" width={50} height={50} className={styles.zLogo}></Image>
            <ul className={styles.navLinks}>
                <li>
                    <Link href="/" className={styles.navbarLink}>
                        APRENDE EN LÍNEA
                    </Link>
                </li>
                <li>
                    <Link href="/cursos-en-linea" className={styles.navbarLink}>
                        CURSOS EN VIVO
                    </Link>
                </li>
                <li>
                    <Link href="/contacto" className={styles.navbarLink}>
                        SERVICIOS
                    </Link>
                </li>
            </ul>
            <div className={styles.manageContainer}>
                {isAdmin && currentUser && (
                    <Link href="/admin" className={styles.accessLink}>
                        ADMIN
                    </Link>
                )}
                {currentUser ? (
                    <Link href="/perfil-usuario" className={styles.profileLink}>
                        <Image
                            className={styles.profileImage}
                            src={profileImage || defaultProfileImage}
                            alt="Profile"
                            width={40}
                            height={40}
                        />
                    </Link>
                ) : (
                    <Link href="/login" className={styles.accessLink}>
                        ACCEDER
                    </Link>
                )}
            </div>
        </div>
    );
}

export default Navbar;
