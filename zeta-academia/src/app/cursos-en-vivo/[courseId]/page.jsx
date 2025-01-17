"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

const CourseDetail = ({ params }) => {
  const router = useRouter();
  const courseId = params.courseId;

  console.log("CourseDetail rendered with courseId:", courseId); // Debug log

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
          "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FCalendar%20Icon.png?alt=media&token=example",
        title: "Fecha de inicio",
        description: "15 de Noviembre.",
      },
      {
        iconUrl:
          "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FPago%20Icon.png?alt=media&token=example",
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
          "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FMaterial%20Icon.png?alt=media&token=example",
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
          "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FDuracion%20Icon.png?alt=media&token=example",
        title: "Duración",
        description: "6 semanas.",
      },
      {
        iconUrl:
          "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FPractica%20Icon.png?alt=media&token=example",
        title: "Aprendizaje práctico",
        description: "Aprende con problemas reales.",
      },
    ],
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
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
  const [updatedProject, setUpdatedProject] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [projectState, setProjectState] = useState("");
  const [isStudentInCourse, setIsStudentInCourse] = useState(false);


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
      const modulesRef = collection(db, "liveCourses", courseId, "modules");
      const modulesSnapshot = await getDocs(modulesRef);

      const fetchedModules = await Promise.all(
        modulesSnapshot.docs.map(async (moduleDoc) => {
          const moduleData = moduleDoc.data();

          // Obtener clases de cada módulo
          const classesRef = collection(db, "liveCourses", courseId, "modules", moduleDoc.id, "classes");
          const classesSnapshot = await getDocs(classesRef);

          const classes = classesSnapshot.docs.map((classDoc) => ({
            id: classDoc.id,
            ...classDoc.data(),
          }));

          return {
            id: moduleDoc.id,
            ...moduleData,
            classes: classes.sort((a, b) => (a.order || 0) - (b.order || 0)),
          };
        })
      );

      setModules(fetchedModules.sort((a, b) => (a.order || 0) - (b.order || 0)));
    } catch (error) {
      console.error("Error fetching modules and classes:", error);
    }
  };

  const fetchProjects = async () => {
    const projectsRef = collection(db, "projects");
    const projectsSnapshot = await getDocs(projectsRef);
    const fetchedProjects = projectsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setProjects(fetchedProjects.filter((project) => project.courseId === courseId));
  };

  const handleEditProject = (project) => {
    setEditedProject(project);
    setIsEditModalOpen(true);
  };


  const handleScoreChange = async (newScore) => {
    setScore(newScore);

    try {
      const projectRef = doc(db, "projects", editedProject.id);
      await updateDoc(projectRef, { latestScore: newScore });
      console.log("Score updated successfully!");
    } catch (error) {
      console.error("Error updating score:", error);
    }
  };


  const handleSaveProject = async () => {
    try {
      // Obtener el usuario autenticado dinámicamente
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        console.error("No user is authenticated.");
        return;
      }

      const userId = user.uid; // ID del usuario autenticado
      const projectRef = doc(db, "projects", editedProject.id);
      const updatedProject = { ...editedProject };

      // Obtener el displayName del usuario
      const displayName = user.displayName || "Usuario sin nombre";

      // Manejo del archivo para el proyecto principal
      if (file) {
        const fileRef = ref(storage, `project-files/${file.name}`);
        await uploadBytes(fileRef, file);
        const fileUrl = await getDownloadURL(fileRef);
        updatedProject.fileUrl = fileUrl;
      }

      // Asignar automáticamente el curso y el usuario al proyecto
      updatedProject.courseId = courseId;
      updatedProject.userId = userId;

      // Obtener el ID del mentor desde el documento del curso
      const courseDocRef = doc(db, "liveCourses", courseId);
      const courseDocSnap = await getDoc(courseDocRef);

      if (!courseDocSnap.exists()) {
        throw new Error("Course document does not exist");
      }

      const courseData = courseDocSnap.data();
      const mentorId = courseData.mentor;

      // Obtener el nombre del mentor desde la colección users
      const mentorDocRef = doc(db, "users", mentorId);
      const mentorDocSnap = await getDoc(mentorDocRef);
      const mentorData = mentorDocSnap.exists() ? mentorDocSnap.data() : {};
      const mentorName = mentorData.displayName || "Mentor sin nombre";

      // Agregar el nombre del mentor al proyecto principal
      updatedProject.mentor = mentorName;

      // Calcular el estado dinámico del proyecto basado en las condiciones
      const dueDate = new Date(editedProject.dueDate).getTime();
      const currentDate = new Date().getTime();

      if (score) {
        updatedProject.state = "revisado";
      } else if (updatedProject.fileUrl && currentDate > dueDate) {
        updatedProject.state = "entregado tarde";
      } else if (updatedProject.fileUrl && !score) {
        updatedProject.state = "pendiente de revisión";
      } else if (!updatedProject.fileUrl && currentDate <= dueDate) {
        updatedProject.state = "entregable";
      } else if (!updatedProject.fileUrl && currentDate > dueDate) {
        updatedProject.state = "no entregado";
      } else {
        updatedProject.state = "sin estado"; // Valor por defecto si no se cumple ninguna condición
      }

      // Actualizar el proyecto principal en Firestore
      if (isAdmin) {
        await updateDoc(projectRef, updatedProject);
      }

      if (isAdmin) {
        await fetchStudentsAndCreateSubcollection(updatedProject, mentorName);
      }


      // Llamar a la función fetchStudents para obtener los datos de los estudiantes y crear los documentos en la subcolección
      await fetchStudentsAndCreateSubcollection(updatedProject, mentorName);

      const studentProjectRef = collection(db, "projects", editedProject.id, "studentsProjects");
      const querySnapshot = await getDocs(studentProjectRef);
      let latestScore = null;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.score !== null) {
          latestScore = data.score; // Guardar la última calificación encontrada
        }
      });


      // Actualizar el estado local para reflejar los cambios
      setProjects((prevProjects) =>
        prevProjects.map((proj) =>
          proj.id === editedProject.id ? { ...updatedProject, latestScore } : proj
        )
      );

      // Actualizar valores en el formulario/modal
      setDisplayName(displayName);
      setProjectState(updatedProject.state);
      setScore(latestScore); // Asignar la última calificación al estado

      // Cerrar el modal y limpiar valores
      setIsEditModalOpen(false);
      setFile(null);
      setScore(null);

      console.log("Project and student projects saved successfully!");
    } catch (error) {
      console.error("Error saving project and student projects:", error);
    }
  };

  const handleDeleteFile = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        console.error("No user is authenticated.");
        return;
      }

      const userId = user.uid; // ID del usuario autenticado

      if (editedProject.fileUrl && isAdmin) {
        const fileRef = ref(storage, editedProject.fileUrl);
        await deleteObject(fileRef);

        // Actualizar el campo fileUrl en el documento principal del proyecto
        const projectDocRef = doc(db, "projects", editedProject.id);
        await updateDoc(projectDocRef, { fileUrl: null });

        // Obtener todos los documentos en la subcolección studentsProjects
        const studentProjectsRef = collection(db, "projects", editedProject.id, "studentsProjects");
        const studentProjectsSnapshot = await getDocs(studentProjectsRef);

        // Actualizar el campo fileUrl en cada documento de la subcolección
        const batch = writeBatch(db);
        studentProjectsSnapshot.forEach((doc) => {
          batch.update(doc.ref, { fileUrl: null });
        });
        await batch.commit();

        setEditedProject((prev) => ({ ...prev, fileUrl: null }));
        console.log("File deleted successfully!");
      } else if (editedProject.studentFileUrl && !isAdmin) {
        const fileRef = ref(storage, editedProject.studentFileUrl);
        await deleteObject(fileRef);

        // Actualizar el campo studentFileUrl en el documento de estudiantes
        const studentProjectDocRef = doc(db, "projects", editedProject.id, "studentsProjects", userId);
        await updateDoc(studentProjectDocRef, { studentFileUrl: null });

        setEditedProject((prev) => ({ ...prev, studentFileUrl: null }));
        console.log("File deleted successfully!");

      }
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const handleSubmitProject = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        console.error("No user is authenticated.");
        return;
      }

      const userId = user.uid;
      const projectRef = doc(db, "projects", editedProject.id);
      const updatedProject = { ...editedProject };

      if (file) {
        const fileRef = ref(storage, `studentProjects/${file.name}`);
        await uploadBytes(fileRef, file);
        const fileUrl = await getDownloadURL(fileRef);
        updatedProject.studentFileUrl = fileUrl;
      }

      const studentProjectDocRef = doc(db, "projects", editedProject.id, "studentsProjects", userId);
      await updateDoc(studentProjectDocRef, {
        studentFileUrl: updatedProject.studentFileUrl || null,
        deliveredDay: format(new Date(), "yyyy-MM-dd"),
      });

      setProjects((prevProjects) =>
        prevProjects.map((proj) =>
          proj.id === editedProject.id ? { ...updatedProject } : proj
        )
      );

      setIsEditModalOpen(false);
      setFile(null);

      console.log("Student project submitted successfully!");
    } catch (error) {
      console.error("Error submitting student project:", error);
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

      // Crear un documento en la subcolección para cada estudiante
      const studentProjectRef = collection(
        db,
        "projects",
        updatedProject.id,
        "studentsProjects"
      );

      const batch = writeBatch(db);

      for (const studentId of studentsList) {
        // Verificar si el documento del estudiante ya existe en la subcolección
        const existingDocRef = doc(studentProjectRef, studentId);
        const existingDocSnap = await getDoc(existingDocRef);

        // Obtener el displayName del usuario
        const userDocRef = doc(db, "users", studentId);
        const userDocSnap = await getDoc(userDocRef);
        const userData = userDocSnap.exists() ? userDocSnap.data() : {};
        const displayName = userData.displayName || "Usuario sin nombre";

        const studentProject = {
          title: updatedProject.title,
          fileUrl: updatedProject.fileUrl || null,
          userId: studentId,
          displayName: displayName,
          dueDate: updatedProject.dueDate,
          score: null,
          state: updatedProject.state || "sin estado",
          mentor: mentorName,
        };

        if (existingDocSnap.exists()) {
          // Actualizar el documento existente
          batch.update(existingDocRef, studentProject);
        } else {
          // Crear un nuevo documento
          batch.set(existingDocRef, studentProject);
        }
      }

      await batch.commit();

      console.log("Student projects created/updated successfully!");
    } catch (error) {
      console.error("Error fetching students and creating/updating subcollection:", error);
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
      console.log("Estudiantes: ", fetchedData.students);
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
      setModules(modules.filter((module) => module.id !== moduleId));
    }
  };

  const moveModule = async (index, direction) => {
    setModules((prevModules) => {
      const newModules = [...prevModules];
      const [movedModule] = newModules.splice(index, 1);
      newModules.splice(index + direction, 0, movedModule);

      // Update the order in the database
      newModules.forEach(async (module, newIndex) => {
        try {
          const moduleRef = doc(
            db,
            "liveCourses",
            courseId,
            "modules",
            module.id
          );
          await updateDoc(moduleRef, { order: newIndex });
        } catch (error) {
          console.error("Error updating module order:", error);
        }
      });

      return newModules;
    });
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
    const projectRef = await addDoc(collection(db, "projects"), newProject);
    setProjects((prevProjects) => [
      ...prevProjects,
      { id: projectRef.id, ...newProject },
    ]);
  };

  const deleteProject = async (projectId) => {
    if (confirm("¿Estás seguro de que deseas eliminar este proyecto?")) {
      await deleteDoc(doc(db, "projects", projectId));
      setProjects(projects.filter((project) => project.id !== projectId));
    }
  };


  const moveProject = async (index, direction) => {
    const newProjects = [...projects];
    const [movedProject] = newProjects.splice(index, 1);
    newProjects.splice(index + direction, 0, movedProject);

    // Actualizar orden en Firestore
    newProjects.forEach(async (project, newIndex) => {
      const projectRef = doc(db, "projects", project.id);
      await updateDoc(projectRef, { order: newIndex });
    });

    setProjects(newProjects);
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
    const module = modules.find((mod) => mod.id === selectedModuleId);
    if (!module) return;

    const items = [...(module.classes || []), ...(module.projects || [])];
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
        modules.map((module) => {
          if (module.id === moduleId) {
            return {
              ...module,
              [collection_name]: module[collection_name].filter((item) => item.id !== itemId)
            };
          }
          return module;
        })
      );
    }
  };

  const moveItem = async (moduleId, itemIndex, direction, collection_name) => {
    setModules((prevModules) =>
      prevModules.map((module) => {
        if (module.id === moduleId) {
          const items = [...module[collection_name]];
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

          return { ...module, [collection_name]: items };
        }
        return module;
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
        prevModules.map((module) => {
          if (module.id === moduleId) {
            return {
              ...module,
              classes: module.classes.map((cls) =>
                cls.id === classId
                  ? { ...cls, restricted: !currentStatus }
                  : cls
              ),
            };
          }
          return module;
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
      prevModules.map((module) =>
        module.id === moduleId ? { ...module, title: newTitle } : module
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
  };

  const removeStudent = async (studentId) => {
    const docRef = doc(db, "liveCourses", courseId);
    await updateDoc(docRef, {
      students: arrayRemove(studentId), // Quitar estudiante del array
    });
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

      <div className={styles.features}>
        {(course.features || []).map((feature, index) => (
          <div key={index} className={styles.feature}>
            <img
              src={feature.iconUrl}
              alt={`Icono de ${feature.title}`}
              className={styles.featureIcon}
            />
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
                    {feature.title || "Sin título"}
                  </div>
                  <div className={styles.featureDescriptionInput}>
                    {feature.description || "Sin descripción"}
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.modulesProjectsContainer}>
        {/* Módulos */}
        <div className={styles.modules}>
          {modules.length > 0 ? (
            modules.map((module, moduleIndex) => (
              <div key={module.id} className={styles.module}>
                <div className={styles.moduleHeader}>
                  {isAdmin ? (
                    <input
                      type="text"
                      value={module.title}
                      onChange={(e) =>
                        handleModuleTitleChange(module.id, e.target.value)
                      }
                      className={styles.moduleTitle}
                    />
                  ) : (
                    <span className={styles.moduleTitle}>{module.title}</span>
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
                        onClick={() => addClass(module.id)}
                        title="Añadir Clase"
                      >
                        <FaPlus />
                      </button>
                      <button
                        onClick={() => deleteModule(module.id)}
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
                  {module.classes && module.classes.length > 0 ? (
                    module.classes.map((cls, classIndex) => (
                      <div
                        key={`${module.id}-${cls.id}`}
                        className={`${styles.class} ${cls.completed ? styles.completedClass : ""
                          } ${cls.highlight ? styles.highlightClass : ""}`}
                        onClick={() => handleClassClick(module.id, cls.id)}
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
                                moveClass(module.id, classIndex, -1);
                              }}
                              disabled={classIndex === 0}
                              className={styles.moveButton}
                            >
                              <FaArrowUp />
                            </button>
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                moveClass(module.id, classIndex, 1);
                              }}
                              disabled={classIndex === module.classes.length - 1}
                              className={styles.moveButton}
                            >
                              <FaArrowDown />
                            </button>
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                toggleClassRestriction(
                                  module.id,
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
                                deleteClass(module.id, cls.id);
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
          <div className={styles.projects}>
            <h3>Proyectos</h3>
            {projects.map((project, index) => {
              const studentProject = project.studentsProjects ? project.studentsProjects.find(sp => sp.userId === currentUser.id) : null;
              return (
                <div key={project.id} className={styles.projectItem} onClick={() => handleEditProject(project)}>
                  <span>{project.title}</span>
                  <span>{studentProject ? studentProject.score : 'No score'}</span>
                  {isAdmin && (
                    <div className={styles.projectActions}>
                      <button
                        onClick={() => moveProject(index, -1)}
                        disabled={index === 0}
                        className={styles.projectAction} // Reutilizar estilo del botón de mover
                      >
                        <FaArrowUp />
                      </button>
                      <button
                        onClick={() => moveProject(index, 1)}
                        disabled={index === projects.length - 1}
                        className={styles.projectAction} // Reutilizar estilo del botón de mover
                      >
                        <FaArrowDown />
                      </button>
                      <button
                        onClick={() => deleteProject(project.id)}
                        className={styles.projectAction} // Reutilizar si existe, o usa styles.classAction
                        title="Eliminar Proyecto"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            {isAdmin && (
              <button onClick={addProject} className={styles.addProjectButton}>
                Añadir Proyecto
              </button>
            )}
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
                  disabled={!isAdmin} // Deshabilitar si no es admin
                />
              </label>
              <label>
                Fecha de Entrega:
                <input
                  type="date"
                  value={editedProject?.dueDate || ""}
                  onChange={(e) => handleInputChange("dueDate", e.target.value)}
                  disabled={!isAdmin} // Deshabilitar si no es admin
                />
              </label>
              {(isStudentInCourse || isAdmin) && (
                <label>
                  {isAdmin ? "Subir Proyecto" : "Descargar Proyecto: "}
                  {isAdmin ? (
                    <>
                      <input type="file" onChange={handleFileChange} />
                      {editedProject.fileUrl && (
                        <button onClick={handleDeleteFile}><FaTrash></FaTrash></button>
                      )}
                    </>
                  ) : (
                    editedProject.fileUrl && (
                      <>
                        <a href={editedProject.fileUrl} download='proyecto' target="_blank" rel="noopener noreferrer">
                          Descargar Proyecto
                        </a>
                        <label htmlFor="">Subir mi proyecto</label>
                        <input type="file" onChange={handleFileChange} ></input>
                        <button onClick={handleDeleteFile}><FaTrash></FaTrash></button>
                      </>
                    )
                  )}
                </label>
              )}
              <div className={styles.modalActions}>
                {(isStudentInCourse || isAdmin) && (
                  <>
                    {isAdmin && (
                      <button onClick={handleSaveProject}>
                        Guardar Proyecto
                      </button>
                    )}
                    {!isAdmin && (
                      <button onClick={handleSubmitProject}>
                        Entregar Proyecto
                      </button>
                    )}
                  </>
                )}
                <button onClick={() => setIsEditModalOpen(false)}>Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </div>


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

