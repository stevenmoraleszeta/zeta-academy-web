"use client";

import React, { useState, useEffect } from "react";
import styles from "./page.module.css";
import CrudMenu from "@/components/crud-menu/CrudMenu";
import { db, storage } from "@/firebase/firebase";
import { collection, getDocs, doc, query, where, updateDoc, deleteDoc, addDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

const StudentsProjects = () => {
    const [studentsProjects, setStudentsProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStudentsProjects = async () => {
        try {
            setLoading(true);
            const projectsSnapshot = await getDocs(collection(db, "projects"));
            const allStudentsProjects: any[] = [];

            for (const projectDoc of projectsSnapshot.docs) {
                const subCollectionRef = collection(db, `projects/${projectDoc.id}/studentsProjects`);
                const studentsSnapshot = await getDocs(subCollectionRef);
                studentsSnapshot.forEach((studentDoc) => {
                    allStudentsProjects.push({
                        id: studentDoc.id,
                        projectId: projectDoc.id,
                        ...studentDoc.data(),
                    });
                });
            }

            setStudentsProjects(allStudentsProjects);
        } catch (err) {
            setError("Error al cargar las entregas.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudentsProjects();
    }, []);

    const handleFileUpload = async (file: File) => {
        if (!file) return "";

        const uniqueName = `${uuidv4()}-${file.name}`;
        const storageRef = ref(storage, `studentsProjects/${uniqueName}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        return new Promise<string>((resolve, reject) => {
            uploadTask.on(
                "state_changed",
                null,
                (error) => {
                    console.error("Error uploading file:", error);
                    reject(error);
                },
                async () => {
                    const downloadUrl = await getDownloadURL(storageRef);
                    resolve(downloadUrl);
                }
            );
        });
    };

    const saveStudentProject = async (studentProject: any, isEditMode: boolean) => {
        const { projectId, id, ...data } = studentProject;

        try {
            if (isEditMode && id) {
                const docRef = doc(db, `projects/${projectId}/studentsProjects`, id);
                await updateDoc(docRef, data);
            } else {
                const subCollectionRef = collection(db, `projects/${projectId}/studentsProjects`);
                await addDoc(subCollectionRef, data);
            }
            fetchStudentsProjects();
        } catch (err) {
            console.error("Error al guardar la entrega:", err);
        }
    };

    const deleteStudentProject = async (studentProject: any) => {
        const { projectId, id } = studentProject;

        try {
            const docRef = doc(db, `projects/${projectId}/studentsProjects`, id);
            await deleteDoc(docRef);
            fetchStudentsProjects();
        } catch (err) {
            console.error("Error al eliminar la entrega:", err);
        }
    };

    const determineState = (project: any) => {
        const today = new Date();
        const dueDate = new Date(project.dueDate);

        if (project.fileUrl && project.score) return "Revisado"; // Revisado
        if (!project.fileUrl && dueDate > today) return "No Entregado"; // No entregado
        if (project.fileUrl && !project.score) return "Pendiente de Revisión"; // Pendiente de revisión
        if (!project.fileUrl && dueDate <= today) return "Fuera de Tiempo"; // No entregado fuera de tiempo
    };

    const getStateColor = (state: string) => {
        switch (state) {
            case "Revisado":
                return "green";
            case "No Entregado":
                return "yellow";
            case "Pendiente de Revisión":
                return "red";
            case "Fuera de Tiempo":
                return "black";
            default:
                return "gray";
        }
    };

    if (loading) return <p>Cargando entregas...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className={styles.container}>
            <CrudMenu
                collectionName="studentsProjects"
                data={studentsProjects}
                displayFields={[
                    { label: "Archivo", field: "fileUrl", type: "link" },
                    { label: "Fecha de Entrega", field: "deliveredDay", type: "date" },
                    { label: "Puntaje", field: "score", type: "number" },
                    { label: "Estado", field: "state" },
                ]}
                editFields={[
                    { label: "Archivo", field: "fileUrl", type: "file" },
                    { label: "Fecha de Entrega", field: "deliveredDay", type: "date" },
                    { label: "Puntaje", field: "score", type: "number" },
                ]}
                onSave={saveStudentProject}
                onDelete={deleteStudentProject}
                fileUploadHandler={handleFileUpload}
                determineState={determineState}
                getStateColor={getStateColor}
            />
        </div>
    );
};

export default StudentsProjects;
