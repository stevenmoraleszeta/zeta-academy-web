"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ClassesRecorded from "../clases-grabadas/page";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { FaRegImage, FaPencilAlt, FaArrowUp, FaArrowDown, FaTrash, FaPlus, FaCheck, FaLock, FaLockOpen, FaUser } from "react-icons/fa";
import styles from "./page.module.css";
import { useAuth } from "@/context/AuthContext";
import { getAuth } from "firebase/auth";
import debounce from "lodash/debounce";
import { storage } from "@/firebase/firebase"; // Importar configuración de storage
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { format } from 'date-fns';
import Image from "next/image";


const CourseDetail = ({ params }) => {
  const router = useRouter();
  const courseId = params.courseId;


  const [course, setCourse] = useState({
    title: "Introducción a la Programación con Python",
    description:
      "Conviértete en programador con Python desde cero. No necesitarás conocimientos previos y cuenta con apoyo personalizado.",
    discountedPrice: 35,
    originalPrice: 65,
    category: "Programación",
    videoUrl: "https://www.youtube.com/embed/rc9Db0uuOPI?si=DiiGkghjvsq_QkGU",
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2FprogrammingDefaulImage.webp?alt=media&token=1ddc96cb-88e5-498e-8d9f-a870f32ecc45",
    courseIcon:
      "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2FpythonIconPng.png?alt=media&token=6583f3bc-0ce1-42f8-adbe-75e4ede5e662",
    features: [
      {
        iconUrl:
          "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FClock%20Icon.png?alt=media&token=c99653f0-964d-472f-b00b-593aceaa3556",
        title: "Fecha de inicio",
        description: "15 de Noviembre.",
      },
      {
        iconUrl:
          "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FCol%C3%B3n%20icon.png?alt=media&token=07041992-5e34-46c4-b591-f6a8a59abf32",
        title: "Pago flexible",
        description: "Matrícula gratis, paga en dos partes.",
      },
      {
        iconUrl:
          "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FReloj%20Icon.png?alt=media&token=d323e959-9e9a-493c-a697-3b40799f94de",
        title: "Horario",
        description: "Viernes de 7 pm a 9 pm.",
      },
      {
        iconUrl:
          "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FLaptop%20Icon.png?alt=media&token=23fbc61d-e472-4bfa-a02c-33e20746c09a",
        title: "Material de apoyo adicional",
        description: "Clases grabadas y material adicional.",
      },
      {
        iconUrl:
          "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FPerson%20Notify%20Icon.png?alt=media&token=c37120e9-371b-45c9-b24e-5bc891fbfde3",
        title: "Atención personalizada",
        description: "Ayuda del mentor en cualquier momento.",
      },
      {
        iconUrl:
          "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FCertificado%20Icon.png?alt=media&token=608dc368-d510-4276-a551-f50cdcb4b7e6",
        title: "Certificado de finalización",
        description: "Incrementa tu conocimiento.",
      },
      {
        iconUrl:
          "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FLista%20Tareas%20Icon.png?alt=media&token=1c471825-3471-45e5-909c-6f1aa18d971a",
        title: "Duración",
        description: "6 semanas.",
      },
      {
        iconUrl:
          "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FIdea%20Icon.png?alt=media&token=38c0b934-1b7c-45ac-b665-26205af181a7",
        title: "Aprendizaje práctico",
        description: "Aprende con problemas reales.",
      },
    ],
  });

  const [currentUrl, setCurrentUrl] = useState("");
  const [currentIconUrl, setCurrentIconUrl] = useState("");
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const { currentUser, isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedProject, setEditedProject] = useState(null);
  const [file, setFile] = useState(null);
  const [modules, setModules] = useState([]);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [studentUsers, setStudentUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [score, setScore] = useState(null);
  const [isStudentInCourse, setIsStudentInCourse] = useState(false);
  const [studentProjects, setStudentProjects] = useState([]);
  const [averageScore, setAverageScore] = useState(0);
  const [displayName, setDisplayName] = useState("");
  const [editingIconIndex, setEditingIconIndex] = useState(null);
  const [newIconUrl, setNewIconUrl] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courseName, setCourseName] = useState("");


  useEffect(() => {
    const checkStudentInCourse = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          console.error("No user is authenticated.");
          return;
        }

        const userId = user.uid;
        const courseDocRef = doc(db, "liveCourses", courseId);
        const courseDocSnap = await getDoc(courseDocRef);

        if (!courseDocSnap.exists()) {
          console.error("Course document does not exist.");
          return;
        }

        const courseData = courseDocSnap.data();
        const studentsList = courseData.students || [];

        if (studentsList.includes(userId)) {
          setIsStudentInCourse(true);
        } else {
          setIsStudentInCourse(false);
        }
      } catch (error) {
        console.error("Error checking student in course:", error);
      }
    };

    checkStudentInCourse();
  }, [courseId]);


  const fetchCourse = async () => {
    try {
      const docRef = doc(db, "liveCourses", courseId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const fetchedData = docSnap.data();
        setCourse({
          ...course,
          ...fetchedData,
          features: fetchedData.features && fetchedData.features.length > 0 ? fetchedData.features : course.features,
        });
        setProjects(fetchedData.projects || []); // Carga los proyectos directamente
        setCourseName(fetchedData.name || "");
      } else {
        console.error("Course not found");
        router.push("/cursos-en-vivo");
      }
    } catch (error) {
      console.error("Error fetching course:", error);
      throw error;
    }
  };

  const fetchModules = async () => {
    try {
      setModules([]); // Reinicia el estado antes de cargar los datos.
      console.log("Cargando datos del curso...");

      let userCompletedClasses = [];
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          userCompletedClasses = userSnap.data().completedClasses || [];

        }
      }

      const modulesSnapshot = await getDocs(
        collection(db, "liveCourses", courseId, "modules")
      );

      const fetchedModules = await Promise.all(
        modulesSnapshot.docs.map(async (moduleDoc) => {
          const moduleData = moduleDoc.data();
          const classesSnapshot = await getDocs(
            collection(
              db,
              "liveCourses",
              courseId,
              "modules",
              moduleDoc.id,
              "classes"
            )
          );

          const classes = classesSnapshot.docs.map((classDoc) => ({
            id: classDoc.id,
            ...classDoc.data(),
          }));

          classes.sort((a, b) => a.order - b.order); // Ordena las clases por `order`.

          return {
            id: moduleDoc.id,
            ...moduleData,
            classes,
          };
        })
      );

      fetchedModules.sort((a, b) => a.order - b.order); // Ordena los módulos por `order`.

      // Encuentra la primera clase incompleta globalmente.
      let firstHighlightFound = false;

      const updatedModules = fetchedModules.map((classModule) => {
        const updatedClasses = classModule.classes.map((cls) => {
          const isCompleted = userCompletedClasses.includes(cls.id);

          if (!isCompleted && !firstHighlightFound) {
            firstHighlightFound = true;
            return { ...cls, completed: false, highlight: true };
          }

          return { ...cls, completed: isCompleted, highlight: false };
        });

        return {
          ...classModule,
          classes: updatedClasses,
        };
      });

      setModules(updatedModules);
    } catch (error) {
      console.error("Error loading course data:", error);
    }
  };

  const fetchProjects = async () => {
    if (isAdmin) {
      const projectsRef = collection(db, "liveCourses", courseId, "projects");
      const projectsSnapshot = await getDocs(projectsRef);
      const fetchedProjects = projectsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      fetchedProjects.sort((a, b) => a.order - b.order);
      setProjects(fetchedProjects);
    } else {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const projectsRef = collection(db, "liveCourses", courseId, "projects");
        const projectsSnapshot = await getDocs(projectsRef);
        const fetchedStudentProjects = [];

        for (const projectDoc of projectsSnapshot.docs) {
          const studentProjectsRef = collection(db, "liveCourses", courseId, "projects", projectDoc.id, "studentsProjects");
          const q = query(studentProjectsRef, where("userId", "==", user.uid));
          const studentProjectsSnapshot = await getDocs(q);

          studentProjectsSnapshot.forEach(doc => {
            fetchedStudentProjects.push({
              projectId: projectDoc.id,
              ...projectDoc.data(),
              ...doc.data(),
            });
          });
        }

        fetchedStudentProjects.sort((a, b) => a.order - b.order); // Ordena los proyectos por `order`
        setStudentProjects(fetchedStudentProjects);
      }
    }
  };

  const handleEditProject = async (project) => {
    setEditedProject(project);
    setIsEditModalOpen(true);

    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    const userId = user.uid;

    if (!isAdmin) {
      // Verificar si el estudiante tiene un archivo subido en studentsProjects
      const studentProjectRef = collection(db, "projects", project.id, "studentsProjects");
      const q = query(studentProjectRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const studentDoc = querySnapshot.docs[0].data();
        setEditedProject((prev) => ({
          ...prev,
          studentFileUrl: studentDoc.studentFileUrl || null,
        }));
      }
    }
  };

  const handleSaveProject = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        console.error("No user is authenticated.");
        return;
      }

      const userId = user.uid;
      const projectRef = doc(db, "liveCourses", courseId, "projects", editedProject.id);
      const updatedProject = { ...editedProject };

      const displayName = user.displayName || "Usuario sin nombre";

      if (file) {
        const fileRef = ref(storage, `project-files/${file.name}`);
        await uploadBytes(fileRef, file);
        const fileUrl = await getDownloadURL(fileRef);
        updatedProject.fileUrl = fileUrl;
      }

      updatedProject.courseId = courseId;
      updatedProject.userId = userId;

      const courseDocRef = doc(db, "liveCourses", courseId);
      const courseDocSnap = await getDoc(courseDocRef);

      if (!courseDocSnap.exists()) {
        throw new Error("Course document does not exist");
      }

      const courseData = courseDocSnap.data();
      const mentorId = courseData.mentor;

      const mentorDocRef = doc(db, "users", mentorId);
      const mentorDocSnap = await getDoc(mentorDocRef);
      const mentorData = mentorDocSnap.exists() ? mentorDocSnap.data() : {};
      const mentorName = mentorData.displayName || "Mentor sin nombre";

      updatedProject.mentor = mentorName;

      if (isAdmin) {
        await updateDoc(projectRef, updatedProject);
      }

      if (isAdmin) {
        await fetchStudentsAndCreateSubcollection(updatedProject, mentorName);
      }

      const studentProjectRef = collection(db, "liveCourses", courseId, "projects", editedProject.id, "studentsProjects");
      const studentProjectsSnapshot = await getDocs(studentProjectRef);

      const batch = writeBatch(db);
      studentProjectsSnapshot.forEach((docSnap) => {
        const studentProjectData = docSnap.data();

        const dueDate = new Date(updatedProject.dueDate).getTime();
        const currentDate = new Date().getTime();
        let state;

        if (studentProjectData.score) {
          state = "Revisado";
        } else if (studentProjectData.fileUrl && !studentProjectData.score) {
          state = "Pendiente de revisión";
        } else if (studentProjectData.fileUrl && currentDate > dueDate) {
          state = "Entregado tarde";
        } else if (!studentProjectData.fileUrl && currentDate <= dueDate) {
          state = "Entregable";
        } else if (!studentProjectData.fileUrl && currentDate > dueDate) {
          state = "No entregado";
        } else {
          state = "Sin estado";
        }

        batch.update(docSnap.ref, {
          title: updatedProject.title,
          fileUrl: updatedProject.fileUrl || null,
          dueDate: updatedProject.dueDate || null,
        });
      });

      await batch.commit();

      console.log("Project and student projects updated successfully!");

      setProjects((prevProjects) =>
        prevProjects.map((proj) =>
          proj.id === editedProject.id
            ? { ...updatedProject }
            : proj
        )
      );

      setDisplayName(displayName);
      setIsEditModalOpen(false);
      setFile(null);
      setScore(null);
    } catch (error) {
      console.error("Error saving project and student projects:", error);
    } finally {
      setIsEditModalOpen(false);
      setFile(null);
    }
  };

  const handleDeleteFile = async () => {
    const confirmed = confirm("¿Estás seguro de que deseas eliminar este archivo?");
    if (!confirmed) return;

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const userId = user.uid;
      const projectId = editedProject.id;

      if (isAdmin && editedProject.fileUrl) {
        const fileRef = ref(storage, editedProject.fileUrl);
        await deleteObject(fileRef);
        const projectRef = doc(db, "liveCourses", courseId, "projects", projectId);
        await updateDoc(projectRef, { fileUrl: null });
        setEditedProject((prev) => ({ ...prev, fileUrl: null }));
      } else if (!isAdmin && editedProject.studentFileUrl) {
        const studentProjectRef = collection(db, "liveCourses", courseId, "projects", projectId, "studentsProjects");
        const q = query(studentProjectRef, where("userId", "==", userId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const studentDocRef = doc(db, "liveCourses", courseId, "projects", projectId, "studentsProjects", querySnapshot.docs[0].id);
          await updateDoc(studentDocRef, { studentFileUrl: null });
          setEditedProject((prev) => ({ ...prev, studentFileUrl: null }));
        }
      }
    } catch (error) {
      console.error("Error al eliminar el archivo:", error);
    }
  };


  const handleSubmitProject = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user || !file) return;

      const userId = user.uid;
      const displayName = user.displayName ? user.displayName.replace(/\s+/g, "_") : "Estudiante";
      const projectName = editedProject.title.replace(/\s+/g, "_");
      const courseTitle = courseName.replace(/\s+/g, "_");

      const fileExtension = file.name.split('.').pop();
      const formattedFileName = `${displayName}-${projectName}-${courseTitle}.${fileExtension}`;
      const fileRef = ref(storage, `studentProjects/${formattedFileName}`);

      await uploadBytes(fileRef, file);
      const fileUrl = await getDownloadURL(fileRef);

      const studentProjectRef = collection(db, "liveCourses", courseId, "projects", editedProject.id, "studentsProjects");
      const q = query(studentProjectRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const studentDocRef = doc(db, "liveCourses", courseId, "projects", editedProject.id, "studentsProjects", querySnapshot.docs[0].id);
        await updateDoc(studentDocRef, { studentFileUrl: fileUrl });
        setEditedProject((prev) => ({ ...prev, studentFileUrl: fileUrl }));
      }

      setIsEditModalOpen(false);
      setFile(null);
    } catch (error) {
      console.error("Error al subir el archivo:", error);
    } finally {
      setIsEditModalOpen(false);
      setFile(null);
    }
  };


  const fetchStudentsAndCreateSubcollection = async (updatedProject, mentorName) => {
    try {
      // Obtener el documento del curso en la colección liveCourses
      const courseDocRef = doc(db, "liveCourses", courseId);
      const courseDocSnap = await getDoc(courseDocRef);

      if (!courseDocSnap.exists()) {
        throw new Error("Course document does not exist");
      }

      // Obtener la lista de estudiantes desde el array students en el documento del curso
      const courseData = courseDocSnap.data();
      const studentsList = courseData.students || [];

      // Referencia a la subcolección studentsProjects dentro del curso y proyecto
      const studentProjectRef = collection(
        db,
        "liveCourses",
        courseId,
        "projects",
        updatedProject.id,
        "studentsProjects"
      );

      const batch = writeBatch(db);

      for (const studentId of studentsList) {
        // Verificar si ya existe un documento con este userId en la subcolección
        const existingDocsQuery = query(
          studentProjectRef,
          where("userId", "==", studentId)
        );
        const existingDocsSnapshot = await getDocs(existingDocsQuery);

        if (!existingDocsSnapshot.empty) {
          // Si ya existe un documento para este usuario, omitir creación
          console.log(`Documento ya existe para el usuario, se omite.`);
          continue;
        }

        // Obtener el displayName del usuario
        const userDocRef = doc(db, "users", studentId);
        const userDocSnap = await getDoc(userDocRef);
        const userData = userDocSnap.exists() ? userDocSnap.data() : {};
        const displayName = userData.displayName || "Usuario sin nombre";

        // Obtener datos del curso
        const courseName = courseData.title || "Curso sin nombre";

        const studentProject = {
          title: updatedProject.title,
          fileUrl: updatedProject.fileUrl || null,
          userId: studentId,
          displayName: displayName,
          dueDate: updatedProject.dueDate || null,
          score: null,
          state: updatedProject.state || "sin estado",
          mentor: mentorName || "Mentor sin nombre",
          courseId: courseId,
          courseName: courseName,
        };
        console.log('Se ha creado un nuevo documento:', displayName);

        // Crear un nuevo documento con un ID único
        const newDocRef = doc(studentProjectRef); // Se genera un ID único automáticamente
        batch.set(newDocRef, studentProject);
      }

      await batch.commit();

      console.log("Student projects created successfully!");
    } catch (error) {
      console.error(
        "Error fetching students and creating subcollection:",
        error
      );
    }
  };

  const handleInputChange = (field, value) => {
    setEditedProject((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const fetchUsers = async () => {
    const usersRef = collection(db, "users");
    const usersSnapshot = await getDocs(usersRef);
    const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Filtrar usuarios por rol
    const adminUsers = usersList.filter(user => user.role === 'admin');
    const studentUsers = usersList.filter(user => user.role === 'student');

    setAllUsers(usersList);
    setAdminUsers(adminUsers); // Agregar estado para usuarios admin
    setStudentUsers(studentUsers); // Agregar estado para usuarios student
  };

  const fetchStudents = async () => {
    const docRef = doc(db, "liveCourses", courseId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const fetchedData = docSnap.data();
      setStudents(fetchedData.students || []);
      setSelectedMentor(fetchedData.mentor || null);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchCourse();
        await fetchModules();
        await fetchProjects();
        await fetchStudents();
        await fetchAverageScore();

      } catch (error) {
        console.error("Error en fetchData:", error);
        if (error.code === 'permission-denied') {
          console.error("Error de permisos - asegúrate de estar autenticado");
        }
      }
    };

    if (courseId) {
      fetchData();
    }
  }, [courseId, currentUser, router]);

  useEffect(() => {
    fetchUsers();
    fetchStudents();
  }, [courseId]);

  const handleFieldChange = async (field, value) => {
    const updatedCourse = { ...course, [field]: value };
    setCourse(updatedCourse);
    const docRef = doc(db, "liveCourses", courseId);
    await updateDoc(docRef, { [field]: value });
  };

  const addModule = async () => {
    const newModule = { title: "Nuevo Módulo", order: modules.length, classes: [] };
    const moduleRef = await addDoc(
      collection(db, "liveCourses", courseId, "modules"),
      newModule
    );
    setModules((prevModules) => [
      ...prevModules,
      { id: moduleRef.id, ...newModule },
    ]);
  };

  const deleteModule = async (moduleId) => {
    if (confirm("¿Estás seguro de que deseas eliminar este módulo?")) {
      await deleteDoc(doc(db, "liveCourses", courseId, "modules", moduleId));
      setModules(modules.filter((classModule) => classModule.id !== moduleId));
    }
  };

  const moveModule = async (index, direction) => {
    setModules((prevModules) => {
      const newModules = [...prevModules];
      const [movedModule] = newModules.splice(index, 1);
      newModules.splice(index + direction, 0, movedModule);

      // Update the order in the database
      newModules.forEach(async (classModule, newIndex) => {
        try {
          const moduleRef = doc(
            db,
            "liveCourses",
            courseId,
            "modules",
            classModule.id
          );
          await updateDoc(moduleRef, { order: newIndex });
        } catch (error) {
          console.error("Error updating module order:", error);
        }
      });

      return newModules;
    });
  };

  const moveClass = async (moduleId, classIndex, direction) => {
    setModules((prevModules) =>
      prevModules.map((classModule) => {
        if (classModule.id === moduleId) {
          const newClasses = [...classModule.classes];
          const [movedClass] = newClasses.splice(classIndex, 1);
          newClasses.splice(classIndex + direction, 0, movedClass);
          newClasses.forEach(async (cls, newIndex) => {
            try {
              const classRef = doc(
                db,
                "liveCourses",
                courseId,
                "modules",
                moduleId,
                "classes",
                cls.id
              );
              await updateDoc(classRef, { order: newIndex });
            } catch (error) {
              console.error("Error updating class order:", error);
            }
          });

          return { ...classModule, classes: newClasses };
        }
        return classModule;
      })
    );
  };

  const handleContactClick = () => {
    const phoneNumber = "+50661304830";
    const message = `Hola, estoy interesado/a en el curso en vivo ${course.title}.`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleEnrollClick = () => {
    const phoneNumber = "+50661304830"; // Reemplaza con tu número de teléfono
    const message = `Hola, estoy interesado/a en inscribirme al curso en vivo ${course.title}.`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  const openModal = () => {
    setCurrentUrl(course.imageUrl);
    setCurrentIconUrl(course.courseIcon);
    setIsModalOpen(true);
  };

  const openVideoModal = () => {
    setNewVideoUrl(
      course.videoUrl ||
      "https://www.youtube.com/embed/rc9Db0uuOPI?si=DiiGkghjvsq_QkGU"
    );
    setIsVideoModalOpen(true);
  };

  const handleUrlChange = (e) => {
    setCurrentUrl(e.target.value);
  };

  const handleIconUrlChange = (e) => {
    setCurrentIconUrl(e.target.value);
  };

  const handleVideoUrlChange = (e) => {
    setNewVideoUrl(e.target.value);
  };

  const addProject = async () => {
    const newProject = {
      title: "Nuevo Proyecto",
      courseId, // Relacionar el proyecto con el curso
      order: projects.length,
    };
    const projectRef = await addDoc(collection(db, "liveCourses", courseId, "projects"), newProject);
    setProjects((prevProjects) => [
      ...prevProjects,
      { id: projectRef.id, ...newProject },
    ]);
  };

  const deleteProject = async (projectId) => {
    if (confirm("¿Estás seguro de que deseas eliminar este proyecto?")) {
      await deleteDoc(doc(db, "liveCourses", courseId, "projects", projectId));
      setProjects(projects.filter((project) => project.id !== projectId));
    }
  };


  const moveProject = async (projectId, projectIndex, direction) => {
    setProjects((prevProjects) => {
      if (projectIndex === -1 || projectIndex + direction < 0 || projectIndex + direction >= prevProjects.length) return prevProjects;
      const newProjects = [...prevProjects];
      const [movedProject] = newProjects.splice(projectIndex, 1);
      newProjects.splice(projectIndex + direction, 0, movedProject);

      newProjects.forEach(async (project, newIndex) => {
        try {
          const projectRef = doc(db, "liveCourses", courseId, "projects", project.id);
          await updateDoc(projectRef, { order: newIndex });
        } catch (error) {
          console.error("Error updating project order:", error);
        }
      });

      return newProjects;
    });
  };

  const saveUrls = () => {
    handleFieldChange("imageUrl", currentUrl);
    handleFieldChange("courseIcon", currentIconUrl);
    closeModal();
  };

  const saveVideoUrl = () => {
    handleFieldChange("videoUrl", newVideoUrl);
    closeVideoModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentUrl("");
    setCurrentIconUrl("");
  };

  const closeVideoModal = () => {
    setIsVideoModalOpen(false);
    setNewVideoUrl("");
  };

  const handleAddItem = (moduleId) => {
    setSelectedModuleId(moduleId);
    setIsTypeModalOpen(true);
  };

  const createNewItem = async (type) => {
    if (!selectedModuleId) return;

    const collection_name = type === "class" ? "classes" : "projects";
    const classModule = modules.find((mod) => mod.id === selectedModuleId);
    if (!classModule) return;

    const items = [...(classModule.classes || []), ...(classModule.projects || [])];
    const nextOrder = items.length;

    const newItem = {
      title: type === "class" ? "Nueva Clase" : "Nuevo Proyecto",
      order: nextOrder,
      restricted: false,
      type: type // Añadir tipo para diferenciar
    };

    const itemRef = await addDoc(
      collection(db, "liveCourses", courseId, "modules", selectedModuleId, collection_name),
      newItem
    );

    setModules((prevModules) =>
      prevModules.map((mod) => {
        if (mod.id === selectedModuleId) {
          return {
            ...mod,
            [collection_name]: [...(mod[collection_name] || []), { id: itemRef.id, ...newItem }]
          };
        }
        return mod;
      })
    );

    setIsTypeModalOpen(false);
  };

  const deleteItem = async (moduleId, itemId, collection_name) => {
    if (confirm(`¿Estás seguro de que deseas eliminar este ${collection_name === "classes" ? "clase" : "proyecto"}?`)) {
      await deleteDoc(
        doc(db, "liveCourses", courseId, "modules", moduleId, collection_name, itemId)
      );
      setModules(
        modules.map((classModule) => {
          if (classModule.id === moduleId) {
            return {
              ...classModule,
              [collection_name]: classModule[collection_name].filter((item) => item.id !== itemId)
            };
          }
          return classModule;
        })
      );
    }
  };

  const moveItem = async (moduleId, itemIndex, direction, collection_name) => {
    setModules((prevModules) =>
      prevModules.map((classModule) => {
        if (classModule.id === moduleId) {
          const items = [...classModule[collection_name]];
          const [movedItem] = items.splice(itemIndex, 1);
          items.splice(itemIndex + direction, 0, movedItem);

          // Update the order in the database
          items.forEach(async (item, newIndex) => {
            try {
              const itemRef = doc(
                db,
                "liveCourses",
                courseId,
                "modules",
                moduleId,
                collection_name,
                item.id
              );
              await updateDoc(itemRef, { order: newIndex });
            } catch (error) {
              console.error(`Error updating ${collection_name} order:`, error);
            }
          });

          return { ...classModule, [collection_name]: items };
        }
        return classModule;
      })
    );
  };

  const toggleClassRestriction = async (moduleId, classId, currentStatus) => {
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
      await updateDoc(classRef, { restricted: !currentStatus });

      setModules((prevModules) =>
        prevModules.map((classModule) => {
          if (classModule.id === moduleId) {
            return {
              ...classModule,
              classes: classModule.classes.map((cls) =>
                cls.id === classId
                  ? { ...cls, restricted: !currentStatus }
                  : cls
              ),
            };
          }
          return classModule;
        })
      );
    } catch (error) {
      console.error("Error updating restriction status:", error);
    }
  };

  const handleItemClick = (moduleId, itemId, itemType) => {
    const collection = itemType === "class" ? "classes" : "projects";
    router.push(`/cursos-en-vivo/${courseId}/${moduleId}/${collection}/${itemId}`);
  };

  const handleModuleTitleChange = (moduleId, newTitle) => {
    setModules((prevModules) =>
      prevModules.map((classModule) =>
        classModule.id === moduleId ? { ...classModule, title: newTitle } : classModule
      )
    );
    debouncedUpdateModuleTitle(moduleId, newTitle);
  };

  const handleClassClick = (moduleId, classId) => {
    router.push(`/cursos-en-vivo/${courseId}/${moduleId}/${classId}`);
  };

  const debouncedUpdateModuleTitle = debounce(async (moduleId, newTitle) => {
    try {
      const moduleRef = doc(db, "liveCourses", courseId, "modules", moduleId);
      await updateDoc(moduleRef, { title: newTitle });
    } catch (error) {
      console.error("Error al actualizar el título del módulo:", error);
    }
  }, 500);

  const openGroupModal = async (currentMentor) => {
    // Cargar el mentor actual desde Firebase
    const docRef = doc(db, "liveCourses", courseId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const fetchedData = docSnap.data();
      setSelectedMentor(fetchedData.mentor || null); // Establecer el mentor actual
    }
    setIsGroupModalOpen(true);
  };

  const assignMentor = async (mentorId) => {
    const docRef = doc(db, "liveCourses", courseId);
    await updateDoc(docRef, {
      mentor: mentorId,
    });
  };

  const addStudent = async (studentId) => {
    const docRef = doc(db, "liveCourses", courseId);
    await updateDoc(docRef, {
      students: arrayUnion(studentId), // Agregar estudiante al array
    });

    const projectsRef = collection(db, "projects");
    const projectsSnapshot = await getDocs(projectsRef);
    const courseProjects = projectsSnapshot.docs.filter(doc => doc.data().courseId === courseId);

    const courseDocRef = doc(db, "liveCourses", courseId);
    const courseDocSnap = await getDoc(courseDocRef);
    const courseData = courseDocSnap.data();
    const courseName = courseData.title || "Curso sin nombre";

    const userDocRef = doc(db, "users", studentId);
    const userDocSnap = await getDoc(userDocRef);
    const userData = userDocSnap.exists() ? userDocSnap.data() : {};
    const displayName = userData.displayName || "Usuario sin nombre";

    const batch = writeBatch(db);
    for (const projectDoc of courseProjects) {
      const projectData = projectDoc.data();
      const studentProjectRef = collection(db, "projects", projectDoc.id, "studentsProjects");
      const existingStudentProjectQuery = query(studentProjectRef, where("userId", "==", studentId));
      const existingStudentProjectSnapshot = await getDocs(existingStudentProjectQuery);

      if (existingStudentProjectSnapshot.empty) {
        const studentProject = {
          title: projectData.title,
          fileUrl: projectData.fileUrl || null,
          userId: studentId,
          displayName: displayName,
          dueDate: projectData.dueDate || null,
          score: null,
          state: "No entregado",
          mentor: projectData.mentor || null,
          courseId: courseId,
          courseName: courseName,
        };

        const newStudentProjectRef = doc(studentProjectRef);
        batch.set(newStudentProjectRef, studentProject);
      }
    }

    await batch.commit();
    fetchStudents();
  };

  const removeStudent = async (studentId) => {
    const docRef = doc(db, "liveCourses", courseId);
    await updateDoc(docRef, {
      students: arrayRemove(studentId), // Quitar estudiante del array
    });

    // Obtener los proyectos del curso
    const projectsRef = collection(db, "projects");
    const projectsSnapshot = await getDocs(projectsRef);
    const courseProjects = projectsSnapshot.docs.filter(doc => doc.data().courseId === courseId);

    const batch = writeBatch(db);
    for (const projectDoc of courseProjects) {
      const studentProjectsRef = collection(db, "projects", projectDoc.id, "studentsProjects");
      const studentProjectsSnapshot = await getDocs(studentProjectsRef);
      studentProjectsSnapshot.forEach((docSnap) => {
        if (docSnap.data().userId === studentId) {
          batch.delete(docSnap.ref);
        }
      });
    }

    await batch.commit();
  };

  const handleAddStudent = async (studentId) => {
    await addStudent(studentId);
    fetchStudents();
  };

  const handleRemoveStudent = async (studentId) => {
    const confirmed = confirm("¿Estás seguro de que deseas quitar este estudiante?");
    if (confirmed) {
      await removeStudent(studentId);
      fetchStudents(); // Actualizar la lista de estudiantes después de eliminar
    }
  };

  const fetchAverageScore = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const avgScore = await calculateFinalAverage(user.uid);
      setAverageScore(avgScore);
    }
  };

  const calculateFinalAverage = async (studentId) => {
    try {
      const projectsRef = collection(db, "projects");
      const projectsSnapshot = await getDocs(projectsRef);
      let totalScore = 0;
      let projectCount = 0;

      for (const projectDoc of projectsSnapshot.docs) {
        const studentProjectsRef = collection(db, "projects", projectDoc.id, "studentsProjects");
        const q = query(studentProjectsRef, where("userId", "==", studentId));
        const studentProjectsSnapshot = await getDocs(q);

        studentProjectsSnapshot.forEach(doc => {
          let score = doc.data().score;
          score = Number(score);
          if (!isNaN(score)) {
            totalScore += score;
            projectCount += 1;
          }
        });
      }

      const averageScore = projectCount > 0 ? totalScore / projectCount : 0;
      return averageScore;
    } catch (error) {
      console.error("Error calculating final average score:", error);
      return 0;
    }
  };

  const averageScoreColor = averageScore >= 80 ? 'blue' : 'red';

  /* Features crud functions */

  const handleAddFeature = async () => {
    const newFeature = { title: "test", description: "test", iconUrl: 'https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FCertificado%20Icon.png?alt=media&token=608dc368-d510-4276-a551-f50cdcb4b7e6' };
    try {
      const courseRef = doc(db, "liveCourses", courseId);
      await updateDoc(courseRef, {
        features: arrayUnion(newFeature),
      });

      setCourse((prev) => ({
        ...prev,
        features: [...(prev.features || []), newFeature],
      }));

      console.log("Característica añadida exitosamente");
    } catch (error) {
      console.error("Error al agregar la característica:", error);
    }
  };

  const handleDeleteFeature = async (index) => {
    try {
      const updatedFeatures = [...course.features];

      updatedFeatures.splice(index, 1);

      const courseRef = doc(db, "liveCourses", courseId);
      await updateDoc(courseRef, { features: updatedFeatures });

      setCourse((prev) => ({
        ...prev,
        features: updatedFeatures,
      }));

      console.log("Característica eliminada exitosamente");
    } catch (error) {
      console.error("Error al eliminar la característica:", error);
    }
  };

  const moveFeature = async (index, direction) => {
    setCourse((prevCourse) => {
      const newFeatures = [...prevCourse.features];
      const [movedFeature] = newFeatures.splice(index, 1);
      newFeatures.splice(index + direction, 0, movedFeature);

      // Update the order in the database
      newFeatures.forEach(async (feature, newIndex) => {
        try {
          const courseRef = doc(db, "liveCourses", courseId);
          await updateDoc(courseRef, { features: newFeatures });
        } catch (error) {
          console.error("Error updating feature order:", error);
        }
      });

      return { ...prevCourse, features: newFeatures };
    });
  };

  const handleIconClick = (index) => {
    setEditingIconIndex(index);
    setNewIconUrl(course.features[index].iconUrl);
  };

  const handleIconFeatureChange = (e) => {
    setNewIconUrl(e.target.value);
  };

  const saveIconUrl = async (index) => {
    const updatedFeatures = [...course.features];
    updatedFeatures[index].iconUrl = newIconUrl;

    try {
      const courseRef = doc(db, "liveCourses", courseId);
      await updateDoc(courseRef, { features: updatedFeatures });
      setCourse((prev) => ({ ...prev, features: updatedFeatures }));
      setEditingIconIndex(null);
    } catch (error) {
      console.error("Error updating icon URL:", error);
    }
  };

  return (
    <div className={styles.container}>
      {isAdmin ? (
        <input
          type="text"
          value={course.title || ""}
          onChange={(e) => handleFieldChange("title", e.target.value)}
          className={styles.titleInput}
        />
      ) : (
        <span className={styles.titleText}>
          {course.title || "Sin título disponible"}
        </span>
      )}

      <div className={styles.courseMainContent}>
        <div className={styles.courseVideo}>
          <div className={styles.videoWrapper}>
            {course.videoUrl ? (
              <iframe
                src={course.videoUrl}
                title="Course video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <div className={styles.videoPlaceholder}>Video no disponible</div>
            )}
            {isAdmin ? (
              <button
                className={styles.editVideoButton}
                onClick={openVideoModal}
              >
                <FaPencilAlt /> Editar Video
              </button>
            ) : (
              <p></p>
            )}
          </div>
        </div>

        <div className={styles.courseInfo}>
          {isAdmin ? (
            <textarea
              value={course.description || ""}
              onChange={(e) => handleFieldChange("description", e.target.value)}
              className={styles.descriptionInput}
            />
          ) : (
            <p className={styles.descriptionText}>
              {course.description || "Descripción no disponible"}
            </p>
          )}

          <div className={styles.priceContainer}>
            <span className={styles.discountedPrice}>
              $
              {isAdmin ? (
                <input
                  type="number"
                  value={course.discountedPrice}
                  onChange={(e) =>
                    handleFieldChange("discountedPrice", +e.target.value)
                  }
                  className={styles.discountedPriceInput}
                />
              ) : (
                <span className={styles.discountedPriceInput}>
                  {course.discountedPrice || "No disponible"}
                </span>
              )}
            </span>
            <span className={styles.originalPrice}>
              $
              {isAdmin ? (
                <input
                  type="number"
                  value={course.originalPrice || ""}
                  onChange={(e) =>
                    handleFieldChange("originalPrice", +e.target.value)
                  }
                  className={styles.originalPriceInput}
                />
              ) : (
                <span className={styles.originalPriceInput}>
                  {course.originalPrice || "No disponible"}
                </span>
              )}
            </span>
          </div>

          <div className={styles.buttonContainer}>
            <button
              className={styles.enrollButton}
              onClick={
                students.includes(currentUser?.uid) ? null : handleEnrollClick
              }
            >
              {students.includes(currentUser?.uid) ? "Inscrito" : "Inscríbete"}
            </button>
            <button
              className={styles.contactButton}
              onClick={handleContactClick}
            >
              Contáctanos
            </button>
            {isAdmin && (
              <div className={styles.iconWrapper} onClick={openModal}>
                <FaRegImage className={styles.editIcon} />
              </div>
            )}
            {isAdmin && (
              <div className={styles.iconWrapper} onClick={openGroupModal}>
                <FaUser className={styles.editIcon} />
              </div>
            )}
          </div>
        </div>
      </div>

      {!isStudentInCourse && (
        <div className={styles.features}>
          {isAdmin && (
            <>
              <div className={styles.actionBtnsContainer}>
                <button onClick={handleAddFeature} className={styles.featuresActionsBtn}>
                  <FaPlus />
                </button>
              </div>
              <div></div>
            </>
          )}
          {(course.features || defaultFeatures).map((feature, index) => (
            <div key={index} className={styles.feature}>
              <div className={styles.featureIcon} onClick={() => handleIconClick(index)}>
                <Image
                  src={feature.iconUrl}
                  alt={`Icono de ${feature.title}`}
                  fill
                  style={{ objectFit: "contain" }} // Ajusta según cómo quieras que se muestren los íconos
                />
              </div>
              {editingIconIndex === index && isAdmin && (
                <div className={styles.iconUrlInputContainer}>
                  <input
                    type="text"
                    value={newIconUrl}
                    onChange={handleIconFeatureChange}
                    className={styles.iconUrlInput}
                  />
                  <button onClick={() => saveIconUrl(index)} className={styles.saveButton}>
                    Guardar
                  </button>
                </div>
              )}
              <div>
                {isAdmin ? (
                  <>
                    <input
                      type="text"
                      value={feature.title}
                      onChange={(e) => {
                        const updatedFeatures = [...course.features];
                        updatedFeatures[index].title = e.target.value;
                        handleFieldChange("features", updatedFeatures);
                      }}
                      className={styles.featureTitleInput}
                    />
                    <textarea
                      value={feature.description}
                      onChange={(e) => {
                        const updatedFeatures = [...course.features];
                        updatedFeatures[index].description = e.target.value;
                        handleFieldChange("features", updatedFeatures);
                      }}
                      className={styles.featureDescriptionInput}
                    />
                  </>
                ) : (
                  <>
                    <div className={styles.featureTitleInput}>
                      {feature.title || "Título no disponible"}
                    </div>
                    <div className={styles.featureDescriptionInput}>
                      {feature.description || "Descripción no disponible"}
                    </div>
                  </>
                )}
                {isAdmin && (
                  <>
                    <div className={styles.featuresActionsContainer}>
                      <div className={styles.featureActions}>
                        <button
                          onClick={() => moveFeature(index, -1)}
                          disabled={index === 0}
                          className={styles.moveButton}
                        >
                          <FaArrowUp />
                        </button>
                        <button
                          onClick={() => moveFeature(index, 1)}
                          disabled={index === course.features.length - 1}
                          className={styles.moveButton}
                        >
                          <FaArrowDown />
                        </button>
                      </div>
                      <div>
                        <button
                          className={styles.featuresActionsBtn}
                          onClick={() => handleDeleteFeature(index)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={styles.modulesProjectsContainer}>
        {/* Módulos */}
        <div className={styles.modules}>
          {modules.length > 0 ? (
            modules.map((classModule, moduleIndex) => (
              <div key={classModule.id} className={styles.module}>
                <div className={styles.moduleHeader}>
                  {isAdmin ? (
                    <input
                      type="text"
                      value={classModule.title}
                      onChange={(e) =>
                        handleModuleTitleChange(classModule.id, e.target.value)
                      }
                      className={styles.moduleTitle}
                    />
                  ) : (
                    <span className={styles.moduleTitle}>{classModule.title}</span>
                  )}
                  {isAdmin ? (
                    <div className={styles.moduleActions}>
                      <button
                        onClick={() => moveModule(moduleIndex, -1)}
                        disabled={moduleIndex === 0}
                        className={styles.moveButton}
                      >
                        <FaArrowUp />
                      </button>
                      <button
                        onClick={() => moveModule(moduleIndex, 1)}
                        disabled={moduleIndex === modules.length - 1}
                        className={styles.moveButton}
                      >
                        <FaArrowDown />
                      </button>
                      <button
                        onClick={() => addClass(classModule.id)}
                        title="Añadir Clase"
                      >
                        <FaPlus />
                      </button>
                      <button
                        onClick={() => deleteModule(classModule.id)}
                        title="Eliminar Módulo"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ) : (
                    null
                  )}
                </div>

                <div className={styles.classes}>
                  {classModule.classes && classModule.classes.length > 0 ? (
                    classModule.classes.map((cls, classIndex) => (
                      <div
                        key={`${classModule.id}-${cls.id}`}
                        className={`${styles.class} ${cls.completed ? styles.completedClass : ""
                          } ${cls.highlight ? styles.highlightClass : ""}`}
                        onClick={() => handleClassClick(classModule.id, cls.id)}
                      >
                        <div className={styles.classCircle}>
                          {cls.completed && <FaCheck />}
                        </div>
                        <span className={styles.classTitle}>{cls.title}</span>
                        {isAdmin ? (
                          <div className={styles.moduleActions}>
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                moveClass(classModule.id, classIndex, -1);
                              }}
                              disabled={classIndex === 0}
                              className={styles.moveButton}
                            >
                              <FaArrowUp />
                            </button>
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                moveClass(classModule.id, classIndex, 1);
                              }}
                              disabled={classIndex === classModule.classes.length - 1}
                              className={styles.moveButton}
                            >
                              <FaArrowDown />
                            </button>
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                toggleClassRestriction(
                                  classModule.id,
                                  cls.id,
                                  cls.restricted
                                );
                              }}
                              className={styles.classAction}
                              title={
                                cls.restricted
                                  ? "Desbloquear Clase"
                                  : "Bloquear Clase"
                              }
                            >
                              {cls.restricted ? <FaLock /> : <FaLockOpen />}
                            </button>
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                deleteClass(classModule.id, cls.id);
                              }}
                              className={styles.classAction}
                              title="Eliminar Clase"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        ) : (
                          null
                        )}
                      </div>
                    ))
                  ) : (
                    <p>No hay clases en este módulo.</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p>No hay módulos disponibles.</p>
          )}
          {isAdmin ? (
            <button
              onClick={addModule}
              className={styles.addModuleButton}
              title="Añadir Módulo"
            >
              Add Module
            </button>
          ) : (
            null
          )}
        </div>


        {/* Proyectos */}
        {(isStudentInCourse || isAdmin) && (

          <div className={styles.mainContainer} >
            <div className={styles.projects}>
              <h3>Proyectos</h3>
              {(isAdmin ? projects : studentProjects)
                .filter((project) => project.courseId === courseId)
                .map((project, index) => {
                  const studentProject = studentProjects.find(sp => sp.projectId === project.id);
                  return (
                    <div key={project.id} className={styles.projectItem} onClick={() => handleEditProject(project)}>
                      <span>{project.title}</span>
                      {!isAdmin && (
                        <span>{studentProject ? studentProject.score : 'No score'}</span>
                      )}
                      {isAdmin && (
                        <div className={styles.projectActions}>
                          <button
                            onClick={(event) => {
                              event.stopPropagation(); // Evitar que el evento se propague
                              moveProject(project.id, index, -1);
                            }}
                            disabled={index === 0}
                            className={styles.projectAction}
                          >
                            <FaArrowUp />
                          </button>
                          <button
                            onClick={(event) => {
                              event.stopPropagation(); // Evitar que el evento se propague
                              moveProject(project.id, index, 1);
                            }}
                            disabled={index === projects.length - 1}
                            className={styles.projectAction}
                          >
                            <FaArrowDown />
                          </button>
                          <button
                            onClick={(event) => {
                              event.stopPropagation(); // Evitar que el evento se propague
                              deleteProject(project.id);
                            }}
                            className={styles.projectAction}
                            title="Eliminar Proyecto"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              <div>
                {!isAdmin && (
                  <>
                    <span className={styles.averageLabel}>Promedio: </span>
                    <span className={styles.averageLabel} style={{ color: averageScore >= 80 ? '#005F73' : '#E85D04' }}>
                      {averageScore.toFixed(2)}/100
                    </span>
                  </>
                )}
              </div>
              {isAdmin && (
                <button onClick={addProject} className={styles.addProjectButton}>
                  Añadir Proyecto
                </button>
              )}
            </div>
            <ClassesRecorded courseId={courseId} />
          </div>
        )}
      </div>

      {/* Edit imgs url */}

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Edit URLs</h3>
            <label>
              Image URL:
              <input
                type="text"
                value={currentUrl}
                onChange={handleUrlChange}
                placeholder="Enter new image URL"
                className={styles.modalInput}
              />
            </label>
            <label>
              Course Icon URL:
              <input
                type="text"
                value={currentIconUrl}
                onChange={handleIconUrlChange}
                placeholder="Enter new icon URL"
                className={styles.modalInput}
              />
            </label>
            <div className={styles.modalActions}>
              <button onClick={saveUrls}>Save</button>
              <button onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}


      {/* //modal de editar proyecto */}


      {isEditModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Editar Proyecto</h3>
            <label>
              Nombre:
              <input
                type="text"
                value={editedProject?.title || ""}
                onChange={(e) => handleInputChange("title", e.target.value)}
                disabled={!isAdmin}
              />
            </label>
            <label>
              Fecha de Entrega:
              <input
                type="date"
                value={editedProject?.dueDate || ""}
                onChange={(e) => handleInputChange("dueDate", e.target.value)}
                disabled={!isAdmin}
              />
            </label>

            {/* ✅ Descarga de Indicaciones para TODOS */}
            {editedProject.fileUrl && (
              <div className={styles.downloadSection}>
                <a
                  href={editedProject.fileUrl}
                  download={`${editedProject.title || "indicaciones_proyecto"}_${courseName || "curso"}`}
                  className={styles.downloadButton}
                  target="_blank"
                >
                  📥 Descargar Indicaciones
                </a>
              </div>
            )}

            {/* ✅ Mensaje de éxito */}
            {editedProject.studentFileUrl && (
              <div className={styles.successMessage}>
                Proyecto cargado exitosamente.
              </div>
            )}

            {/* ✅ Administración de archivos según el rol */}
            {isAdmin ? (
              <label>
                <p>Subir Proyecto:</p>
                <input type="file" onChange={handleFileChange} />
                {editedProject.fileUrl && (
                  <>
                    <a href={editedProject.fileUrl} download="proyecto_admin" target="_blank" className={styles.downloadButton}>
                      📥 Descargar Indicaciones
                    </a>
                    <button onClick={handleDeleteFile}><FaTrash />Eliminar indicaciones</button>
                  </>
                )}
              </label>
            ) : (
              <label>
                {editedProject.studentFileUrl ? (
                  <>
                    <a href={editedProject.studentFileUrl} download="proyecto_estudiante" target="_blank" className={styles.downloadButton}>
                      📥 Descargar mi Proyecto
                    </a>
                    <button onClick={handleDeleteFile}><FaTrash />Eliminar mi proyecto</button>
                  </>
                ) : (
                  <>
                    <p>Subir mi proyecto:</p>
                    <input type="file" onChange={handleFileChange} />
                  </>
                )}
              </label>
            )}

            <div className={styles.modalActions}>
              {isAdmin && <button onClick={handleSaveProject}>Guardar Proyecto</button>}
              {!isAdmin && <button onClick={handleSubmitProject}>Guardar Proyecto</button>}
              <button onClick={() => setIsEditModalOpen(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}





      {isTypeModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>¿Qué deseas crear?</h3>
            <div className={styles.typeButtons}>
              <button onClick={() => createNewItem("class")}>
                📚 Clase
              </button>
              <button onClick={() => createNewItem("project")}>
                🛠️ Proyecto
              </button>
            </div>
            <button onClick={() => setIsTypeModalOpen(false)} className={styles.cancelButton}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {isGroupModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Asignar Mentor</h3>
            <select
              value={selectedMentor || ""}
              onChange={async (e) => {
                const mentorId = e.target.value;
                setSelectedMentor(mentorId);
                if (mentorId) {
                  await assignMentor(mentorId);
                }
              }}
            >
              <option value="">Selecciona un mentor</option>
              {adminUsers.map(user => (
                <option key={user.id} value={user.id}>
                  {user.displayName || "Nombre no disponible"}
                </option>
              ))}
            </select>
            <h3>Asignar Estudiantes</h3>
            <input
              type="text"
              placeholder="Buscar estudiante por nombre"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            <div className={styles.buttonContainer}>
              <select id="studentSelect">
                <option value="">Selecciona un estudiante</option>
                {studentUsers
                  .filter(user => user.displayName.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map(user => (
                    <option key={user.id} value={user.id}>
                      {user.displayName || "Nombre no disponible"}
                    </option>
                  ))}
              </select>
              <button onClick={() => handleAddStudent(document.getElementById('studentSelect').value)}>
                <FaPlus />
              </button>
            </div>
            <table className={styles.studentTable}>
              <thead>
                <tr>
                  <th>Estudiantes</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {students.map(studentId => {
                  const student = allUsers.find(user => user.id === studentId);
                  return (
                    <tr key={studentId}>
                      <td>{student ? student.displayName : "Nombre no disponible"}</td>
                      <td>
                        <button onClick={() => handleRemoveStudent(studentId)}>
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className={styles.buttonContainer}>
              <button onClick={() => setIsGroupModalOpen(false)} className={styles.secondaryButton}>
                Cerrar
              </button>
            </div>
          </div>

        </div>

      )}

    </div>

  );

};

export default CourseDetail;

