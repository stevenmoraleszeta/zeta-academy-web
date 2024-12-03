"use client";

import React from 'react';
import styles from './page.module.css';
import CrudMenu from '@/components/crud-menu/CrudMenu';
import RequireAuth from '@/components/RequireAuth';

const AdminUsers: React.FC = () => {
    document.title = "Administración de usuarios";
    // Fields to display in the list view
    const displayFields = [
        { label: 'Imagen', field: 'photoURL', type: 'image' },
        { label: 'Nombre', field: 'displayName' },
        { label: 'Email', field: 'email' },
        { label: 'Rol', field: 'role' },
    ];

    // Fields to display and edit in the modal
    const editFields = [
        { label: 'Nombre', field: 'displayName' },
        { label: 'Email', field: 'email' },
        { label: 'Edad', field: 'edad', type: 'number' },
        { 
            label: 'País', 
            field: 'pais', 
        },
        { 
            label: 'Rol', 
            field: 'role', 
            type: 'select', 
            selectType: 'combobox',
            options: [
                { label: 'Student', value: 'student' },
                { label: 'Admin', value: 'admin' }
            ]
        }
    ];

    return (
        <RequireAuth>
            <div className={styles.adminCoursesContainer}>
                <CrudMenu
                    collectionName="users"
                    displayFields={displayFields}
                    editFields={editFields}
                    pageTitle='Gestión de Usuarios'
                />
            </div>
        </RequireAuth>
    );
};

export default AdminUsers;
