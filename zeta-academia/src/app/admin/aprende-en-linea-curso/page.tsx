"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import styles from './page.module.css';
import { FaArrowUp, FaArrowDown, FaCopy, FaTrash, FaEdit } from 'react-icons/fa'; // Iconos para las acciones

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
    const courseId = searchParams.get('courseId');
    const [modules, setModules] = useState<Module[]>([]);
    const [selectedModule, setSelectedModule] = useState<Module | null>(null);
    const [selectedClass, setSelectedClass] = useState<Class | null>(null);
    const [expandedModules, setExpandedModules] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        if (!courseId) {
            router.push('/admin/learn-online');
            return;
        }
        fetchCourseModules(courseId);
    }, [courseId]);

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
        const updatedModules = [...modules, newModule];
        setModules(updatedModules);
        saveModulesToFirebase(updatedModules);
    };

    const handleToggleModule = (moduleId: string) => {
        setExpandedModules((prev) => ({
            ...prev,
            [moduleId]: !prev[moduleId],
        }));
    };

    const handleAddClass = (moduleId: string) => {
        const module = modules.find(mod => mod.id === moduleId);
        if (!module) return;

        const newClass: Class = {
            id: `class-${module.classes.length + 1}`,
            title: `Clase ${module.classes.length + 1}`,
            content: [],
        };

        const updatedModules = modules.map((mod) =>
            mod.id === moduleId
                ? { ...mod, classes: [...mod.classes, newClass] }
                : mod
        );

        setModules(updatedModules);
        setSelectedModule({ ...module, classes: [...module.classes, newClass] });
        saveModulesToFirebase(updatedModules);
    };

    const handleSelectClass = (moduleId: string, classId: string) => {
        const module = modules.find(mod => mod.id === moduleId);
        const clase = module?.classes.find(cls => cls.id === classId);
        if (module && clase) {
            setSelectedModule(module);
            setSelectedClass(clase);
        }
    };

    const handleAddContent = (type: ContentItem['type']) => {
        if (!selectedClass || !selectedModule) return;

        const value = prompt(`Ingresa el ${type === 'video' ? 'URL del Video' : type === 'text' ? 'Texto' : 'URL de la Imagen/Archivo'}`);
        if (!value) return;

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

    // Función para mover el contenido hacia arriba
    const handleMoveUp = (index: number) => {
        if (!selectedClass || index === 0) return;
        const updatedContent = [...selectedClass.content];
        [updatedContent[index - 1], updatedContent[index]] = [updatedContent[index], updatedContent[index - 1]];
        updateClassContent(updatedContent);
    };

    // Función para mover el contenido hacia abajo
    const handleMoveDown = (index: number) => {
        if (!selectedClass || index === selectedClass.content.length - 1) return;
        const updatedContent = [...selectedClass.content];
        [updatedContent[index + 1], updatedContent[index]] = [updatedContent[index], updatedContent[index + 1]];
        updateClassContent(updatedContent);
    };

    // Función para duplicar el contenido
    const handleDuplicate = (index: number) => {
        if (!selectedClass) return;
        const updatedContent = [...selectedClass.content, selectedClass.content[index]];
        updateClassContent(updatedContent);
    };

    // Función para eliminar el contenido
    const handleDelete = (index: number) => {
        if (!selectedClass) return;
        const updatedContent = selectedClass.content.filter((_, i) => i !== index);
        updateClassContent(updatedContent);
    };

    // Función para editar el contenido
    const handleEdit = (index: number) => {
        if (!selectedClass) return;
        const content = selectedClass.content[index];
        const newValue = prompt(`Edita el ${content.type}:`, content.value);
        if (!newValue) return;

        const updatedContent = [...selectedClass.content];
        updatedContent[index] = { ...content, value: newValue };
        updateClassContent(updatedContent);
    };

    // Actualiza el contenido de la clase seleccionada
    const updateClassContent = (updatedContent: ContentItem[]) => {
        if (!selectedClass || !selectedModule) return;

        const updatedClass = { ...selectedClass, content: updatedContent };
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
                        <li key={module.id} className={styles.moduleItem}>
                            <div className={styles.moduleHeader} onClick={() => handleToggleModule(module.id)}>
                                <span>{module.title}</span>
                            </div>
                            {expandedModules[module.id] && (
                                <ul className={styles.classList}>
                                    {module.classes.map((clase) => (
                                        <li
                                            key={clase.id}
                                            className={styles.classItem}
                                            onClick={() => handleSelectClass(module.id, clase.id)}
                                        >
                                            {clase.title}
                                        </li>
                                    ))}
                                    <button className={styles.addClassButton} onClick={() => handleAddClass(module.id)}>
                                        Añadir Clase
                                    </button>
                                </ul>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
            <div className={styles.mainContent}>
                {selectedClass ? (
                    <div>
                        <h3>{selectedClass.title}</h3>
                        <button className={styles.button} onClick={() => handleAddContent('video')}>
                            Agregar Video
                        </button>
                        <button className={styles.button} onClick={() => handleAddContent('text')}>
                            Agregar Texto
                        </button>
                        <button className={styles.button} onClick={() => handleAddContent('image')}>
                            Agregar Imagen
                        </button>
                        <button className={styles.button} onClick={() => handleAddContent('file')}>
                            Agregar Archivo
                        </button>

                        <div className={styles.contentList}>
                            {selectedClass.content.map((content, index) => (
                                <div key={index} className={styles.contentItem}>
                                    {content.type === 'video' && <iframe src={content.value} title="Video" />}
                                    {content.type === 'text' && <p>{content.value}</p>}
                                    {content.type === 'image' && <img src={content.value} alt="Imagen de clase" />}
                                    {content.type === 'file' && <a href={content.value} download>Descargar Archivo</a>}
                                    <div className={styles.iconContainer}>
                                        <FaEdit onClick={() => handleEdit(index)} />
                                        <FaArrowUp onClick={() => handleMoveUp(index)} />
                                        <FaArrowDown onClick={() => handleMoveDown(index)} />
                                        <FaCopy onClick={() => handleDuplicate(index)} />
                                        <FaTrash onClick={() => handleDelete(index)} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <p>Selecciona una clase para empezar</p>
                )}
            </div>
        </div>
    );
};

export default AdminLearnOnlineCourse;
