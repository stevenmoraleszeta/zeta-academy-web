// File: src/components/CourseCardMenu.jsx
import React, { useState } from "react";
import { FaArchive, FaCopy } from "react-icons/fa";
import styles from "./courseCardMenu.module.css";
import { useRouter } from "next/navigation";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { useAuth } from "@/context/AuthContext";


const CourseCardMenu = ({ course, courseType, onDuplicate }) => {
  const router = useRouter();
  const [isArchived, setIsArchived] = useState(course.archived); // Estado local para controlar el archivado
  const { user, isAdmin } = useAuth();

  // Determina la colección y la ruta en función del tipo de curso
  const collectionName =
    courseType === "live" ? "liveCourses" : "onlineCourses";
  const courseRoute =
    courseType === "live" ? "/cursos-en-vivo" : "/cursos-en-linea";

  const handleViewCourse = (courseId) => {
    router.push(`${courseRoute}/${courseId}`);
  };

  const handleArchiveCourse = async (courseId) => {
    const confirmArchive = window.confirm(
      "¿Estás seguro de que deseas archivar este curso?"
    );
    if (!confirmArchive) return;

    const docRef = doc(db, collectionName, courseId); // Usa la colección correcta
    try {
      await updateDoc(docRef, { archived: true });
      setIsArchived(true); // Actualiza el estado local para reflejar el cambio
    } catch (error) {
      console.error("Error archiving course: ", error);
    }
  };

  // No renderiza el curso si está archivado
  if (isArchived) return null;

  return (
    <div
      className={styles.courseCard}
      onClick={() => handleViewCourse(course.id)}
    >
      <img
        src={
          course.imageUrl ||
          "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2FprogrammingDefaulImage.webp?alt=media&token=1ddc96cb-88e5-498e-8d9f-a870f32ecc45"
        }
        alt={course.title}
        className={styles.courseImage}
      />
      <div className={styles.courseInfo}>
        <h2>{course.title}</h2>
        <p>{course.description}</p>
        <div className={styles.priceContainer}>
          <span className={styles.discountedPrice}>
            ${course.discountedPrice}
          </span>
          <span className={styles.originalPrice}>${course.originalPrice}</span>
        </div>
        <button
          className={styles.infoButton}
          onClick={() => handleViewCourse(course.id)}
        >
          Ver Información
        </button>

        {isAdmin && (
          <div className={styles.buttonIconContainer}>
            {onDuplicate && (
              <button
                className={styles.duplicateButton}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent navigation on button click
                  onDuplicate(course); // Call the duplicate function
                }}
                title="Duplicar curso"
              >
                <FaCopy />
              </button>
            )}
            <button
              className={styles.archiveButton}
              onClick={(e) => {
                e.stopPropagation(); // Prevent navigation on button click
                handleArchiveCourse(course.id);
              }}
              title="Archivar curso"
            >
              <FaArchive />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCardMenu;
