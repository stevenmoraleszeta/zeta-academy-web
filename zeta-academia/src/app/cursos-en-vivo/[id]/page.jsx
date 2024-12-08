"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { FaRegImage, FaPencilAlt } from "react-icons/fa";
import styles from "./page.module.css";
import { useAuth } from "@/context/AuthContext";

const CourseDetail = ({ params }) => {
  const router = useRouter();
  const courseId = params.id;
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

  useEffect(() => {
    const fetchCourse = async () => {
      const docRef = doc(db, "liveCourses", courseId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const fetchedData = docSnap.data();
        const defaultFeatures = [
          {
            iconUrl:
              "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FClock%20Icon.png?alt=media&token=c99653f0-964d-472f-b00b-593aceaa3556",
            title: "Fecha de inicio",
            description: "15 de Noviembre.",
          },
          {
            iconUrl:
              "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FPerson%20Notify%20Icon.png?alt=media&token=c37120e9-371b-45c9-b24e-5bc891fbfde3",
            title: "Atención personalizada",
            description: "Ayuda del mentor en cualquier momento.",
          },
          {
            iconUrl:
              "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FCol%C3%B3n%20icon.png?alt=media&token=07041992-5e34-46c4-b591-f6a8a59abf32",
            title: "Pago flexible",
            description: "Matrícula gratis, paga en dos partes.",
          },
          {
            iconUrl:
              "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FCertificado%20Icon.png?alt=media&token=608dc368-d510-4276-a551-f50cdcb4b7e6",
            title: "Certificado de finalización",
            description: "Incrementa tu conocimiento.",
          },
          {
            iconUrl:
              "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FReloj%20Icon.png?alt=media&token=d323e959-9e9a-493c-a697-3b40799f94de",
            title: "Horario",
            description: "Viernes de 7 pm a 9 pm.",
          },
          {
            iconUrl:
              "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FLista%20Tareas%20Icon.png?alt=media&token=1c471825-3471-45e5-909c-6f1aa18d971a",
            title: "Duración",
            description: "6 semanas.",
          },
          {
            iconUrl:
              "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FLaptop%20Icon.png?alt=media&token=23fbc61d-e472-4bfa-a02c-33e20746c09a",
            title: "Material de apoyo adicional",
            description: "Clases grabadas y material adicional.",
          },
          {
            iconUrl:
              "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FIdea%20Icon.png?alt=media&token=38c0b934-1b7c-45ac-b665-26205af181a7",
            title: "Aprendizaje práctico",
            description: "Aprende con problemas reales.",
          },
        ];
        setCourse({
          ...course,
          ...fetchedData,
          features:
            fetchedData.features && fetchedData.features.length > 0
              ? fetchedData.features
              : defaultFeatures,
        });
        document.title = `${course.title} - ZETA`;
      } else {
        console.error("Course not found");
        router.push("/cursos-en-vivo");
      }
    };
    fetchCourse();
  }, [courseId]);

  const handleFieldChange = async (field, value) => {
    const updatedCourse = { ...course, [field]: value };
    setCourse(updatedCourse);
    const docRef = doc(db, "liveCourses", courseId);
    await updateDoc(docRef, { [field]: value });
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
                  value={course.discountedPrice || ""}
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
            <button className={styles.enrollButton} onClick={handleEnrollClick}>
              Inscríbete
            </button>
            <button
              className={styles.contactButton}
              onClick={handleContactClick}
            >
              Contáctanos
            </button>
            {isAdmin ? (
              <div className={styles.iconWrapper} onClick={openModal}>
                <FaRegImage className={styles.editIcon} />
              </div>
            ) : (
              null
            )}
          </div>
        </div>
      </div>

      <div className={styles.features}>
        {(course.features || []).map((feature, index) => (
          <div key={index} className={styles.feature}>
            {/* Icono de la característica */}
            <img
              src={feature.iconUrl}
              alt={`Icono de ${feature.title}`}
              className={styles.featureIcon}
            />
            <div>
              {/* Si es administrador, mostrar campos editables */}
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
                // Si no es administrador, mostrar como texto estilizado
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
