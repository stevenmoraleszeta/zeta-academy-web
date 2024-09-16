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
    const { currentUser } = useAuth();
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
            <Link href="/" className={styles.navbarLink}>
                Inicio
            </Link>
            <Link href="/cursos-en-linea" className={styles.navbarLink}>
                Aprende en Línea
            </Link>
            <Link href="/cursos-en-vivo" className={styles.navbarLink}>
                Cursos en Vivo
            </Link>
            <Link href="/aprende-python" className={styles.navbarLink}>
                Aprende Python
            </Link>
            <Link href="/contacto" className={styles.navbarLink}>
                Contacto
            </Link>
            <Link href={currentUser ? '/admin' : '/login'} className={styles.navbarLink}>
                Admin
            </Link>
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
                <Link href="/login" className={styles.navbarLink}>
                    Iniciar Sesión
                </Link>
            )}
        </div>
    );
}

export default Navbar;
