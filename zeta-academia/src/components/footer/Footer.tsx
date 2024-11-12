"use client"; // Esto indica que el componente es un Client Component

// Importaciones de Next.js y React
import Link from 'next/link';
import Image from 'next/image';
import React from 'react';
import { FaWhatsapp, FaInstagram } from 'react-icons/fa';

// Importar estilos
import styles from './Footer.module.css'; // Los estilos globales pueden ir en _app.js

function FooterZ() {
    return (
        <footer className={styles.footer}>
          {/* Contenedor izquierdo (30%) */}
          <div className={styles.leftContainer}>
            <Link href="/" className={styles.imgLink}>
              <Image
                alt="ZetaLogo"
                src="https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2FZetaLogo.png?alt=media&token=d8e33971-ceb0-4d9e-a617-2f026fe4467c"
                width={100}
                height={100}
                className={styles.zLogo}
              />
            </Link>
            <div className={styles.contactInfo}>
              <p>
                <FaWhatsapp style={{ marginRight: '8px' }} /> +50661304830
              </p>
              <p>
                <FaInstagram style={{ marginRight: '8px' }} /> stevenmoraleszeta
              </p>
              <p>
                <FaInstagram style={{ marginRight: '8px' }} /> zeta.steam
              </p>
            </div>
          </div>
    
          {/* Contenedor derecho (70%) */}
          <div className={styles.rightContainer}>
            <div className={styles.separator}></div>
            <div className={styles.navColumn}>
              <a href="/cursos-en-linea">Cursos en línea</a>
              <a href="/cursos-en-vivo">Cursos en vivo</a>
            </div>
    
            <div className={styles.separator}></div>
    
            <div className={styles.navColumn}>
              <a href="https://wa.link/ifz1ng">Elaboración de proyectos</a>
              <a href="https://wa.link/q2kzi6">Clases particulares</a>
            </div>
    
            <div className={styles.separator}></div>
    
            <div className={styles.navColumn}>
              <a href="https://wa.link/ackd1n">Desarrollo de Software</a>
              <a href="https://wa.link/ek3xtk">Unirse a ZETA</a>
            </div>
          </div>
        </footer>
    );
}

export default FooterZ;
