"use client";

import React from 'react';
import styles from './page.module.css';
import CrudMenu from '@/components/crud-menu/CrudMenu';
import RequireAuth from '@/components/RequireAuth';

const AdminUsers: React.FC = () => {
    document.title = "Gestión de estudiantes - Zeta Academia";
    const displayFields = [
        { label: 'Nombre', field: 'nombreCompleto' },
        { label: 'Email', field: 'email' },
        { label: 'Curso', field: 'curso' },
        { label: 'Rol', field: 'role' },
        { label: 'Nombre de Usuario', field: 'username' },
    ];

    const editFields = [
        { label: 'Nombre Completo', field: 'nombreCompleto' },
        { label: 'Edad', field: 'edad', type: 'number' },
        { label: 'Email', field: 'email' },
        { label: 'Curso', field: 'curso' },
        { label: 'Ocupación', field: 'Ocupacion' },
        { label: 'Estilo de aprendizaje', field: 'estiloAprendizaje' },
        { label: 'Intereses Personales', field: 'Intereses' },
        { label: 'Nivel inicial', field: 'nivelInicial' },
        { label: 'Objetivos Individuales', field: 'objetivosIndividuales' },
        { label: 'Nombre de Usuario', field: 'username' },
        {
            label: 'País',
            field: 'pais',
        },
    ];

    return (
        <RequireAuth>
            <div className={styles.adminCoursesContainer}>
                <CrudMenu
                    collectionName="estudiantes"
                    displayFields={displayFields}
                    editFields={editFields}
                    pageTitle='Gestión de Estudiantes'
                />
            </div>
        </RequireAuth>
    );
};

export default AdminUsers;