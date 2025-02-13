"use client"; // Indica que este componente se ejecuta en el cliente

import styles from './page.module.css'; // Importa los estilos modulares
import React from 'react';
import { useRouter } from 'next/navigation'; // Usa el enrutador de Next.js
import RequireAuth from '@/components/RequireAuth'; // Asegúrate de que esté correctamente configurado

import {
    AiOutlineUser, // Usuarios
    AiOutlineFileText, // Tickets
    AiOutlineRead, // Cursos en línea
    AiOutlineLaptop, // Cursos en Vivo
    AiOutlineProject, // Proyectos Estudiantes
} from 'react-icons/ai'; // Importamos íconos relacionados con los textos

const AdminMenu = () => {
    //titulo tab
    document.title = "Menu Admin - ZETA";
    const router = useRouter();

    // Función para redirigir a las rutas correspondientes
    const handleNavigation = (path) => {
        router.push(path);
    };

    return (
        <RequireAuth>
            <div className={styles.adminMenuContainer}>
                <div className={styles.buttonContainer}>
                    <button
                        className={styles.adminButton}
                        onClick={() => handleNavigation('/admin/usuarios')}
                    >
                        <AiOutlineUser className={styles.buttonIcon} />
                        <span>Usuarios</span>
                    </button>
                    <button
                        className={styles.adminButton}
                        onClick={() => handleNavigation('/admin/students')}
                    >
                        <AiOutlineRead className={styles.buttonIcon} />
                        <span>Estudiantes</span>
                    </button>
                    <button
                        className={styles.adminButton}
                        onClick={() => handleNavigation('/admin/students-proyects')}
                    >
                        <AiOutlineProject className={styles.buttonIcon} />
                        <span>Proyectos Estudiantes</span>
                    </button>
                    <button
                        className={styles.adminButton}
                        onClick={() => handleNavigation('/admin/manageLiveCourses')}
                    >
                        <AiOutlineLaptop className={styles.buttonIcon} />
                        <span>Cursos en vivo</span>
                    </button>
                </div>
            </div>
        </RequireAuth>
    );
};

export default AdminMenu;
