"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/firebase/firebase";
import { v4 as uuidv4 } from "uuid";
import imageCompression from "browser-image-compression";
import styles from './page.module.css';
import { FaArrowUp, FaArrowDown, FaCopy, FaTrash, FaEdit } from 'react-icons/fa';

// Modal component
const Modal = ({ isOpen, onClose, onSave, title, inputLabel = "Editar Título", confirmMode = false, isTextArea = false }) => {
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        if (isOpen) setInputValue(title);
    }, [isOpen, title]);

    const handleSave = () => {
        onSave(inputValue);
        onClose();
    };

    return (
        isOpen ? (
            <div className={styles.modalOverlay}>
                <div className={styles.modal}>
                    <h3>{inputLabel}</h3>
                    {!confirmMode ? (
                        isTextArea ? (
                            <textarea
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className={styles.textArea}
                                rows={10}
                            />
                        ) : (
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className={styles.input}
                            />
                        )
                    ) : (
                        <p>¿Estás seguro de realizar esta acción?</p>
                    )}
                    <div className={styles.modalButtons}>
                        <button onClick={handleSave} className={styles.button}>
                            {confirmMode ? 'Confirmar' : 'Guardar'}
                        </button>
                        <button onClick={onClose} className={styles.buttonCancel}>Cancelar</button>
                    </div>
                </div>
            </div>
        ) : null
    );
};

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
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [modalType, setModalType] = useState<'module' | 'class' | 'content' | null>(null);
    const [editingModule, setEditingModule] = useState<Module | null>(null);
    const [editingClass, setEditingClass] = useState<Class | null>(null);
    const [editingContent, setEditingContent] = useState<ContentItem | null>(null);
    const [modalInputLabel, setModalInputLabel] = useState<string>("");
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [deleteAction, setDeleteAction] = useState<() => void>(() => {});

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

    const openEditModal = (type: 'module' | 'class' | 'content', module?: Module, clase?: Class, content?: ContentItem) => {
        setEditingModule(module || null);
        setEditingClass(clase || null);
        setEditingContent(content || null);
        setModalType(type);
        setModalInputLabel(
            type === 'module' ? 'Editar Título del Módulo' :
            type === 'class' ? 'Editar Título de la Clase' :
            content?.type === 'text' ? 'Editar Texto' : 'Editar Contenido'
        );
        setIsModalOpen(true);
    };

    const handleSaveTitle = (newValue: string) => {
        if (modalType === 'module' && editingModule) {
            const updatedModules = modules.map(mod =>
                mod.id === editingModule.id ? { ...mod, title: newValue } : mod
            );
            setModules(updatedModules);
            saveModulesToFirebase(updatedModules);
        } else if (modalType === 'class' && editingModule && editingClass) {
            const updatedClasses = editingModule.classes.map(cls =>
                cls.id === editingClass.id ? { ...cls, title: newValue } : cls
            );
            const updatedModules = modules.map(mod =>
                mod.id === editingModule.id ? { ...mod, classes: updatedClasses } : mod
            );
            setModules(updatedModules);
            saveModulesToFirebase(updatedModules);
        } else if (modalType === 'content' && selectedClass && editingContent) {
            const updatedContent = [...selectedClass.content];
            if (editingContent.value === '') {
                // Si es un nuevo contenido, añádelo al final
                updatedContent.push({ ...editingContent, value: newValue });
            } else {
                // Si es un contenido existente, actualízalo
                const index = updatedContent.findIndex(item => item === editingContent);
                if (index !== -1) {
                    updatedContent[index] = { ...editingContent, value: newValue };
                }
            }
            updateClassContent(updatedContent);
        }
        setIsModalOpen(false);
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

    const openConfirmModal = (action: () => void) => {
        setDeleteAction(() => action);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmDelete = () => {
        deleteAction();
        setIsConfirmModalOpen(false);
    };

    const handleDeleteModule = (moduleId: string) => {
        openConfirmModal(() => {
            const updatedModules = modules.filter(mod => mod.id !== moduleId);
            setModules(updatedModules);
            saveModulesToFirebase(updatedModules);
        });
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
        openConfirmModal(() => {
            const updatedModules = modules.map(mod =>
                mod.id === moduleId
                    ? { ...mod, classes: mod.classes.filter(cls => cls.id !== classId) }
                    : mod
            );
            setModules(updatedModules);
            saveModulesToFirebase(updatedModules);
        });
    };

    const handleMoveContentUp = (index: number) => {
        if (!selectedClass || index === 0) return;
        const updatedContent = [...selectedClass.content];
        [updatedContent[index - 1], updatedContent[index]] = [updatedContent[index], updatedContent[index - 1]];
        updateClassContent(updatedContent);
    };

    const handleMoveContentDown = (index: number) => {
        if (!selectedClass || index === selectedClass.content.length - 1) return;
        const updatedContent = [...selectedClass.content];
        [updatedContent[index + 1], updatedContent[index]] = [updatedContent[index], updatedContent[index + 1]];
        updateClassContent(updatedContent);
    };

    const handleDuplicateContent = (index: number) => {
        if (!selectedClass) return;
        const contentToDuplicate = { ...selectedClass.content[index] };
        const updatedContent = [...selectedClass.content, contentToDuplicate];
        updateClassContent(updatedContent);
    };

    const handleDeleteContent = (index: number) => {
        if (!selectedClass) return;
        openConfirmModal(() => {
            const updatedContent = selectedClass.content.filter((_, i) => i !== index);
            updateClassContent(updatedContent);
        });
    };

    const handleAddContent = async (type: 'video' | 'text' | 'image' | 'file') => {
        if (!selectedClass) return;

        let newContent: ContentItem = {
            type,
            value: '',
        };

        if (type === 'image' || type === 'file') {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = type === 'image' ? 'image/*' : '*';
            fileInput.onchange = async (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (!file) return;

                // Reduce image size if it's an image
                let fileToUpload = file;
                if (type === 'image') {
                    const compressedFile = await imageCompression(file, {
                        maxSizeMB: 1,
                        maxWidthOrHeight: 1920,
                        useWebWorker: true,
                    });
                    fileToUpload = compressedFile;
                }

                const storageRef = ref(storage, `uploads/${uuidv4()}-${fileToUpload.name}`);
                await uploadBytes(storageRef, fileToUpload);
                const downloadURL = await getDownloadURL(storageRef);
                newContent.value = downloadURL;

                const updatedContent = [...selectedClass.content, newContent];
                updateClassContent(updatedContent);
            };
            fileInput.click();
        } else if (type === 'text') {
            openEditModal('content', selectedModule, selectedClass, newContent);
        } else if (type === 'video') {
            openEditModal('content', selectedModule, selectedClass, newContent);
        }
    };

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
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveTitle}
                title={
                    modalType === 'module' ? editingModule?.title || '' :
                    modalType === 'class' ? editingClass?.title || '' :
                    editingContent?.value || ''
                }
                inputLabel={modalInputLabel}
                confirmMode={false}
                isTextArea={modalType === 'content' && editingContent?.type === 'text'}
            />
            <Modal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onSave={handleConfirmDelete}
                title="Confirmar eliminación"
                inputLabel="¿Estás seguro de que quieres eliminar este elemento?"
                confirmMode={true}
            />
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
                                    <FaEdit onClick={() => openEditModal('module', module)} />
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
                                                <FaEdit onClick={() => openEditModal('class', module, clase)} />
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
                        <div className={styles.contentList}>
                            {selectedClass.content.map((content, index) => (
                                <div key={index} className={styles.contentItem}>
                                    //TODO debe agregarse un botón para agregar cargas de archivos, que crearán automáticamente un proyecto en proyectos-estudiantes.
                                    {content.type === 'video' && <iframe src={content.value} title="Video" />}
                                    {content.type === 'text' && <p>{content.value}</p>}
                                    {content.type === 'image' && <img src={content.value} alt="Imagen de clase" />}
                                    {content.type === 'file' && <a href={content.value} download>Descargar Archivo</a>}
                                    <div className={styles.iconContainer}>
                                        <FaEdit onClick={() => openEditModal('content', selectedModule, selectedClass, content)} />
                                        <FaArrowUp onClick={() => handleMoveContentUp(index)} />
                                        <FaArrowDown onClick={() => handleMoveContentDown(index)} />
                                        <FaCopy onClick={() => handleDuplicateContent(index)} />
                                        <FaTrash onClick={() => handleDeleteContent(index)} />
                                    </div>
                                </div>
                            ))}

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
