"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import styles from "./page.module.css";

const ClassDetail = () => {
    const router = useRouter();
    const { courseId, moduleId, classId } = useParams();
    const [classData, setClassData] = useState({
        titles: [],
        texts: [],
        videoUrls: [],
        imageUrls: [],
        links: [],
        pdfUrls: []
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newElementType, setNewElementType] = useState("");
    const [newElementContent, setNewElementContent] = useState("");

    useEffect(() => {
        if (classId && courseId && moduleId) {
            const fetchClassData = async () => {
                try {
                    const classRef = doc(db, "onlineCourses", courseId, "modules", moduleId, "classes", classId);
                    const classSnapshot = await getDoc(classRef);

                    if (classSnapshot.exists()) {
                        setClassData((prevData) => ({
                            ...prevData,
                            ...classSnapshot.data()
                        }));
                    } else {
                        console.error("Class not found");
                        router.push("/cursos-en-linea");
                    }
                } catch (error) {
                    console.error("Error fetching class data:", error);
                }
            };
            fetchClassData();
        }
    }, [classId, courseId, moduleId]);

    const openModal = () => {
        setNewElementType("");
        setNewElementContent("");
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleAddElement = async () => {
        if (newElementType && newElementContent) {
            setClassData((prevData) => {
                const updatedData = {
                    ...prevData,
                    [newElementType]: [...(prevData[newElementType] || []), newElementContent]
                };
                handleSave(updatedData);
                return updatedData;
            });
            closeModal();
        }
    };

    const handleBlockChange = async (field, index, value) => {
        setClassData((prevData) => {
            const updatedField = [...(prevData[field] || [])];
            updatedField[index] = value;
            const updatedData = { ...prevData, [field]: updatedField };
            handleSave(updatedData);
            return updatedData;
        });
    };

    const handleRemoveBlock = async (field, index) => {
        setClassData((prevData) => {
            const updatedField = [...(prevData[field] || [])];
            updatedField.splice(index, 1);
            const updatedData = { ...prevData, [field]: updatedField };
            handleSave(updatedData);
            return updatedData;
        });
    };

    const handleSave = async (dataToSave) => {
        try {
            const classRef = doc(db, "onlineCourses", courseId, "modules", moduleId, "classes", classId);
            await updateDoc(classRef, dataToSave);
            console.log("Class data updated successfully");
        } catch (error) {
            console.error("Error updating class data:", error);
        }
    };

    if (!classData) return <div>Loading...</div>;

    return (
        <div className={styles.classDetailContainer}>
            <h1>Class Detail Editor</h1>

            <div className={styles.elementsContainer}>
                {/* Render Titles */}
                {classData.titles.map((title, index) => (
                    <div key={`title-${index}`} className={styles.block}>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => handleBlockChange("titles", index, e.target.value)}
                            className={styles.input}
                            placeholder="Enter title"
                        />
                        <button onClick={() => handleRemoveBlock("titles", index)}>Remove</button>
                    </div>
                ))}

                {/* Render Texts */}
                {classData.texts.map((text, index) => (
                    <div key={`text-${index}`} className={styles.block}>
                        <textarea
                            value={text}
                            onChange={(e) => handleBlockChange("texts", index, e.target.value)}
                            className={styles.textArea}
                            placeholder="Enter text"
                        />
                        <button onClick={() => handleRemoveBlock("texts", index)}>Remove</button>
                    </div>
                ))}

                {/* Render Video URLs */}
                {classData.videoUrls.map((url, index) => (
                    <div key={`video-${index}`} className={styles.block}>
                        <iframe
                            src={url}
                            title={`Video ${index + 1}`}
                            className={styles.videoFrame}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => handleBlockChange("videoUrls", index, e.target.value)}
                            className={styles.input}
                            placeholder="Video URL"
                        />
                        <button onClick={() => handleRemoveBlock("videoUrls", index)}>Remove</button>
                    </div>
                ))}

                {/* Render Image URLs */}
                {classData.imageUrls.map((url, index) => (
                    <div key={`image-${index}`} className={styles.block}>
                        <img src={url} alt={`Image ${index + 1}`} className={styles.imagePreview} />
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => handleBlockChange("imageUrls", index, e.target.value)}
                            className={styles.input}
                            placeholder="Image URL"
                        />
                        <button onClick={() => handleRemoveBlock("imageUrls", index)}>Remove</button>
                    </div>
                ))}

                {/* Render Links */}
                {classData.links.map((link, index) => (
                    <div key={`link-${index}`} className={styles.block}>
                        <a href={link} target="_blank" rel="noopener noreferrer" className={styles.link}>
                            {link}
                        </a>
                        <input
                            type="text"
                            value={link}
                            onChange={(e) => handleBlockChange("links", index, e.target.value)}
                            className={styles.input}
                            placeholder="Link URL"
                        />
                        <button onClick={() => handleRemoveBlock("links", index)}>Remove</button>
                    </div>
                ))}

                {/* Render PDF URLs */}
                {classData.pdfUrls.map((pdfUrl, index) => (
                    <div key={`pdf-${index}`} className={styles.block}>
                        <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className={styles.link}>
                            PDF Document {index + 1}
                        </a>
                        <input
                            type="text"
                            value={pdfUrl}
                            onChange={(e) => handleBlockChange("pdfUrls", index, e.target.value)}
                            className={styles.input}
                            placeholder="PDF URL"
                        />
                        <button onClick={() => handleRemoveBlock("pdfUrls", index)}>Remove</button>
                    </div>
                ))}
            </div>

            <button onClick={openModal} className={styles.addButton}>Add Element</button>

            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h3>Add New Element</h3>
                        <label>
                            Select Element Type:
                            <select value={newElementType} onChange={(e) => setNewElementType(e.target.value)} className={styles.modalSelect}>
                                <option value="">Select Type</option>
                                <option value="titles">Title</option>
                                <option value="texts">Text</option>
                                <option value="videoUrls">Video URL</option>
                                <option value="imageUrls">Image URL</option>
                                <option value="links">Link</option>
                                <option value="pdfUrls">PDF URL</option>
                            </select>
                        </label>
                        <label>
                            Enter Content:
                            <input
                                type="text"
                                value={newElementContent}
                                onChange={(e) => setNewElementContent(e.target.value)}
                                className={styles.modalInput}
                                placeholder="Enter content"
                            />
                        </label>
                        <div className={styles.modalActions}>
                            <button onClick={handleAddElement}>Add</button>
                            <button onClick={closeModal}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClassDetail;
