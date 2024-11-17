"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import { FaEdit, FaTrashAlt, FaArrowUp, FaArrowDown, FaFilePdf, FaLink, FaChevronRight, FaCheck, FaChevronLeft, FaBook } from "react-icons/fa";
import { db } from "@/firebase/firebase";
import styles from "./page.module.css";

const ClassDetail = () => {
    const router = useRouter();
    const { courseId, moduleId, classId } = useParams();
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

    useEffect(() => {
        if (classId && courseId && moduleId) {
            const fetchClassData = async () => {
                try {
                    const classRef = doc(db, "onlineCourses", courseId, "modules", moduleId, "classes", classId);
                    const classSnapshot = await getDoc(classRef);

                    if (classSnapshot.exists()) {
                        const data = classSnapshot.data();
                        setClassTitle(data.title || "");
                        setResources(data.resources || []);
                        setIsCompleted(data.completed || false); // Fetch and set the initial completion status
                    } else {
                        console.error("Class not found");
                        router.push("/cursos-en-linea");
                    }
                } catch (error) {
                    console.error("Error fetching class data:", error);
                }
            };

            const fetchClassesInModule = async () => {
                const classesRef = collection(db, "onlineCourses", courseId, "modules", moduleId, "classes");
                const classesSnapshot = await getDocs(classesRef);
                const classes = classesSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // Sort classes by order
                classes.sort((a, b) => a.order - b.order);
                setClassesInModule(classes);
            };

            fetchClassData();
            fetchClassesInModule();
        }
    }, [classId, courseId, moduleId]);


    const handleTitleChange = async (e) => {
        const newTitle = e.target.value;
        setClassTitle(newTitle);

        try {
            const classRef = doc(db, "onlineCourses", courseId, "modules", moduleId, "classes", classId);
            await updateDoc(classRef, { title: newTitle });
            console.log("Class title updated successfully");
        } catch (error) {
            console.error("Error updating class title:", error);
        }
    };

    const openModal = (type = "", content = "", title = "", start = "", end = "", index = null) => {
        setNewResourceType(type);
        setNewResourceContent(content);
        setNewResourceTitle(title || "");
        setVideoStart(start);
        setVideoEnd(end);
        setEditingIndex(index);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingIndex(null);
        setVideoStart("");
        setVideoEnd("");
        setNewResourceTitle("");
    };

    const handleSaveResource = () => {
        const updatedResources = [...resources];
        if (editingIndex !== null) {
            updatedResources[editingIndex] = {
                ...updatedResources[editingIndex],
                type: newResourceType,
                content: newResourceContent,
                title: newResourceTitle,
                start: videoStart,
                end: videoEnd,
            };
        } else {
            updatedResources.push({
                type: newResourceType,
                content: newResourceContent,
                title: newResourceTitle,
                start: videoStart,
                end: videoEnd,
                order: resources.length,
            });
        }

        updatedResources.forEach((resource, index) => (resource.order = index));
        setResources(updatedResources);
        saveResourcesToFirestore(updatedResources);
        closeModal();
    };

    const handleRemoveResource = (index) => {
        const updatedResources = [...resources];
        updatedResources.splice(index, 1);
        updatedResources.forEach((resource, idx) => (resource.order = idx));
        setResources(updatedResources);
        saveResourcesToFirestore(updatedResources);
    };

    const handleMoveResource = (index, direction) => {
        const updatedResources = [...resources];
        const targetIndex = direction === "up" ? index - 1 : index + 1;

        if (targetIndex >= 0 && targetIndex < updatedResources.length) {
            [updatedResources[index], updatedResources[targetIndex]] = [updatedResources[targetIndex], updatedResources[index]];
            updatedResources[index].order = index;
            updatedResources[targetIndex].order = targetIndex;
            setResources(updatedResources);
            saveResourcesToFirestore(updatedResources);
        }
    };

    const saveResourcesToFirestore = async (resourcesToSave) => {
        try {
            const classRef = doc(db, "onlineCourses", courseId, "modules", moduleId, "classes", classId);
            await updateDoc(classRef, { resources: resourcesToSave });
            console.log("Resources updated successfully");
        } catch (error) {
            console.error("Error updating resources:", error);
        }
    };

    const generateYouTubeEmbedUrl = (url, start, end) => {
        const videoIdMatch = url.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)|youtu\.be\/([^&]+)/);
        const videoId = videoIdMatch ? videoIdMatch[1] || videoIdMatch[2] : null;

        if (!videoId) return url;

        const embedUrl = new URL(`https://www.youtube.com/embed/${videoId}`);
        if (start) embedUrl.searchParams.set("start", start);
        if (end) embedUrl.searchParams.set("end", end);

        return embedUrl.toString();
    };

    const handleBackToSyllabus = () => {
        router.push(`/cursos-en-linea/${courseId}`);
    };

    const handlePreviousClass = () => {
        const currentClassIndex = classesInModule.findIndex(cls => cls.id === classId);
        if (currentClassIndex > 0) {
            const previousClassId = classesInModule[currentClassIndex - 1].id;
            router.push(`/cursos-en-linea/${courseId}/${moduleId}/${previousClassId}`);
        } else {
            console.log("No previous class available.");
        }
    };

    const handleNextClass = () => {
        const currentClassIndex = classesInModule.findIndex(cls => cls.id === classId);
        if (currentClassIndex < classesInModule.length - 1) {
            const nextClassId = classesInModule[currentClassIndex + 1].id;
            router.push(`/cursos-en-linea/${courseId}/${moduleId}/${nextClassId}`);
        } else {
            console.log("No next class available.");
        }
    };

    const handleCompleteClass = async () => {
        try {
            const newCompletedStatus = !isCompleted; // Toggle the completed status
            const classRef = doc(db, "onlineCourses", courseId, "modules", moduleId, "classes", classId);
            await updateDoc(classRef, { completed: newCompletedStatus }); // Update Firestore
            setIsCompleted(newCompletedStatus); // Update local state
        } catch (error) {
            console.error("Error updating class completion status:", error);
        }
    };


    if (!Array.isArray(resources)) return <div>Loading...</div>;

    return (
        <div className={styles.classDetailContainer}>
            <div className={styles.titleContainer}>
                <input
                    type="text"
                    value={classTitle}
                    onChange={handleTitleChange}
                    className={styles.titleInput}
                    placeholder="Class Title"
                />
            </div>

            <div className={styles.resourcesContainer}>
                {resources.sort((a, b) => a.order - b.order).map((resource, index) => (
                    <div key={`${resource.type}-${index}`} className={styles.block}>
                        <div className={styles.resourceActions}>
                            <FaEdit
                                onClick={() =>
                                    openModal(resource.type, resource.content, resource.title || "", resource.start || "", resource.end || "", index)
                                }
                                className={styles.icon}
                            />
                            <FaTrashAlt onClick={() => handleRemoveResource(index)} className={styles.icon} />
                            <FaArrowUp onClick={() => handleMoveResource(index, "up")} className={styles.icon} />
                            <FaArrowDown onClick={() => handleMoveResource(index, "down")} className={styles.icon} />
                        </div>
                        {resource.type === "videoUrl" && (
                            <div className={styles.videoWrapper}>
                                <iframe
                                    src={generateYouTubeEmbedUrl(resource.content, resource.start, resource.end)}
                                    title={`Video ${index + 1}`}
                                    className={styles.videoFrame}
                                />
                                <p>
                                    Start: {resource.start || "0"} seconds | End: {resource.end || "Full Video"} seconds
                                </p>
                            </div>
                        )}
                        {resource.type === "imageUrl" && (
                            <>
                                <img src={resource.content} alt={resource.title || "Image"} className={styles.imagePreview} />
                            </>
                        )}
                        {resource.type === "link" && (
                            <a
                                href={resource.content}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`${styles.resourceButton}`}
                            >
                                <FaLink className={styles.resourceButtonIcon} />
                                {resource.title || "Unnamed Link"}
                            </a>
                        )}
                        {resource.type === "pdfUrl" && (
                            <a
                                href={resource.content}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`${styles.resourceButton}`}
                            >
                                <FaFilePdf className={styles.resourceButtonIcon} />
                                {resource.title || "Unnamed PDF"}
                            </a>
                        )}
                        {resource.type === "title" && (
                            <p className={styles.titleResource}>{resource.content}</p>
                        )}
                        {resource.type === "text" && (
                            <p className={styles.textResource}>{resource.content}</p>
                        )}

                    </div>
                ))}
            </div>

            <button onClick={() => openModal()} className={styles.addButton}>
                Add Resource
            </button>

            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h3>{editingIndex !== null ? "Modify Resource" : "Add New Resource"}</h3>
                        <label>
                            Select Resource Type:
                            <select value={newResourceType} onChange={(e) => setNewResourceType(e.target.value)} className={styles.modalSelect}>
                                <option value="">Select Type</option>
                                <option value="title">Title</option>
                                <option value="text">Text</option>
                                <option value="videoUrl">Video URL</option>
                                <option value="imageUrl">Image URL</option>
                                <option value="link">Link</option>
                                <option value="pdfUrl">PDF URL</option>
                            </select>
                        </label>
                        <label>
                            Enter Content:
                            <textarea
                                type="text"
                                value={newResourceContent}
                                onChange={(e) => setNewResourceContent(e.target.value)}
                                className={styles.modalInput}
                                placeholder="Enter content"
                            />
                        </label>
                        {(newResourceType === "link" || newResourceType === "pdfUrl") && (
                            <label>
                                Enter Title:
                                <input
                                    type="text"
                                    value={newResourceTitle}
                                    onChange={(e) => setNewResourceTitle(e.target.value)}
                                    className={styles.modalInput}
                                    placeholder="Enter title for the resource"
                                />
                            </label>
                        )}
                        {newResourceType === "videoUrl" && (
                            <>
                                <label>
                                    Start Time (seconds):
                                    <input
                                        type="number"
                                        value={videoStart}
                                        onChange={(e) => setVideoStart(e.target.value)}
                                        className={styles.modalInput}
                                    />
                                </label>
                                <label>
                                    End Time (seconds):
                                    <input
                                        type="number"
                                        value={videoEnd}
                                        onChange={(e) => setVideoEnd(e.target.value)}
                                        className={styles.modalInput}
                                    />
                                </label>
                            </>
                        )}
                        <div className={styles.modalActions}>
                            <button onClick={handleSaveResource}>{editingIndex !== null ? "Save Changes" : "Add"}</button>
                            <button onClick={closeModal}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
            <div className={styles.fixedBar}>
                <button className={styles.syllabusButton} onClick={handleBackToSyllabus}>
                    <FaBook /> Volver al temario
                </button>
                <button className={styles.backButton} onClick={handlePreviousClass}>
                    <FaChevronLeft /> Clase anterior
                </button>
                <button
                    className={`${styles.completeButton} ${isCompleted ? styles.completedButton : ''}`}
                    onClick={handleCompleteClass}
                >
                    <FaCheck /> {isCompleted ? "Clase completada" : "Completar clase"}
                </button>
                <button className={styles.nextButton} onClick={handleNextClass}>
                    Clase siguiente <FaChevronRight />
                </button>
            </div>
        </div>
    );
};

export default ClassDetail;
