"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from 'next/navigation'; // Para obtener el ID del curso
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase"; // Asegúrate de tener configurada tu conexión a Firebase
import styles from './page.module.css';

interface Module {
    id: string;
    title: string;
    classes: Class[];
}

interface Class {
    id: string;
    title: string;
    content: ContentItem[];
}

interface ContentItem {
    type: 'video' | 'text' | 'image' | 'file';
    value: string;
}

const AdminLearnOnlineCourse: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const courseId = searchParams.get('courseId'); // Obtiene el ID del curso desde la URL
    const [modules, setModules] = useState<Module[]>([]);
    const [selectedModule, setSelectedModule] = useState<Module | null>(null);
    const [selectedClass, setSelectedClass] = useState<Class | null>(null);

    useEffect(() => {
        if (!courseId) {
            alert("No se encontró el ID del curso.");
            router.push('/admin/learn-online'); // Redirigir si no se encuentra el ID
            return;
        }
        fetchCourseModules(courseId);
    }, [courseId]);

    // Cargar los módulos del curso desde Firebase
    const fetchCourseModules = async (courseId: string) => {
        const courseRef = doc(db, "onlineCourses", courseId);
        const courseSnap = await getDoc(courseRef);
        if (courseSnap.exists()) {
            setModules(courseSnap.data().modules || []);
        } else {
            console.error("No se encontró el curso.");
        }
    };

    const handleAddModule = () => {
        const newModule: Module = {
            id: `module-${modules.length + 1}`,
            title: `Módulo ${modules.length + 1}`,
            classes: [],
        };
        setModules([...modules, newModule]);
        saveModulesToFirebase([...modules, newModule]);
    };

    const handleSelectModule = (module: Module) => {
        setSelectedModule(module);
        setSelectedClass(null);
    };

    const handleAddClass = () => {
        if (!selectedModule) return;

        const newClass: Class = {
            id: `class-${selectedModule.classes.length + 1}`,
            title: `Clase ${selectedModule.classes.length + 1}`,
            content: [],
        };

        const updatedModules = modules.map((mod) =>
            mod.id === selectedModule.id
                ? { ...mod, classes: [...mod.classes, newClass] }
                : mod
        );

        setModules(updatedModules);
        setSelectedModule({ ...selectedModule, classes: [...selectedModule.classes, newClass] });
        saveModulesToFirebase(updatedModules);
    };

    const handleSelectClass = (clase: Class) => {
        setSelectedClass(clase);
    };

    const handleAddContent = (type: ContentItem['type'], value: string) => {
        if (!selectedClass || !selectedModule) return;

        const newContent: ContentItem = { type, value };
        const updatedClass = { ...selectedClass, content: [...selectedClass.content, newContent] };

        const updatedModules = modules.map((mod) =>
            mod.id === selectedModule.id
                ? {
                    ...mod,
                    classes: mod.classes.map((cls) =>
                        cls.id === updatedClass.id ? updatedClass : cls
                    ),
                }
                : mod
        );

        setModules(updatedModules);
        setSelectedClass(updatedClass);
        saveModulesToFirebase(updatedModules);
    };

    // Función para guardar los módulos en Firebase
    const saveModulesToFirebase = async (updatedModules: Module[]) => {
        if (!courseId) return;

        try {
            const courseRef = doc(db, "onlineCourses", courseId);
            await updateDoc(courseRef, { modules: updatedModules });
            console.log("Módulos guardados exitosamente.");
        } catch (error) {
            console.error("Error al guardar los módulos:", error);
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.sideBar}>
                <h2>Módulos</h2>
                <button className={styles.button} onClick={handleAddModule}>
                    Añadir Módulo
                </button>
                <ul className={styles.moduleList}>
                    {modules.map((module) => (
                        <li
                            key={module.id}
                            className={styles.moduleItem}
                            onClick={() => handleSelectModule(module)}
                        >
                            {module.title}
                        </li>
                    ))}
                </ul>
            </div>
            <div className={styles.mainContent}>
                {selectedModule ? (
                    <>
                        <h2>{selectedModule.title}</h2>
                        <button className={styles.button} onClick={handleAddClass}>
                            Añadir Clase
                        </button>
                        <ul className={styles.moduleList}>
                            {selectedModule.classes.map((clase) => (
                                <li
                                    key={clase.id}
                                    className={styles.moduleItem}
                                    onClick={() => handleSelectClass(clase)}
                                >
                                    {clase.title}
                                </li>
                            ))}
                        </ul>
                        {selectedClass && (
                            <div>
                                <h3>{selectedClass.title}</h3>
                                <button className={styles.button} onClick={() => handleAddContent('video', 'YouTube Video URL')}>
                                    Agregar Video
                                </button>
                                <button className={styles.button} onClick={() => handleAddContent('text', 'Texto de la clase')}>
                                    Agregar Texto
                                </button>
                                <button className={styles.button} onClick={() => handleAddContent('image', 'URL de Imagen')}>
                                    Agregar Imagen
                                </button>
                                <button className={styles.button} onClick={() => handleAddContent('file', 'URL de Archivo')}>
                                    Agregar Archivo
                                </button>

                                <div>
                                    {selectedClass.content.map((content, index) => (
                                        <div key={index}>
                                            {content.type === 'video' && <p>Video: {content.value}</p>}
                                            {content.type === 'text' && <p>Texto: {content.value}</p>}
                                            {content.type === 'image' && <img src={content.value} alt="Imagen de clase" />}
                                            {content.type === 'file' && <a href={content.value} download>Descargar Archivo</a>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <p>Selecciona un módulo para empezar</p>
                )}
            </div>
        </div>
    );
};

export default AdminLearnOnlineCourse;
