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
                        onClick={() => handleNavigation('/admin/dashboard')}
                    >
                        <AiOutlineDashboard className={styles.buttonIcon} />
                        <span>Dashboard</span>
                    </button>
                    <button
                        className={styles.adminButton}
                        onClick={() => handleNavigation('/admin/usuarios')}
                    >
                        <AiOutlineUser className={styles.buttonIcon} />
                        <span>Usuarios</span>
                    </button>
                    <button
                        className={styles.adminButton}
                        onClick={() => handleNavigation('/admin/cursos')}
                    >
                        <AiOutlineBook className={styles.buttonIcon} />
                        <span>Cursos</span>
                    </button>
                    <button
                        className={styles.adminButton}
                        onClick={() => handleNavigation('/admin/reports')}
                    >
                        <AiOutlineBarChart className={styles.buttonIcon} />
                        <span>Reportes</span>
                    </button>
                    <button
                        className={styles.adminButton}
                        onClick={() => handleNavigation('/admin/finances')}
                    >
                        <AiOutlineBarChart className={styles.buttonIcon} />
                        <span>Finanzas</span>
                    </button>
                    <button
                        className={styles.adminButton}
                        onClick={() => handleNavigation('/admin/settings')}
                    >
                        <AiOutlineSetting className={styles.buttonIcon} />
                        <span>Configuración</span>
                    </button>
                    <button
                        className={styles.adminButton}
                        onClick={() => handleNavigation('/admin/notifications')}
                    >
                        <AiOutlineBell className={styles.buttonIcon} />
                        <span>Notificaciones</span>
                    </button>

                    
                </div>
            </div>
        </RequireAuth>
    );
};

export default AdminMenu;
