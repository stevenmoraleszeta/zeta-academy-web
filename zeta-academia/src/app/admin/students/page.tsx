"use client";

import React from 'react';
import styles from './page.module.css';
import CrudMenu from '@/components/crud-menu/CrudMenu';
import RequireAuth from '@/components/RequireAuth';

const AdminUsers: React.FC = () => {
    document.title = "Gestión de estudiantes - Zeta Academia";
    // Fields to display in the list view
    const displayFields = [
        { label: 'Nombre', field: 'nombreCompleto' },
        { label: 'Email', field: 'email' },
        { label: 'Rol', field: 'role' },
        { label: 'Nombre de Usuario', field: 'username' },
    ];

    // Fields to display and edit in the modal
    const editFields = [
        { label: 'Nombre Completo', field: 'nombreCompleto' },
        { label: 'Email', field: 'email' },
        { label: 'Edad', field: 'edad', type: 'number' },
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