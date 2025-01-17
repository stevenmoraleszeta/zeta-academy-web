"use client";


import React, { useEffect, useState } from "react";
import CrudMenu from "@/components/crud-menu/CrudMenu";
import { getDocs, collection, doc, updateDoc, deleteDoc, addDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

interface StudentProject {
    id?: string;
    userId: string;
    projectId: string;
    fileUrl?: string;
    deliveredDay?: string | null;
    score?: number | null;
    dueDate?: string | null;
    state?: string;
    title?: string; // Agregado para manejar el título del proyecto
    courseId?: string; // Agregado para manejar el ID del curso
    order?: number; // Agregado para manejar el orden
    studentFileUrl?: string;
}

const StudentsProjects: React.FC = () => {
    const [projects, setProjects] = useState<StudentProject[]>([]);
    const collectionName = "projects";

    useEffect(() => {
        const fetchStudentProjects = async () => {
            try {
                const projectsRef = collection(db, collectionName);
                const projectsSnapshot = await getDocs(projectsRef);
                const studentProjectsList: StudentProject[] = [];

                for (const projectDoc of projectsSnapshot.docs) {
                    const projectId = projectDoc.id;

                    const studentsProjectsRef = collection(db, `${collectionName}/${projectId}/studentsProjects`);
                    const studentsProjectsSnapshot = await getDocs(studentsProjectsRef);
                    const studentsProjects = studentsProjectsSnapshot.docs.map(doc => ({
                        id: doc.id,
                        projectId,
                        ...doc.data()
                    })) as StudentProject[];

                    studentProjectsList.push(...studentsProjects);
                }

                setProjects(studentProjectsList);
            } catch (error) {
                console.error("Error fetching student projects:", error);
            }
        };

        fetchStudentProjects();
    }, []);

    const handleFileUpload = async (file: File): Promise<string> => {
        const uniqueName = `${uuidv4()}-${file.name}`;
        const storageRef = ref(getStorage(), `studentProjects/${uniqueName}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        return new Promise((resolve, reject) => {
            uploadTask.on(
                "state_changed",
                null,
                (error) => reject(error),
                async () => {
                    const downloadUrl = await getDownloadURL(storageRef);
                    resolve(downloadUrl);
                }
            );
        });
    };

    const validateProject = (project: StudentProject): boolean => {
        if (!project.title) {
            alert("El título es obligatorio.");
            return false;
        }
        if (!project.dueDate) {
            alert("La fecha límite es obligatoria.");
            return false;
        }
        if (!project.courseId) {
            alert("El ID del curso es obligatorio.");
            return false;
        }
        if (!project.order || project.order < 0) {
            alert("El orden debe ser un número positivo.");
            return false;
        }
        return true;
    };

    const saveStudentProject = async (item: StudentProject, isEditMode: boolean): Promise<void> => {
        const { id, projectId, ...data } = item;

        try {
            const subCollectionPath = `${collectionName}/${projectId}/studentsProjects`;

            if (isEditMode && id) {
                // Actualizar un documento existente en la subcolección
                const subDocRef = doc(db, subCollectionPath, id);
                await updateDoc(subDocRef, {
                    projectId: projectId, // Asegúrate de incluir projectId
                    dueDate: data.dueDate || null,
                    score: data.score || null,
                    fileUrl: data.fileUrl || null,
                    /* state: determineState(data), */
                });
            } else {
                // Crear un nuevo documento en la subcolección
                const subCollectionRef = collection(db, subCollectionPath);
                await addDoc(subCollectionRef, {
                    projectId: projectId, // Asegúrate de incluir projectId
                    userId: data.userId || "default-user-id", // Proporciona un userId predeterminado si está ausente
                    dueDate: data.dueDate || null,
                    score: data.score || null,
                    fileUrl: data.fileUrl || null,
                    /* state: determineState(data), */
                });
            }
        } catch (err) {
            console.error("Error guardando el proyecto principal o la subcolección:", err);
        }
    };

    const deleteStudentProject = async (item: StudentProject): Promise<void> => {
        const { projectId, id } = item;
        const docPath = `${collectionName}/${projectId}/studentsProjects/${id}`;

        try {
            const docRef = doc(db, docPath);
            await deleteDoc(docRef);
        } catch (err) {
            console.error("Error deleting student project:", err);
        }
    };

    const determineState = (project: StudentProject): string => {
        const deliveredDate = project?.deliveredDay ? new Date(project.deliveredDay) : null;
        const dueDate = project?.dueDate ? new Date(project.dueDate) : null;
        const today = new Date();

        if (project?.score !== null && project?.score !== undefined) return "Revisado";

        if (project?.studentFileUrl && (project?.score === null || project?.score === undefined)) return "Pendientes de revisión";

        if (project?.studentFileUrl && deliveredDate && dueDate && deliveredDate > dueDate) return "Entregado tarde";

        if (!project?.studentFileUrl && dueDate && dueDate > today) return "Entregable";

        if (!project?.studentFileUrl && dueDate && dueDate <= today) return "No entregado";

        return "Desconocido";
    };
    const getStateColor = (state: string): string => {
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

    return (
        <CrudMenu
            collectionName={collectionName}
            pageTitle="Proyectos de Estudiantes"
            displayFields={[
                { label: "Título", field: "title", type: "text" },
                { label: "User", field: "displayName", type: "text" },
                { label: "Fecha Límite", field: "dueDate", type: "date" },
                { label: "Score", field: "score", type: "number" },
                { label: "Mentor", field: "mentor", type: "text" },
            ]}
            editFields={[
                { label: "Título", field: "title", type: "text" },
                { label: "Fecha Límite", field: "dueDate", type: "date" },
                { label: "Puntuación", field: "score", type: "text" },
                { label: "Fecha de Entregado", field: "deliveredDay", type: "date" },
                { label: "Proyecto", field: "fileUrl", type: "file" },
            ]}
            downloadBtn={true}
            fileUploadHandler={handleFileUpload}
            onSave={saveStudentProject}
            onDelete={deleteStudentProject}
            determineState={determineState}
            getStateColor={getStateColor}
            data={projects}
        />
    );
};

export default StudentsProjects;
