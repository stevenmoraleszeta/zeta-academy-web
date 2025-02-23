"use client";

import React, { useEffect, useState } from "react";
import CrudMenu from "@/components/crud-menu/CrudMenu";
import { getDocs, collection, doc, updateDoc, deleteDoc, addDoc, where, query, writeBatch } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { getAuth } from "firebase/auth";

const StudentsProjects = () => {
    const [projects, setProjects] = useState([]);
    const collectionName = "liveCourses";

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const liveCoursesRef = collection(db, "liveCourses");
                const liveCoursesSnapshot = await getDocs(liveCoursesRef);
                const fetchedProjects = [];

                for (const courseDoc of liveCoursesSnapshot.docs) {
                    const projectsRef = collection(db, "liveCourses", courseDoc.id, "projects");
                    const projectsSnapshot = await getDocs(projectsRef);

                    for (const projectDoc of projectsSnapshot.docs) {
                        const studentProjectsRef = collection(db, "liveCourses", courseDoc.id, "projects", projectDoc.id, "studentsProjects");
                        const studentProjectsSnapshot = await getDocs(studentProjectsRef);

                        studentProjectsSnapshot.forEach(doc => {
                            fetchedProjects.push({
                                id: doc.id,
                                projectId: projectDoc.id,
                                courseId: courseDoc.id,
                                ...doc.data(),
                            });
                        });
                    }
                }

                setProjects(fetchedProjects);
            } catch (error) {
                console.error("Error fetching student projects:", error);
            }
        };

        fetchProjects();
    }, []);

    const handleFileUpload = async (file) => {
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

    const validateProject = (project) => {
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

    const saveStudentProject = async (item, isEditMode) => {
        const { id, projectId, courseId, courseName, ...data } = item;

        try {
            const auth = getAuth();
            const user = auth.currentUser;

            if (!user) {
                alert("Usuario no autenticado. Por favor, inicia sesión.");
                return;
            }

            if (!isEditMode) {
                const projectData = {
                    courseId: courseId,
                    dueDate: data.dueDate,
                    fileUrl: data.fileUrl,
                    title: courseName,
                    userId: user.uid,
                };

                alert("El proyecto ha sido creado exitosamente.");
                return;
            }

            const subCollectionPath = `liveCourses/${courseId}/projects/${projectId}/studentsProjects`;

            if (isEditMode && id) {
                const subDocRef = doc(db, subCollectionPath, id);
                await updateDoc(subDocRef, {
                    projectId: projectId,
                    dueDate: data.dueDate || null,
                    score: data.score || null,
                    fileUrl: data.fileUrl || null,
                    state: determineState(data),
                });
            }
        } catch (err) {
            console.error("Error guardando el proyecto principal o la subcolección:", err);
            alert("Ocurrió un error al guardar el proyecto.");
        }
    };

    const deleteStudentProject = async (item) => {
        const { projectId, courseId, id } = item;
        const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este proyecto?");

        if (confirmDelete) {
            const docPath = `liveCourses/${courseId}/projects/${projectId}/studentsProjects/${id}`;
            try {
                const docRef = doc(db, docPath);
                await deleteDoc(docRef);
            } catch (err) {
                console.error("Error deleting student project:", err);
            }
        }
    };

    const handleCheckStatus = async () => {
        try {
            const liveCoursesRef = collection(db, "liveCourses");
            const liveCoursesSnapshot = await getDocs(liveCoursesRef);

            if (liveCoursesSnapshot.empty) {
                console.log("No student projects found.");
                return;
            }

            const batch = writeBatch(db);

            for (const courseDoc of liveCoursesSnapshot.docs) {
                const projectsRef = collection(db, "liveCourses", courseDoc.id, "projects");
                const projectsSnapshot = await getDocs(projectsRef);

                for (const projectDoc of projectsSnapshot.docs) {
                    const studentProjectsRef = collection(db, "liveCourses", courseDoc.id, "projects", projectDoc.id, "studentsProjects");
                    const studentProjectsSnapshot = await getDocs(studentProjectsRef);

                    for (const studentDocSnap of studentProjectsSnapshot.docs) {
                        const studentData = studentDocSnap.data();
                        const { studentFileUrl, deliveredDay, dueDate, score } = studentData;

                        const state = determineState({
                            studentFileUrl,
                            deliveredDay,
                            dueDate,
                            score,
                        });

                        batch.update(studentDocSnap.ref, { state });
                    }
                }
            }
            await batch.commit();
            console.log("All student project states updated successfully!");
            window.location.reload();
        } catch (error) {
            console.error("Error updating student project states:", error);
        }
    };

    const determineState = (project) => {
        const deliveredDate = project.deliveredDay ? new Date(project.deliveredDay) : null;
        const dueDate = project.dueDate ? new Date(project.dueDate) : null;
        const today = new Date();

        if (project.score !== null && project.score !== undefined) return "Revisado";
        if (project.studentFileUrl && project.score === null) return "Pendientes de revisión";
        if (project.studentFileUrl && deliveredDate && dueDate && deliveredDate > dueDate) return "Entregado tarde";
        if (!project.studentFileUrl && dueDate && dueDate > today) return "Entregable";
        if (!project.studentFileUrl && dueDate && dueDate <= today) return "No entregado";

        return "Desconocido";
    };

    const getStateColor = (state) => {
        switch (state) {
            case "Revisado":
                return "green";
            case "No entregado":
                return "yellow";
            case "Pendientes de revisión":
                return "red";
            case "Entregado tarde":
                return "black";
            case "Entregable":
                return "blue";
            default:
                return "gray";
        }
    };

    return (
        <CrudMenu
            collectionName={collectionName}
            pageTitle="Proyectos de Estudiantes"
            displayFields={[
                { label: "Título", field: "courseName", type: "text" },
                { label: "Título", field: "title", type: "text" },
                { label: "displayName", field: "displayName", type: "text" },
                { label: "dueDate", field: "dueDate", type: "date" },
                { label: "score", field: "score", type: "number" },
                { label: "mentor", field: "mentor", type: "text" },
                { label: "state", field: "state", type: "text" },
            ]}
            editFields={[
                { label: "Título", field: "title", type: "text" },
                { label: "Fecha Límite", field: "dueDate", type: "date" },
                { label: "Puntuación", field: "score", type: "number" },
                { label: "Fecha de Entregado", field: "deliveredDay", type: "date" },
                { label: "Archivo del Proyecto", field: "fileUrl", type: "file" },
                { label: "Curso", field: "courseName", type: "text" },
            ]}
            downloadBtn={true}
            fileUploadHandler={handleFileUpload}
            onSave={saveStudentProject}
            onDelete={deleteStudentProject}
            determineState={determineState}
            getStateColor={getStateColor}
            data={projects}
            isCheckStatus={handleCheckStatus}
        />
    );
};

export default StudentsProjects;