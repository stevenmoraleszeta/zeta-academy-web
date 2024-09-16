// File: src/pages/admin/page.tsx
"use client"; // Indica que este componente se ejecuta en el cliente

import styles from './page.module.css'; // Importa los estilos modulares
import React from 'react';
import { useRouter } from 'next/navigation'; // Usa el enrutador de Next.js
import RequireAuth from '@/components/RequireAuth'; // Asegúrate de que esté correctamente configurado

import {
    AiOutlineDashboard,
    AiOutlineUser,
    AiOutlineBook,
    AiOutlineBarChart,
    AiOutlineSetting,
    AiOutlineBell,
} from 'react-icons/ai';

const AdminMenu: React.FC = () => {
    const router = useRouter();

    // Función para redirigir a las rutas correspondientes
    const handleNavigation = (path: string) => {
        router.push(path);
    };

    return (
        <RequireAuth>
            <div className={styles.adminMenuContainer}>
                <div className={styles.buttonContainer}>
                    <button
                        className={styles.adminButton}
                        onClick={() => handleNavigation('/admin/aprende-en-linea')}
                    >
                        <AiOutlineBook className={styles.buttonIcon} />
                        <span>Aprende en línea</span>
                    </button>
                    <button
                        className={styles.adminButton}
                        onClick={() => handleNavigation('/admin/cursos-en-vivo')}
                    >
                        <AiOutlineBook className={styles.buttonIcon} />
                        <span>Cursos en Vivo</span>
                    </button>
                </div>
            </div>
        </RequireAuth>
    );
};

export default AdminMenu;
