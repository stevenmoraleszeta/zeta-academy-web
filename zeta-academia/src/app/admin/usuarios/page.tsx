"use client";

import React from 'react';
import styles from './page.module.css';
import CrudMenu from '@/components/crud-menu/CrudMenu';
import RequireAuth from '@/components/RequireAuth';

const AdminUsers: React.FC = () => {
    // Definimos los campos a mostrar en la vista de lista
    const displayFields = [
        { label: 'Imagen', field: 'photoURL', type: 'image' },
        { label: 'Nombre', field: 'displayName' },
        { label: 'Email', field: 'email' },
        { label: 'Rol', field: 'role', type: 'select' },
    ];

    // Definimos los campos a mostrar y editar en el modal
    const editFields = [
        { label: 'Imagen', field: 'photoURL', type: 'image' },
        { label: 'Nombre', field: 'displayName' },
        { label: 'Email', field: 'email' },
        { label: 'Rol', field: 'role' },
    ];

    return (
        <RequireAuth>
            <div className={styles.adminCoursesContainer}>
                <h2>Gestión de Usuarios</h2>
                <CrudMenu
                    collectionName="users"
                    displayFields={displayFields}
                    editFields={editFields}
                />
            </div>
        </RequireAuth>
    );
};

export default AdminUsers;
