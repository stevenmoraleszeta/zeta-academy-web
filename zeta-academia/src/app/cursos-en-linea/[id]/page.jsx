"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { FaRegImage, FaPencilAlt } from "react-icons/fa";
import styles from "./page.module.css";

const CourseDetail = ({ params }) => {
  const router = useRouter();
  const courseId = params.id;
  const [course, setCourse] = useState({
    title: "Introducción a la Programación con Python",
    description: "Conviértete en programador con Python desde cero. No necesitarás conocimientos previos y cuenta con apoyo personalizado.",
    discountedPrice: 14900,
    originalPrice: 29900,
    category: "Programación",
    videoUrl: "https://www.youtube.com/embed/rc9Db0uuOPI?si=DiiGkghjvsq_QkGU", // Set to empty for fallback scenario
    imageUrl: "/default-course.jpg",
    courseIcon: "/default-icon.jpg",
    features: [
      { icon: "🕒", title: "Curso asincrónico", description: "Aprende cualquier día y hora." },
      { icon: "👨‍🏫", title: "Atención personalizada", description: "Consulta al mentor en cualquier momento." },
      { icon: "💻", title: "Aprendizaje práctico", description: "Aprende con problemas reales." },
      { icon: "📜", title: "Certificado de finalización", description: "Incrementa tu conocimiento." },
    ],
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(""); // For image URL
  const [currentIconUrl, setCurrentIconUrl] = useState(""); // For icon URL
  const [newVideoUrl, setNewVideoUrl] = useState(""); // State to store new video URL

  useEffect(() => {
    const fetchCourse = async () => {
      const docRef = doc(db, "onlineCourses", courseId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const fetchedData = docSnap.data();
        const defaultFeatures = [
          { icon: "🕒", title: "Curso asincrónico", description: "Aprende cualquier día y hora." },
          { icon: "👨‍🏫", title: "Atención personalizada", description: "Consulta al mentor en cualquier momento." },
          { icon: "💻", title: "Aprendizaje práctico", description: "Aprende con problemas reales." },
          { icon: "📜", title: "Certificado de finalización", description: "Incrementa tu conocimiento." },
        ];
        setCourse({
          ...course,
          ...fetchedData,
          features: fetchedData.features && fetchedData.features.length > 0 ? fetchedData.features : defaultFeatures,
        });
      } else {
        console.error("Course not found");
        router.push("/cursos-en-linea");
      }
    };
    fetchCourse();
  }, [courseId]);

  const handleFieldChange = async (field, value) => {
    const updatedCourse = { ...course, [field]: value };
    setCourse(updatedCourse);
    const docRef = doc(db, "onlineCourses", courseId);
    await updateDoc(docRef, { [field]: value });
  };

  const openModal = () => {
    setCurrentUrl(course.imageUrl);
    setCurrentIconUrl(course.courseIcon);
    setIsModalOpen(true);
  };

  const openVideoModal = () => {
    setNewVideoUrl(course.videoUrl || "https://www.youtube.com/embed/rc9Db0uuOPI?si=DiiGkghjvsq_QkGU");
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

  return (
    <div className={styles.container}>
      <input
        type="text"
        value={course.title}
        onChange={(e) => handleFieldChange("title", e.target.value)}
        className={styles.titleInput}
      />

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

            <button className={styles.editVideoButton} onClick={openVideoModal}>
              <FaPencilAlt /> Editar Video
            </button>
          </div>
        </div>

        <div className={styles.courseInfo}>


          <textarea
            value={course.description}
            onChange={(e) => handleFieldChange("description", e.target.value)}
            className={styles.descriptionInput}
          />

          <div className={styles.priceContainer}>
            <span className={styles.discountedPrice}>
              ₡
              <input
                type="number"
                value={course.discountedPrice}
                onChange={(e) => handleFieldChange("discountedPrice", +e.target.value)}
                className={styles.discountedPriceInput}
              />
            </span>
            <span className={styles.originalPrice}>
              ₡
              <input
                type="number"
                value={course.originalPrice}
                onChange={(e) => handleFieldChange("originalPrice", +e.target.value)}
                className={styles.originalPriceInput}
              />
            </span>
          </div>


          <div className={styles.buttonContainer}>
            <button className={styles.enrollButton}>Inscríbete</button>
            <button className={styles.contactButton}>Contáctanos</button>
            <div className={styles.iconWrapper} onClick={openModal}>
              <FaRegImage className={styles.editIcon} />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.features}>
        {(course.features || []).map((feature, index) => (
          <div key={index} className={styles.feature}>
            <span className={styles.icon}>{feature.icon}</span>
            <div>
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
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Editing Image URL and Course Icon */}
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

      {/* Modal for Editing Video URL */}
      {isVideoModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Edit Video URL</h3>
            <label>
              Video URL:
              <input
                type="text"
                value={newVideoUrl}
                onChange={handleVideoUrlChange}
                placeholder="Enter new video URL"
                className={styles.modalInput}
              />
            </label>
            <div className={styles.modalActions}>
              <button onClick={saveVideoUrl}>Save</button>
              <button onClick={closeVideoModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetail;
