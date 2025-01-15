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

                    // Obtener los documentos de la subcolección studentsProjects
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

    const fetchProjectWithSubCollection = async (): Promise<StudentProject[]> => {
        try {
            const mainCollectionRef = collection(db, collectionName);
            const mainSnapshot = await getDocs(mainCollectionRef);

            const projects = await Promise.all(
                mainSnapshot.docs.map(async (doc) => {
                    const data = doc.data() as Omit<StudentProject, "id" | "studentsProjects">;
                    const subCollectionRef = collection(db, `${collectionName}/${doc.id}/studentsProjects`);
                    const subSnapshot = await getDocs(subCollectionRef);

                    const studentsProjects = subSnapshot.docs.map((subDoc) => ({
                        id: subDoc.id,
                        ...subDoc.data(),
                    })) as StudentProject[];

                    return { id: doc.id, ...data, studentsProjects };
                })
            );

            return projects;
        } catch (err) {
            console.error("Error al cargar proyectos con subcolecciones:", err);
            return [];
        }
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
        const { id, ...data } = item;

        try {
            // Crear o actualizar el proyecto principal en la colección 'projects'
            let projectId = item.projectId;

            if (!isEditMode || !projectId) {
                // Si no es modo edición o no hay `projectId`, crea un nuevo proyecto principal
                const mainCollectionRef = collection(db, collectionName);
                const projectDoc = await addDoc(mainCollectionRef, {
                    title: data.title,
                    dueDate: data.dueDate,
                    courseId: data.courseId,
                    order: data.order,
                    state: determineState(data), // Estado inicial
                    fileUrl: data.fileUrl || null,
                });
                projectId = projectDoc.id; // Asignar el nuevo ID generado
            } else {
                // Actualizar el proyecto principal existente
                const mainDocRef = doc(db, collectionName, projectId);
                await updateDoc(mainDocRef, {
                    title: data.title,
                    dueDate: data.dueDate,
                    courseId: data.courseId,
                    order: data.order,
                    state: determineState(data),
                    fileUrl: data.fileUrl || null,
                });
            }

            // Ahora trabajar con la subcolección 'studentsProjects'
            const subCollectionPath = `${collectionName}/${projectId}/studentsProjects`;

            if (item.id) {
                // Actualizar un documento existente en la subcolección
                const subDocRef = doc(db, subCollectionPath, item.id);
                await updateDoc(subDocRef, {
                    deliveredDay: data.deliveredDay,
                    score: data.score,
                    fileUrl: data.fileUrl || null,
                    state: determineState(data),
                });
            } else {
                // Crear un nuevo documento en la subcolección
                const subCollectionRef = collection(db, subCollectionPath);
                await addDoc(subCollectionRef, {
                    userId: data.userId || "default-user-id", // Proporciona un userId predeterminado si está ausente
                    deliveredDay: data.deliveredDay || null,
                    score: data.score || null,
                    fileUrl: data.fileUrl || null,
                    state: determineState(data),
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
        const today = new Date();
        const dueDate = project?.dueDate ? new Date(project.dueDate) : null;
        const deliveredDay = project?.deliveredDay ? new Date(project.deliveredDay) : null;

        if (project?.fileUrl && project?.score !== null && project?.score !== undefined) return "Revisado";
        if (!project?.fileUrl && dueDate && dueDate > today) return "No Entregado";
        if (project?.fileUrl && (project?.score === null || project?.score === undefined)) return "Pendiente de Revisión";
        if (!project?.fileUrl && dueDate && dueDate <= today) return "Fuera de Tiempo";

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
                { label: "Fecha Límite", field: "dueDate", type: "date" },
                { label: "Orden", field: "order", type: "number" },
                { label: "Estado", field: "state", type: "text" },
            ]}
            editFields={[
                { label: "Título", field: "title", type: "text" },
                { label: "Fecha Límite", field: "dueDate", type: "date" },
                { label: "Archivo", field: "fileUrl", type: "file" },
                { label: "Orden", field: "order", type: "number" },
            ]}
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
