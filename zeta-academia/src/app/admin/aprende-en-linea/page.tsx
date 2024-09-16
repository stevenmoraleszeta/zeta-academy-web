// File: src/app/admin/learn-online/page.tsx
"use client";

import React from "react";
import styles from './page.module.css';
import CrudMenu from "@/components/crud-menu/CrudMenu";
import { useRouter } from 'next/navigation';

const AdminLearnOnline: React.FC = () => {
    const router = useRouter();

    // Definimos los campos a mostrar en la vista de lista
    const displayFields = [
        { label: 'Imagen', field: 'imageUrl', type: 'image' },
        { label: 'Título', field: 'title' },
        { label: 'Categoría', field: 'category' },
        { label: 'Precio', field: 'price' },
    ];

    // Definimos los campos a mostrar y editar en el modal
    const editFields = [
        { label: 'Título', field: 'title' },
        { label: 'Descripción', field: 'description' },
        { label: 'Categoría', field: 'category' },
        { label: 'Precio', field: 'price', type: 'number' },
        { label: 'Información de Pago', field: 'paymentInfo' },
        { label: 'Certificado', field: 'certificate', type: 'checkbox' },
        { label: 'Información Adicional', field: 'additionalInfo' },
        { label: 'Imagen', field: 'imageUrl', type: 'image' },
    ];

    // Función que maneja la navegación al curso seleccionado
    const handleEditCourse = (course: any) => {
        router.push(`/admin/aprende-en-linea-curso?courseId=${course.id}`);
    };

    // Define los botones de acción personalizados para cada curso
    const itemActions = [
        {
            label: 'Editar',
            handler: handleEditCourse,
        },
    ];

    return (
        <div className={styles.pageContainer}>
            <CrudMenu 
                collectionName="onlineCourses" 
                displayFields={displayFields} 
                editFields={editFields}
                itemActions={itemActions} // Pasa los botones de acción al CrudMenu
            />
        </div>
    );
};

export default AdminLearnOnline;
