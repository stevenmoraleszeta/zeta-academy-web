// File: src/app/cursos-en-linea/[id]/page.jsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";
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
    videoUrl: "https://www.youtube.com/embed/default-video", // Default YouTube URL
    imageUrl: "/default-course.jpg", // Default image URL
    features: [
      { icon: "🕒", title: "Curso asincrónico", description: "Aprende cualquier día y hora." },
      { icon: "👨‍🏫", title: "Atención personalizada", description: "Consulta al mentor en cualquier momento." },
      { icon: "💻", title: "Aprendizaje práctico", description: "Aprende con problemas reales." },
      { icon: "📜", title: "Certificado de finalización", description: "Incrementa tu conocimiento." },
    ],
  });

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

  return (
    <div className={styles.container}>
      <input
        type="text"
        value={course.title}
        onChange={(e) => handleFieldChange("title", e.target.value)}
        className={styles.titleInput}
      />
      
      <div className={styles.videoContainer}>
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
      
      <input
        type="text"
        value={course.videoUrl}
        onChange={(e) => handleFieldChange("videoUrl", e.target.value)}
        placeholder="Enter YouTube video URL"
        className={styles.videoInput}
      />

      <div className={styles.courseImageContainer}>
        <img src={course.imageUrl} alt={course.title} className={styles.courseImage} />
      </div>
      
      <input
        type="text"
        value={course.imageUrl}
        onChange={(e) => handleFieldChange("imageUrl", e.target.value)}
        placeholder="Enter image URL"
        className={styles.imageInput}
      />

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
    </div>
  );
};

export default CourseDetail;
