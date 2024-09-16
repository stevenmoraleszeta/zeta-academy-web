"use client";

import React from 'react';
import styles from './page.module.css';
import CrudMenu from '@/components/crud-menu/CrudMenu';
import RequireAuth from '@/components/RequireAuth';

const AdminLiveCourses: React.FC = () => {
    // Definimos los campos a mostrar en la vista de lista
    const displayFields = [
        { label: 'Imagen', field: 'imageUrl', type: 'image' },
        { label: 'Título', field: 'title' },
        { label: 'Categoría', field: 'category' },
        { label: 'Horario', field: 'schedule' },
        { label: 'Precio', field: 'price' },
    ];

    // Definimos los campos a mostrar y editar en el modal
    const editFields = [
        { label: 'Título', field: 'title' },
        { label: 'Descripción', field: 'description' },
        { label: 'Categoría', field: 'category' },
        { label: 'Precio', field: 'price', type: 'number' },
        { label: 'Duración', field: 'duration' },
        { label: 'Horario', field: 'schedule', type: 'text'},
        { label: 'Información de Pago', field: 'paymentInfo' },
        { label: 'Certificado', field: 'certificate', type: 'checkbox' },
        { label: 'Información Adicional', field: 'additionalInfo' },
        { label: 'Imagen', field: 'imageUrl', type: 'image' },
    ];

    return (
        <RequireAuth>
            <div className={styles.adminCoursesContainer}>
                <h2>Gestión de Cursos en Vivo</h2>
                <CrudMenu 
                    collectionName="liveCourses" 
                    displayFields={displayFields} 
                    editFields={editFields} 
                />
            </div>
        </RequireAuth>
    );
};

export default AdminLiveCourses;
