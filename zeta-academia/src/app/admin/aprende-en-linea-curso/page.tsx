// File: src/app/admin/learn-online-course/AdminLearnOnlineCourse.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import styles from './page.module.css';
import { FaArrowUp, FaArrowDown, FaCopy, FaTrash, FaEdit } from 'react-icons/fa';

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

    const handleEditModuleTitle = (moduleId: string) => {
        const newTitle = prompt("Edita el título del módulo:");
        if (!newTitle) return;

        const updatedModules = modules.map(mod =>
            mod.id === moduleId ? { ...mod, title: newTitle } : mod
        );

        setModules(updatedModules);
        saveModulesToFirebase(updatedModules);
    };

    const handleEditClassTitle = (moduleId: string, classId: string) => {
        const module = modules.find(mod => mod.id === moduleId);
        if (!module) return;

        const newTitle = prompt("Edita el título de la clase:");
        if (!newTitle) return;

        const updatedClasses = module.classes.map(cls =>
            cls.id === classId ? { ...cls, title: newTitle } : cls
        );

        const updatedModules = modules.map(mod =>
            mod.id === moduleId ? { ...mod, classes: updatedClasses } : mod
        );

        setModules(updatedModules);
        saveModulesToFirebase(updatedModules);
    };

    const handleMoveModule = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === modules.length - 1) return;

        const newModules = [...modules];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        [newModules[index], newModules[swapIndex]] = [newModules[swapIndex], newModules[index]];

        setModules(newModules);
        saveModulesToFirebase(newModules);
    };

    const handleDuplicateModule = (index: number) => {
        const moduleToDuplicate = { ...modules[index], id: `module-${modules.length + 1}` };
        const updatedModules = [...modules, moduleToDuplicate];
        setModules(updatedModules);
        saveModulesToFirebase(updatedModules);
    };

    const handleDeleteModule = (moduleId: string) => {
        const updatedModules = modules.filter(mod => mod.id !== moduleId);
        setModules(updatedModules);
        saveModulesToFirebase(updatedModules);
    };

    const handleMoveClass = (moduleId: string, classIndex: number, direction: 'up' | 'down') => {
        const module = modules.find(mod => mod.id === moduleId);
        if (!module) return;

        if (direction === 'up' && classIndex === 0) return;
        if (direction === 'down' && classIndex === module.classes.length - 1) return;

        const newClasses = [...module.classes];
        const swapIndex = direction === 'up' ? classIndex - 1 : classIndex + 1;
        [newClasses[classIndex], newClasses[swapIndex]] = [newClasses[swapIndex], newClasses[classIndex]];

        const updatedModules = modules.map(mod =>
            mod.id === moduleId ? { ...mod, classes: newClasses } : mod
        );

        setModules(updatedModules);
        saveModulesToFirebase(updatedModules);
    };

    const handleDuplicateClass = (moduleId: string, classIndex: number) => {
        const module = modules.find(mod => mod.id === moduleId);
        if (!module) return;

        const classToDuplicate = { ...module.classes[classIndex], id: `class-${module.classes.length + 1}` };
        const updatedClasses = [...module.classes, classToDuplicate];

        const updatedModules = modules.map(mod =>
            mod.id === moduleId ? { ...mod, classes: updatedClasses } : mod
        );

        setModules(updatedModules);
        saveModulesToFirebase(updatedModules);
    };

    const handleDeleteClass = (moduleId: string, classId: string) => {
        const updatedModules = modules.map(mod =>
            mod.id === moduleId
                ? { ...mod, classes: mod.classes.filter(cls => cls.id !== classId) }
                : mod
        );

        setModules(updatedModules);
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
                    {modules.map((module, index) => (
                        <li key={module.id} className={styles.moduleItem}>
                            <div className={styles.moduleHeader}>
                                <span onClick={() => handleToggleModule(module.id)} className={styles.moduleTitle}>
                                    {module.title}
                                </span>
                                <div className={styles.iconContainer}>
                                    <FaEdit onClick={() => handleEditModuleTitle(module.id)} />
                                    <FaArrowUp onClick={() => handleMoveModule(index, 'up')} />
                                    <FaArrowDown onClick={() => handleMoveModule(index, 'down')} />
                                    <FaCopy onClick={() => handleDuplicateModule(index)} />
                                    <FaTrash onClick={() => handleDeleteModule(module.id)} />
                                </div>
                            </div>
                            {expandedModules[module.id] && (
                                <ul className={styles.classList}>
                                    {module.classes.map((clase, classIndex) => (
                                        <li key={clase.id} className={styles.classItem}>
                                            <span onClick={() => handleSelectClass(module.id, clase.id)} className={styles.classTitle}>
                                                {clase.title}
                                            </span>
                                            <div className={styles.iconContainer}>
                                                <FaEdit onClick={() => handleEditClassTitle(module.id, clase.id)} />
                                                <FaArrowUp onClick={() => handleMoveClass(module.id, classIndex, 'up')} />
                                                <FaArrowDown onClick={() => handleMoveClass(module.id, classIndex, 'down')} />
                                                <FaCopy onClick={() => handleDuplicateClass(module.id, classIndex)} />
                                                <FaTrash onClick={() => handleDeleteClass(module.id, clase.id)} />
                                            </div>
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
