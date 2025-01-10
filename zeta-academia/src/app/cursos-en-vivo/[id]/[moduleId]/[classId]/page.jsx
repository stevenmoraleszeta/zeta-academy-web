"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    doc,
    getDoc,
    updateDoc,
    collection,
    getDocs,
} from "firebase/firestore";
import {
    FaEdit,
    FaTrashAlt,
    FaArrowUp,
    FaArrowDown,
    FaFilePdf,
    FaLink,
    FaChevronRight,
    FaCheck,
    FaChevronLeft,
    FaBook,
    FaWhatsapp,
} from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase/firebase";
import styles from "./page.module.css";
import { AlertButton, AlertComponent } from "@/components/alert/alert";
import CodeBlock from "@/components/codeBlock/CodeBlock";

const ClassDetail = ({ params }) => {
    const router = useRouter();
    const courseId = params.id;
    const moduleId = params.moduleId;
    const classId = params.classId;
    const { currentUser, isAdmin } = useAuth();
    const [classTitle, setClassTitle] = useState("");
    const [resources, setResources] = useState([]);
    const [classesInModule, setClassesInModule] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newResourceType, setNewResourceType] = useState("");
    const [newResourceContent, setNewResourceContent] = useState("");
    const [newResourceTitle, setNewResourceTitle] = useState("");
    const [videoStart, setVideoStart] = useState("");
    const [videoEnd, setVideoEnd] = useState("");
    const [editingIndex, setEditingIndex] = useState(null);
    const [isCompleted, setIsCompleted] = useState(false);
    const [isPreviousClassCompleted, setIsPreviousClassCompleted] = useState(true);
    const [courseName, setCourseName] = useState("");
    const [completedClasses, setCompletedClasses] = useState([]);
    const [isRestricted, setIsRestricted] = useState(false);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [newResourceWidth, setNewResourceWidth] = useState("");
    const [newResourceHeight, setNewResourceHeight] = useState("");
    const [originalImageWidth, setOriginalImageWidth] = useState(0);
    const [originalImageHeight, setOriginalImageHeight] = useState(0);

    useEffect(() => {
        const fetchClassData = async () => {
            try {
                const classRef = doc(
                    db,
                    "liveCourses",
                    courseId,
                    "modules",
                    moduleId,
                    "classes",
                    classId
                );
                const classSnapshot = await getDoc(classRef);

                if (classSnapshot.exists()) {
                    const data = classSnapshot.data();
                    setClassTitle(data.title || "");
                    setResources(data.resources || []);
                    setIsRestricted(data.restricted || false);
                    document.title = `${data.title} - ZETA`;
                } else {
                    console.error("Class not found");
                    router.push("/cursos-en-vivo");
                }
            } catch (error) {
                console.error("Error fetching class data:", error);
            }
        };

        const checkEnrollment = async () => {
            if (!currentUser) return;

            try {
                const userRef = doc(db, "users", currentUser.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    setIsEnrolled(userData.enrolledCourses?.includes(courseId) || false);
                }
            } catch (error) {
                console.error("Error checking enrollment:", error);
            }
        };

        const fetchCompletedStatus = async () => {
            if (!currentUser) return;

            try {
                const userRef = doc(db, "users", currentUser.uid);
                const userSnapshot = await getDoc(userRef);

                if (userSnapshot.exists()) {
                    const userData = userSnapshot.data();
                    const completedClasses = userData.completedClasses || [];
                    setCompletedClasses(completedClasses);
                    setIsCompleted(completedClasses.includes(classId));
                }
            } catch (error) {
                console.error("Error fetching completed status:", error);
            }
        };

        const fetchClassesInModule = async () => {
            try {
                const classesRef = collection(
                    db,
                    "liveCourses",
                    courseId,
                    "modules",
                    moduleId,
                    "classes"
                );
                const classesSnapshot = await getDocs(classesRef);
                const classes = classesSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                classes.sort((a, b) => a.order - b.order);
                setClassesInModule(classes);
            } catch (error) {
                console.error("Error fetching classes in module:", error);
            }
        };

        const fetchCourseName = async () => {
            try {
                const courseRef = doc(db, "liveCourses", courseId);
                const courseSnapshot = await getDoc(courseRef);
                if (courseSnapshot.exists()) {
                    setCourseName(courseSnapshot.data()?.title || "");
                }
            } catch (error) {
                console.error("Error fetching course name:", error);
            }
        };

        if (classId && courseId && moduleId) {
            fetchClassData();
            fetchClassesInModule();
            fetchCourseName();
            if (currentUser) {
                fetchCompletedStatus();
                checkEnrollment();
            }
        }
    }, [classId, courseId, moduleId, currentUser]);

    const handleSaveResource = async () => {
        try {
            if (!courseId || !moduleId || !classId) {
                console.error("Missing required parameters");
                return;
            }

            const updatedResources = [...resources];
            if (editingIndex !== null) {
                updatedResources[editingIndex] = {
                    type: newResourceType,
                    content: newResourceContent,
                    title: newResourceTitle,
                    start: videoStart,
                    end: videoEnd,
                    width: parseInt(newResourceWidth, 10),
                    height: parseInt(newResourceHeight, 10),
                };
            } else {
                updatedResources.push({
                    type: newResourceType,
                    content: newResourceContent,
                    title: newResourceTitle,
                    start: videoStart,
                    end: videoEnd,
                    order: resources.length,
                    width: parseInt(newResourceWidth, 10),
                    height: parseInt(newResourceHeight, 10),
                });
            }

            const classRef = doc(
                db,
                "liveCourses",
                courseId,
                "modules",
                moduleId,
                "classes",
                classId
            );

            await updateDoc(classRef, { resources: updatedResources });
            setResources(updatedResources);
            closeModal();
        } catch (error) {
            console.error("Error saving resource:", error);
        }
    };

    const handleBackToSyllabus = () => {
        router.push(`/cursos-en-vivo/${courseId}`);
    };

    const handlePreviousClass = () => {
        const currentClassIndex = classesInModule.findIndex(
            (cls) => cls.id === classId
        );
        if (currentClassIndex > 0) {
            const previousClassId = classesInModule[currentClassIndex - 1].id;
            router.push(
                `/cursos-en-vivo/${courseId}/${moduleId}/${previousClassId}`
            );
        }
    };

    const handleNextClass = () => {
        const currentClassIndex = classesInModule.findIndex(
            (cls) => cls.id === classId
        );
        if (currentClassIndex < classesInModule.length - 1) {
            const nextClassId = classesInModule[currentClassIndex + 1].id;
            router.push(`/cursos-en-vivo/${courseId}/${moduleId}/${nextClassId}`);
        }
    };

    const handleCompleteClass = async () => {
        try {
            if (!currentUser || !currentUser.uid) {
                console.error("Usuario no autenticado.");
                return;
            }

            const userRef = doc(db, "users", currentUser.uid);
            const userSnapshot = await getDoc(userRef);

            if (!userSnapshot.exists()) {
                console.error("Documento de usuario no encontrado.");
                return;
            }

            const userData = userSnapshot.data();
            const completedClasses = userData.completedClasses || [];

            const currentClassIndex = classesInModule.findIndex(cls => cls.id === classId);
            if (currentClassIndex > 0 && !isCompleted) {
                const previousClassId = classesInModule[currentClassIndex - 1].id;
                if (!completedClasses.includes(previousClassId)) {
                    setIsAlertOpen(true);
                    console.error("La clase anterior no está completada. No puedes completar esta clase.");
                    return;
                }
            }

            const newCompletedStatus = !isCompleted;

            const updatedClasses = newCompletedStatus
                ? [...completedClasses, classId]
                : completedClasses.filter(id => id !== classId);

            await updateDoc(userRef, { completedClasses: updatedClasses });

            setIsCompleted(newCompletedStatus);
            setCompletedClasses(updatedClasses);
        } catch (error) {
            console.error("Error actualizando el estado de la clase:", error);
        }
    };

    const handleSendProjectClick = () => {
        const message = encodeURIComponent(
            `Hola, te adjunto el proyecto de la clase ${classTitle} del curso ${courseName}.`
        );
        const phone = "+50661304830";
        const whatsappUrl = `https://wa.me/${phone}?text=${message}`;
        window.open(whatsappUrl, "_blank");
    };

    const handleTitleChange = async (e) => {
        const newTitle = e.target.value;
        setClassTitle(newTitle);

        try {
            const classRef = doc(
                db,
                "liveCourses",
                courseId,
                "modules",
                moduleId,
                "classes",
                classId
            );
            await updateDoc(classRef, { title: newTitle });
            console.log("Class title updated successfully");
        } catch (error) {
            console.error("Error updating class title:", error);
        }
    };

    const handleConsultMentor = () => {
        const message = encodeURIComponent(
            `Hola, tengo una pregunta sobre la clase "${classTitle}" del curso "${courseName}".`
        );
        const phone = "+50661304830";
        const whatsappUrl = `https://wa.me/${phone}?text=${message}`;
        window.open(whatsappUrl, "_blank");
    };

    const handleRemoveResource = (index) => {
        const resource = resources[index];
        const confirmDelete = window.confirm(
            `¿Estás seguro de que deseas eliminar el recurso "${resource.title || resource.content || "Sin título"}"?`
        );

        if (confirmDelete) {
            const updatedResources = [...resources];
            updatedResources.splice(index, 1);
            updatedResources.forEach((resource, idx) => (resource.order = idx));
            setResources(updatedResources);
            saveResourcesToFirestore(updatedResources);
        }
    };

    const handleMoveResource = (index, direction) => {
        const updatedResources = [...resources];
        const targetIndex = direction === "up" ? index - 1 : index + 1;

        if (targetIndex >= 0 && targetIndex < updatedResources.length) {
            [updatedResources[index], updatedResources[targetIndex]] = [
                updatedResources[targetIndex],
                updatedResources[index],
            ];
            updatedResources[index].order = index;
            updatedResources[targetIndex].order = targetIndex;
            setResources(updatedResources);
            saveResourcesToFirestore(updatedResources);
        }
    };

    const saveResourcesToFirestore = async (resourcesToSave) => {
        try {
            const classRef = doc(
                db,
                "liveCourses",
                courseId,
                "modules",
                moduleId,
                "classes",
                classId
            );
            await updateDoc(classRef, { resources: resourcesToSave });
            console.log("Resources updated successfully");
        } catch (error) {
            console.error("Error updating resources:", error);
        }
    };

    const generateYouTubeEmbedUrl = (url, start, end) => {
        const videoIdMatch = url.match(
            /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/
        );
        const videoId = videoIdMatch ? videoIdMatch[1] : null;

        if (!videoId) return url;

        const embedUrl = new URL(`https://www.youtube.com/embed/${videoId}`);
        if (start) embedUrl.searchParams.set("start", start);
        if (end) embedUrl.searchParams.set("end", end);

        return embedUrl.toString();
    };

    const restartVideo = (index) => {
        const iframe = document.getElementById(`video-${index}`);
        if (iframe && resources[index]) {
            const resource = resources[index];
            const videoIdMatch = resource.content.match(
                /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/
            );
            const videoId = videoIdMatch ? videoIdMatch[1] : null;

            if (!videoId) {
                console.error("El ID del video no se pudo extraer correctamente.");
                return;
            }

            const embedUrl = new URL(`https://www.youtube.com/embed/${videoId}`);
            embedUrl.searchParams.set("start", resource.start || "0");
            if (resource.end) {
                embedUrl.searchParams.set("end", resource.end);
            }

            iframe.src = embedUrl.toString();
        } else {
            console.error("El iframe o recurso no existe.");
        }
    };

    const applyStyleToText = (style) => {
        if (newResourceType !== "text") return;

        const textarea = document.querySelector(`.${styles.modalInput}`);
        const selectionStart = textarea.selectionStart;
        const selectionEnd = textarea.selectionEnd;

        let updatedContent = newResourceContent;

        // Extrae las partes del texto seleccionadas y no seleccionadas
        const before = updatedContent.substring(0, selectionStart);
        const selected = updatedContent.substring(selectionStart, selectionEnd);
        const after = updatedContent.substring(selectionEnd);

        switch (style) {
            case "bold":
                updatedContent = `${before}*${selected}*${after}`;
                break;
            case "bullet":
                // Agrega `-` a cada línea seleccionada
                updatedContent = `${before}${selected
                    .split("\n")
                    .map((line) => (line.startsWith("- ") ? line : `- ${line}`))
                    .join("\n")}${after}`;
                break;
            case "delimitedList":
                // Envuelve el bloque seleccionado con `+`
                updatedContent = `${before}+\n${selected
                    .split("\n")
                    .map((line) => (line.startsWith("- ") ? line : `- ${line}`))
                    .join("\n")}\n+${after}`;
                break;
            default:
                break;
        }

        setNewResourceContent(updatedContent);

        // Vuelve a enfocar el área de texto y coloca el cursor después de la selección
        textarea.focus();
        textarea.setSelectionRange(selectionStart, selectionStart + selected.length);
    };

    const openModal = (
        type = "",
        content = "",
        title = "",
        start = "",
        end = "",
        index = null,
        width = "",
        height = ""
    ) => {
        setNewResourceType(type);
        setNewResourceContent(content);
        setNewResourceTitle(title || "");
        setVideoStart(start);
        setVideoEnd(end);
        setEditingIndex(index);
        setNewResourceWidth(width);
        setNewResourceHeight(height);

        if (type === "imageUrl" && content) {
            const img = new Image();
            img.src = content;
            img.onload = () => {
                setOriginalImageWidth(img.width);
                setOriginalImageHeight(img.height);
            };
        }

        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingIndex(null);
        setVideoStart("");
        setVideoEnd("");
        setNewResourceTitle("");
        setNewResourceContent("");
        setNewResourceType("");
        setNewResourceWidth("");
        setNewResourceHeight("");
    };

    return (
        <div className={styles.classDetailContainer}>
            {isAdmin ? (
                <input
                    type="text"
                    value={classTitle}
                    onChange={(e) => setClassTitle(e.target.value)}
                    className={styles.titleInput}
                />
            ) : (
                <h1 className={styles.title}>{classTitle}</h1>
            )}

            <div className={styles.resourcesContainer}>
                {resources
                    .sort((a, b) => a.order - b.order)
                    .map((resource, index) => (
                        <div key={`${resource.type}-${index}`} className={styles.block}>
                            {isAdmin && (
                                <div className={styles.resourceActions}>
                                    <FaEdit
                                        onClick={() =>
                                            openModal(
                                                resource.type,
                                                resource.content,
                                                resource.title || "",
                                                resource.start || "",
                                                resource.end || "",
                                                index,
                                                resource.width || "",
                                                resource.height || ""
                                            )
                                        }
                                        className={styles.icon}
                                    />
                                    <FaTrashAlt
                                        onClick={() => handleRemoveResource(index)}
                                        className={styles.icon}
                                    />
                                    <FaArrowUp
                                        onClick={() => handleMoveResource(index, "up")}
                                        className={styles.icon}
                                    />
                                    <FaArrowDown
                                        onClick={() => handleMoveResource(index, "down")}
                                        className={styles.icon}
                                    />
                                </div>
                            )}

                            {resource.type === "title" && (
                                <h2 className={styles.titleResource}>
                                    {resource.content || "Sin título"}
                                </h2>
                            )}

                            {resource.type === "videoUrl" && (
                                <div className={styles.videoWrapper}>
                                    <iframe
                                        src={generateYouTubeEmbedUrl(
                                            resource.content,
                                            resource.start,
                                            resource.end
                                        )}
                                        title={`Video ${index + 1}`}
                                        className={styles.videoFrame}
                                        id={`video-${index}`}
                                        allow="autoplay; encrypted-media; fullscreen"
                                    ></iframe>
                                    <button
                                        onClick={() => restartVideo(index)}
                                        className={styles.restartButton}
                                    >
                                        Reiniciar video
                                    </button>
                                </div>
                            )}

                            {resource.type === "imageUrl" && (
                                <img
                                    src={resource.content}
                                    alt={resource.title || "Imagen"}
                                    className={styles.imagePreview}
                                    style={{ width: resource.width || 'auto', height: resource.height || 'auto' }}
                                />
                            )}

                            {resource.type === "link" && (
                                <a
                                    href={resource.content}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.resourceButton}
                                >
                                    <FaLink className={styles.resourceButtonIcon} />
                                    {resource.title || "Enlace sin nombre"}
                                </a>
                            )}

                            {resource.type === "pdfUrl" && (
                                <a
                                    href={resource.content}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.resourceButton}
                                >
                                    <FaFilePdf className={styles.resourceButtonIcon} />
                                    {resource.title || "PDF sin nombre"}
                                </a>
                            )}

                            {resource.type === "text" && (
                                <div
                                    className={styles.textResource}
                                    dangerouslySetInnerHTML={{
                                        __html: resource.content
                                            .replace(/^\s+/gm, (match) => "&nbsp;".repeat(match.length)) // Convierte espacios iniciales en &nbsp;
                                            .replace(/\+([\s\S]*?)\+/g, (match, p1) => {
                                                // Convierte bloques entre + en una lista
                                                const items = p1
                                                    .split("\n")
                                                    .filter((line) => line.trim().startsWith("-")) // Solo líneas que inician con -
                                                    .map((line) => `<li>${line.trim().substring(1).trim()}</li>`) // Convierte en <li>
                                                    .join("");
                                                return `<ul>${items}</ul>`;
                                            })
                                            .replace(/\n/g, "<br>") // Convierte otros saltos de línea en <br>
                                            .replace(/\*(.*?)\*/g, "<b>$1</b>"), // Convierte *texto* en <b>texto</b>
                                    }}
                                />
                            )}

                            {resource.type === "code" && (
                                <CodeBlock code={resource.content} />
                            )}
                        </div>
                    ))}
            </div>

            {isAdmin && (
                <button onClick={() => openModal()} className={styles.addButton}>
                    Añadir Recurso
                </button>
            )}

            <div className={styles.fixedBar}>
                <button
                    className={styles.syllabusButton}
                    onClick={handleBackToSyllabus}
                >
                    <FaBook className={styles.btnIcon} /> Volver al temario
                </button>

                {classesInModule.findIndex((cls) => cls.id === classId) > 0 && (
                    <button className={styles.backButton} onClick={handlePreviousClass}>
                        <FaChevronLeft className={styles.btnIcon} /> Clase anterior
                    </button>
                )}

                <button
                    className={`${styles.completeButton} ${isCompleted ? styles.completedButton : ""}`}
                    onClick={handleCompleteClass}
                    disabled={!isPreviousClassCompleted && !isCompleted}
                >
                    <FaCheck className={styles.btnIcon} />
                    {isCompleted ? "Clase completada" : "Completar clase"}
                </button>

                {classesInModule.findIndex((cls) => cls.id === classId) <
                    classesInModule.length - 1 && (
                        <button className={styles.nextButton} onClick={handleNextClass}>
                            Clase siguiente <FaChevronRight className={styles.btnIcon} />
                        </button>
                    )}
            </div>

            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h3>
                            {editingIndex !== null ? "Modificar Recurso" : "Añadir Nuevo Recurso"}
                        </h3>
                        <div>
                            Seleccionar Tipo de Recurso:
                            <select
                                value={newResourceType}
                                onChange={(e) => setNewResourceType(e.target.value)}
                                className={styles.modalSelect}
                            >
                                <option value="">Seleccionar Tipo</option>
                                <option value="title">Título</option>
                                <option value="text">Texto</option>
                                <option value="code">Código</option>
                                <option value="videoUrl">URL de Video</option>
                                <option value="imageUrl">URL de Imagen</option>
                                <option value="link">Enlace</option>
                                <option value="pdfUrl">URL de PDF</option>
                                <option value="sendProject">Enviar Proyecto</option>
                            </select>
                        </div>

                        {(newResourceType === "link" || newResourceType === "pdfUrl") && (
                            <div>
                                Título:
                                <input
                                    type="text"
                                    value={newResourceTitle}
                                    onChange={(e) => setNewResourceTitle(e.target.value)}
                                    className={styles.modalInput}
                                    placeholder="Ingrese el título"
                                />
                            </div>
                        )}

                        <div>
                            Contenido:
                            {newResourceType === "text" && (
                                <div className={styles.textEditorButtons}>
                                    <button onClick={() => applyStyleToText("bold")} className={styles.styleButton}>Negrita</button>
                                    <button onClick={() => applyStyleToText("bullet")} className={styles.styleButton}>Lista</button>
                                    <button onClick={() => applyStyleToText("delimitedList")} className={styles.styleButton}>Lista Delimitada</button>
                                </div>
                            )}
                            <textarea
                                value={newResourceContent}
                                onChange={(e) => setNewResourceContent(e.target.value)}
                                className={styles.modalInput}
                                placeholder="Ingrese el contenido"
                            />
                        </div>

                        {newResourceType === "videoUrl" && (
                            <>
                                <label>
                                    Tiempo de inicio (segundos):
                                    <input
                                        type="number"
                                        value={videoStart}
                                        onChange={(e) => setVideoStart(e.target.value)}
                                        className={styles.modalInput}
                                    />
                                </label>
                                <label>
                                    Tiempo de fin (segundos):
                                    <input
                                        type="number"
                                        value={videoEnd}
                                        onChange={(e) => setVideoEnd(e.target.value)}
                                        className={styles.modalInput}
                                    />
                                </label>
                            </>
                        )}

                        {newResourceType === "imageUrl" && (
                            <label>
                                Ancho de la imagen (px):
                                <input
                                    type="number"
                                    value={newResourceWidth}
                                    onChange={(e) => setNewResourceWidth(e.target.value)}
                                    className={styles.modalInput}
                                    placeholder="Ancho de la imagen"
                                />
                            </label>
                        )}

                        <div className={styles.modalActions}>
                            {newResourceType !== "" && (
                                <button onClick={handleSaveResource}>
                                    {editingIndex !== null ? "Guardar Cambios" : "Añadir"}
                                </button>
                            )}
                            <button onClick={closeModal}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            {isAlertOpen && (
                <AlertComponent
                    title="No se puede completar la clase"
                    description="Parece ser que la clase anterior no se ha completado aún"
                >
                    <AlertButton text="Cerrar" funct={() => setIsAlertOpen(false)} />
                </AlertComponent>
            )}

            <button
                className={styles.syllabusButton}
                onClick={handleConsultMentor}
            >
                <FaWhatsapp className={styles.btnIcon} /> Consultar mentor
            </button>
        </div>
    );
};

export default ClassDetail;
