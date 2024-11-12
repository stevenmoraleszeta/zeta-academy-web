"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import styles from "./page.module.css";
import { FaRegImage } from "react-icons/fa";

const CourseDetail = ({ params }) => {
  const router = useRouter();
  const courseId = params.id;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");
  const [currentIconUrl, setCurrentIconUrl] = useState("");

  const [course, setCourse] = useState({
    title: "Introducción a la Programación con Python",
    description:
      "Conviértete en programador con Python desde cero. No necesitarás conocimientos previos y cuenta con apoyo personalizado.",
    discountedPrice: 14900,
    originalPrice: 29900,
    category: "Programación",
    videoUrl: "https://www.youtube.com/embed/default-video",
    imageUrl: "/default-course.jpg",
    features: [
      {
        icon: "🕒",
        title: "Fecha de inicio",
        description: "Descripción.",
      },
      {
        icon: "👨‍🏫",
        title: "Pa",
        description: "Consulta al mentor en cualquier momento.",
      },
      {
        icon: "💻",
        title: "Aprendizaje práctico",
        description: "Aprende con problemas reales.",
      },
      {
        icon: "📜",
        title: "Certificado de finalización",
        description: "Incrementa tu conocimiento.",
      },
      {
        icon: "🕒",
        title: "Curso asincrónico",
        description: "Aprende cualquier día y hora.",
      },
      {
        icon: "👨‍🏫",
        title: "Atención personalizada",
        description: "Consulta al mentor en cualquier momento.",
      },
      {
        icon: "💻",
        title: "Aprendizaje práctico",
        description: "Aprende con problemas reales.",
      },
      {
        icon: "📜",
        title: "Certificado de finalización",
        description: "Incrementa tu conocimiento.",
      },
      {
        icon: "📜",
        title: "pruebas",
        description: "test",
      },
    ],
  });

  useEffect(() => {
    const fetchCourse = async () => {
      const docRef = doc(db, "onlineCourses", courseId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const fetchedData = docSnap.data();
        setCourse({
          ...course,
          ...fetchedData,
          features: fetchedData.features?.length
            ? fetchedData.features
            : course.features,
        });
      } else {
        console.error("Course not found");
        router.push("/cursos-en-linea");
      }
    };
    fetchCourse();
  }, [courseId]);

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

  const handleFieldChange = async (field, value) => {
    const updatedCourse = { ...course, [field]: value };
    setCourse(updatedCourse);
    const docRef = doc(db, "onlineCourses", courseId);
    await updateDoc(docRef, { [field]: value });
  };

  return (
    <div className={styles.container}>
      <input
        type="text"
        value={course.title}
        onChange={(e) => handleFieldChange("title", e.target.value)}
        className={styles.titleInput}
      />

      <div className={styles.content}>
        <div className={styles.videoSection}>
          <div className={styles.videoContainer}>
            <iframe
              src={course.videoUrl}
              title="Course video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            <input
              type="text"
              value={course.imageUrl}
              onChange={(e) => handleFieldChange("imageUrl", e.target.value)}
              placeholder="Enter image URL"
              className={styles.imageInput}
            />
          </div>
        </div>





        <div className={styles.descriptionSection}>
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
                onChange={(e) =>
                  handleFieldChange("discountedPrice", +e.target.value)
                }
                className={styles.priceInput}
              />
            </span>
            <span className={styles.originalPrice}>
              ₡
              <input
                type="number"
                value={course.originalPrice}
                onChange={(e) =>
                  handleFieldChange("originalPrice", +e.target.value)
                }
                className={styles.priceInput}
              />
            </span>
          </div>
          <div className={styles.buttonContainer}>
            <button className={styles.enrollButton}>Inscríbete</button>
            <button className={styles.contactButton}>Contáctanos</button>
            {/* Circular Icon Button for Editing Image and Icon URLs */}
            <div className={styles.iconWrapper} onClick={openModal}>
              <FaRegImage className={styles.editIcon} />{" "}
              {/* FontAwesome icon only */}
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
        </div>
      </div>

      <div className={styles.featuresGrid}>
        {course.features.map((feature, index) => (
          <div key={index} className={styles.featureItem}>
            <span className={styles.icon}>{feature.icon}</span>
            <div>
              <div className={styles.featureTitle}>{feature.title}</div>
              <div className={styles.featureDescription}>
                {feature.description}
              </div>
            </div>
          </div>
        ))}
      </div>
      <footer>
        
      </footer>
    </div>
  );
};

export default CourseDetail;
