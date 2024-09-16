"use client";

import React from "react";
import styles from './page.module.css';
import CrudMenu from "@/components/crud-menu/CrudMenu";

const AdminLearnOnline: React.FC = () => {
    // Definimos los campos a mostrar en la vista de lista
    const displayFields = [
        { label: 'Imagen', field: 'imageUrl', type: 'image' }, // Mostramos la imagen del curso
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
        { label: 'Imagen', field: 'imageUrl', type: 'image' }, // Cambiado a tipo 'image' para subir archivos
    ];

    return (
        <div className={styles.pageContainer}>
            <CrudMenu 
                collectionName="onlineCourses" 
                displayFields={displayFields} 
                editFields={editFields} 
            />
        </div>
    );
};

export default AdminLearnOnline;
