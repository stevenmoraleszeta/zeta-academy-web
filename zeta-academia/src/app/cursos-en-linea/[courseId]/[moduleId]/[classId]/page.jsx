"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

const ClassDetail = () => {
    const router = useRouter();
    const { currentUser, isAdmin } = useAuth();
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
    const [isPreviousClassCompleted, setIsPreviousClassCompleted] = useState(true);
    const [courseName, setCourseName] = useState("");
    const [completedClasses, setCompletedClasses] = useState([]);
    const [isRestricted, setIsRestricted] = useState(false);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [isAlertOpen, setIsAlertOpen] = useState(false);

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        const classRef = doc(
          db,
          "onlineCourses",
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
        } else {
          console.error("Class not found");
          router.push("/cursos-en-linea");
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
          setCompletedClasses(completedClasses); // Actualiza el estado global
          setIsCompleted(completedClasses.includes(classId));
        } else {
          console.error("User document does not exist.");
        }
      } catch (error) {
        console.error("Error fetching completed status:", error);
      }
    };


    const fetchClassesInModule = async () => {
      try {
        const classesRef = collection(
          db,
          "onlineCourses",
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

        // Ordena las clases por su propiedad "order"
        classes.sort((a, b) => a.order - b.order);
        setClassesInModule(classes);
      } catch (error) {
        console.error("Error fetching classes in module:", error);
      }
    };

    const fetchCourseName = async () => {
      try {
        const courseRef = doc(db, "onlineCourses", courseId);
        const courseSnapshot = await getDoc(courseRef);
        if (courseSnapshot.exists()) {
          const courseData = courseSnapshot.data();
          setCourseName(courseData?.title || "Nombre del Curso no disponible");
        } else {
          console.error("Course document not found.");
        }
      } catch (error) {
        console.error("Error fetching course name:", error);
      }
    };

    // Fetch all required data
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

  useEffect(() => {
    if (classesInModule.length > 0 && completedClasses.length > 0) {
      const currentClassIndex = classesInModule.findIndex(
        (cls) => cls.id === classId
      );
      if (currentClassIndex > 0) {
        const previousClassId = classesInModule[currentClassIndex - 1].id;
        setIsPreviousClassCompleted(completedClasses.includes(previousClassId));
      } else {
        setIsPreviousClassCompleted(true);
      }
    }
  }, [classesInModule, completedClasses, classId]);

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
        "onlineCourses",
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

  const openModal = (
    type = "",
    content = "",
    title = "",
    start = "",
    end = "",
    index = null
  ) => {
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
    const resource = resources[index];
    const confirmDelete = window.confirm(
      `¿Estás seguro de que deseas eliminar el recurso "${
        resource.title || resource.content || "Sin título"
      }"?`
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
        "onlineCourses",
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

  const handleBackToSyllabus = () => {
    router.push(`/cursos-en-linea/${courseId}`);
  };

  const handlePreviousClass = () => {
    const currentClassIndex = classesInModule.findIndex(
      (cls) => cls.id === classId
    );
    if (currentClassIndex > 0) {
      const previousClassId = classesInModule[currentClassIndex - 1].id;
      router.push(
        `/cursos-en-linea/${courseId}/${moduleId}/${previousClassId}`
      );
    } else {
      console.log("No previous class available.");
    }
  };

  const handleNextClass = () => {
    const currentClassIndex = classesInModule.findIndex(
      (cls) => cls.id === classId
    );
    if (currentClassIndex < classesInModule.length - 1) {
      const nextClassId = classesInModule[currentClassIndex + 1].id;
      router.push(`/cursos-en-linea/${courseId}/${moduleId}/${nextClassId}`);
    } else {
      console.log("No next class available.");
    }
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

      // Generar una URL válida para YouTube con los parámetros necesarios
      const embedUrl = new URL(`https://www.youtube.com/embed/${videoId}`);
      embedUrl.searchParams.set("start", resource.start || "0");
      if (resource.end) {
        embedUrl.searchParams.set("end", resource.end);
      }

      // Establecer la URL generada al iframe
      iframe.src = embedUrl.toString();
    } else {
      console.error("El iframe o recurso no existe.");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    router.push(`/cursos-en-linea/${courseId}`);
  };

  if (isRestricted) {
    if (!currentUser) {
      return (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Acceso Restringido</h3>
            <p>Debe iniciar sesión para ver esta clase.</p>
            <button onClick={handleCloseModal} className={styles.modalButton}>
              Volver al temario
            </button>
          </div>
        </div>
      );
    } else if (!isAdmin && !isEnrolled) {
      return (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Acceso Restringido</h3>
            <p>Debe matricularse para ver esta clase.</p>
            <button onClick={handleCloseModal} className={styles.modalButton}>
              Volver al temario
            </button>
          </div>
        </div>
      );
    }
  }

  if (!Array.isArray(resources)) return <div>Loading...</div>;

  return (
    <div className={styles.classDetailContainer}>
      {isAdmin ? (
        <div className={styles.titleContainer}>
          <input
            type="text"
            value={classTitle}
            onChange={handleTitleChange}
            className={styles.titleInput}
            placeholder="Class Title"
          />
        </div>
      ) : (
        <span className={styles.titleInput}>{classTitle}</span>
      )}

      <div className={styles.resourcesContainer}>
        {resources
          .sort((a, b) => a.order - b.order)
          .map((resource, index) => (
            <div key={`${resource.type}-${index}`} className={styles.block}>
              {isAdmin ? (
                <div className={styles.resourceActions}>
                  <FaEdit
                    onClick={() =>
                      openModal(
                        resource.type,
                        resource.content,
                        resource.title || "",
                        resource.start || "",
                        resource.end || "",
                        index
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
              ) : null}
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
                    allowfullscreen
                  ></iframe>
                  <button
                    onClick={() => restartVideo(index)}
                    className={styles.restartButton}
                  >
                    Reiniciar Video
                  </button>
                </div>
              )}
              {resource.type === "imageUrl" && (
                <>
                  <img
                    src={resource.content}
                    alt={resource.title || "Image"}
                    className={styles.imagePreview}
                  />
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
              {resource.type === "sendProject" && (
                <button
                  className={styles.sendProjectButton}
                  onClick={handleSendProjectClick}
                >
                  <FaWhatsapp className={styles.sendProjectIcon} />
                  {resource.content || "Enviar Proyecto"}
                </button>
              )}
            </div>
          ))}
      </div>
      {isAdmin ? (
        <button onClick={() => openModal()} className={styles.addButton}>
          Add Resource
        </button>
      ) : null}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>
              {editingIndex !== null ? "Modify Resource" : "Add New Resource"}
            </h3>
            <label>
              Select Resource Type:
              <select
                value={newResourceType}
                onChange={(e) => setNewResourceType(e.target.value)}
                className={styles.modalSelect}
              >
                <option value="">Select Type</option>
                <option value="title">Title</option>
                <option value="text">Text</option>
                <option value="videoUrl">Video URL</option>
                <option value="imageUrl">Image URL</option>
                <option value="link">Link</option>
                <option value="pdfUrl">PDF URL</option>
                <option value="sendProject">Send Project</option>
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
              <button onClick={handleSaveResource}>
                {editingIndex !== null ? "Save Changes" : "Add"}
              </button>
              <button onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      <div className={styles.fixedBar}>
        <button
          className={styles.syllabusButton}
          onClick={handleBackToSyllabus}
        >
          <FaBook /> Volver al temario
        </button>

        {classesInModule.findIndex((cls) => cls.id === classId) > 0 && (
          <button className={styles.backButton} onClick={handlePreviousClass}>
            <FaChevronLeft /> Clase anterior
          </button>
        )}

        <button
          className={`${styles.completeButton} ${
            isCompleted ? styles.completedButton : ""
          }`}
          onClick={handleCompleteClass}
          disabled={!isPreviousClassCompleted && !isCompleted}
        >
          <FaCheck /> {isCompleted ? "Clase completada" : "Completar clase"}
        </button>
        {classesInModule.findIndex((cls) => cls.id === classId) <
          classesInModule.length - 1 && (
          <button className={styles.nextButton} onClick={handleNextClass}>
            Clase siguiente <FaChevronRight />
          </button>
        )}
      </div>
    </div>
  );
};

export default ClassDetail;
