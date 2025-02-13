"use client";

import React from 'react';
import styles from './page.module.css';
import CrudMenu from '@/components/crud-menu/CrudMenu';
import RequireAuth from '@/components/RequireAuth';

const AdminUsers = () => {
    document.title = "Administración de Usuarios - ZETA";
    // Fields to display in the list view
    const displayFields = [
        { label: 'Titulo', field: 'title' },
        { label: 'Categoria', field: 'category' },
    ];

    // Fields to display and edit in the modal
    const editFields = [
        { label: 'Titulo', field: 'title' },
        { label: 'Categoria', field: 'category' },
        { label: 'Descripcion', field: 'description' },
    ];

    return (
        <RequireAuth>
            <div className={styles.adminCoursesContainer}>
                <CrudMenu
                    collectionName="liveCourses"
                    displayFields={displayFields}
                    editFields={editFields}
                    pageTitle='Gestión de Usuarios'
                />
            </div>
        </RequireAuth>
    );
};

export default AdminUsers;
