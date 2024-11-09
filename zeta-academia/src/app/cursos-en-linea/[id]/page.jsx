// File: src/app/cursos-en-linea/[id]/page.jsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { FaRegImage } from "react-icons/fa"; // Import FontAwesome icon from react-icons
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
    videoUrl: "https://www.youtube.com/embed/default-video",
    imageUrl: "/default-course.jpg",
    courseIcon: "/default-icon.jpg", // Default icon URL
    features: [
      { icon: "🕒", title: "Curso asincrónico", description: "Aprende cualquier día y hora." },
      { icon: "👨‍🏫", title: "Atención personalizada", description: "Consulta al mentor en cualquier momento." },
      { icon: "💻", title: "Aprendizaje práctico", description: "Aprende con problemas reales." },
      { icon: "📜", title: "Certificado de finalización", description: "Incrementa tu conocimiento." },
    ],
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");
  const [currentIconUrl, setCurrentIconUrl] = useState("");

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

  // Open modal for editing image and icon URL
  const openModal = () => {
    setCurrentUrl(course.imageUrl);
    setCurrentIconUrl(course.courseIcon);
    setIsModalOpen(true);
  };

  const handleUrlChange = (e) => {
    setCurrentUrl(e.target.value);
  };

  const handleIconUrlChange = (e) => {
    setCurrentIconUrl(e.target.value);
  };

  const saveUrl = () => {
    handleFieldChange("imageUrl", currentUrl);
    handleFieldChange("courseIcon", currentIconUrl);
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentUrl("");
    setCurrentIconUrl("");
  };

  return (
    <div className={styles.container}>
      <input
        type="text"
        value={course.title}
        onChange={(e) => handleFieldChange("title", e.target.value)}
        className={styles.titleInput}
      />

      {/* Video Container Wrapper */}
      <div className={styles.videoWrapper} onClick={openModal}>
        <iframe
          width="100%"
          height="315"
          src={course.videoUrl}
          title="Course video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>

      {/* Circular Icon Button for Editing Image and Icon URLs */}
      <div className={styles.iconWrapper} onClick={openModal}>
        <FaRegImage className={styles.editIcon} /> {/* FontAwesome icon only */}
      </div>
      
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
            className={styles.priceInput}
          />
        </span>
        <span className={styles.originalPrice}>
          ₡
          <input
            type="number"
            value={course.originalPrice}
            onChange={(e) => handleFieldChange("originalPrice", +e.target.value)}
            className={styles.priceInput}
          />
        </span>
      </div>

      <div className={styles.buttonContainer}>
        <button className={styles.enrollButton}>Inscríbete</button>
        <button className={styles.contactButton}>Contáctanos</button>
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
              <button onClick={saveUrl}>Save</button>
              <button onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetail;
