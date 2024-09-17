"use client";

import React, { useEffect, useState } from "react";
import CrudMenu from "@/components/crud-menu/CrudMenu";
import useFetchData from "@/app/hooks/useFetchData";
import { db } from "@/firebase/firebase";

const ProyectosEstudiantesPage: React.FC = () => {
    const { data: adminUsersData } = useFetchData("users");
    const { data: courses } = useFetchData("onlineCourses");
    const collectionName = "studentProjects";

    const adminUsers = adminUsersData
        ? adminUsersData
            .filter(user => user.role === 'admin')
            .map(user => ({
                value: user.id,
                label: user.displayName || user.email
            }))
        : [];

    const displayFields = [
        { label: "Nombre del Proyecto", field: "nombreProyecto" },
        { label: "Correo del Estudiante", field: "correoEstudiante" },
        { label: "Calificación", field: "calificacion" },
        { label: "Estado", field: "estado" },
    ];

    const editFields = [
        { label: "Nombre del Proyecto", field: "nombreProyecto", type: "text" },
        { label: "Descripción", field: "descripcion", type: "textarea" },
        { label: "Archivo", field: "archivoUrl", type: "file" },
        { label: "Correo del Estudiante", field: "correoEstudiante", type: "email" },
        { label: "Curso", field: "curso", type: "select", selectType: "combobox", options: courses ? courses.map(course => ({ value: course.id, label: course.title })) : [] }, // Added null check for courses
        { label: "Fecha de Entrega", field: "fechaEntrega", type: "date" },
        { label: "Fecha de Revisión", field: "fechaRevision", type: "date" },
        { label: "Revisado por", field: "revisadoPor", type: "select", selectType: "combobox", options: adminUsers },
        { label: "Calificación", field: "calificacion", type: "number" },
        { label: "Estado", field: "estado", type: "select", selectType: "combobox", options: [
            { value: "sin revisar", label: "Sin Revisar" },
            { value: "revisando", label: "Revisando" },
            { value: "revisado", label: "Revisado" }
        ]},
    ];

    return (
        <div>
            <h1>Proyectos de Estudiantes</h1>
            <CrudMenu
                collectionName={collectionName}
                displayFields={displayFields}
                editFields={editFields}
            />
        </div>
    );
};

export default ProyectosEstudiantesPage;
