"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import styles from "./page.module.css";

interface Module {
  id: string;
  title: string;
  classes: Class[];
}

interface Class {
  id: string;
  title: string;
  content: ContentItem[];
}

interface ContentItem {
  type: "video" | "text" | "image" | "file" | "project";
  value: string;
}

const CourseDetails: React.FC = () => {
  const searchParams = useSearchParams();
  const courseId = searchParams.get("pageId");
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [expandedModules, setExpandedModules] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    if (!courseId) return;
    fetchCourseModules(courseId);
  }, [courseId]);

  const fetchCourseModules = async (courseId: string) => {
    try {
      const courseRef = doc(db, "onlineCourses", courseId);
      const courseSnap = await getDoc(courseRef);
      if (courseSnap.exists()) {
        setModules(courseSnap.data().modules || []);
      } else {
        console.error("No se encontró el curso.");
      }
    } catch (error) {
      console.error("Error al obtener los datos del curso:", error);
    }
  };

  const handleToggleModule = (moduleId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const handleSelectClass = (moduleId: string, classId: string) => {
    const module = modules.find((mod) => mod.id === moduleId);
    const clase = module?.classes.find((cls) => cls.id === classId);
    if (module && clase) {
      setSelectedModule(module);
      setSelectedClass(clase);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.sideBar}>
        <h2>Módulos</h2>
        <ul className={styles.moduleList}>
          {modules.map((module) => (
            <li key={module.id} className={styles.moduleItem}>
              <div className={styles.moduleHeader}>
                <span
                  onClick={() => handleToggleModule(module.id)}
                  className={styles.moduleTitle}
                >
                  {module.title}
                </span>
              </div>
              {expandedModules[module.id] && (
                <ul className={styles.classList}>
                  {module.classes.map((clase) => (
                    <li key={clase.id} className={styles.classItem}>
                      <span
                        onClick={() => handleSelectClass(module.id, clase.id)}
                        className={styles.classTitle}
                      >
                        {clase.title}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.mainContent}>
        {selectedClass ? (
          <div>
            <h3>{selectedClass.title}</h3>
            <div className={styles.contentList}>
              {selectedClass.content.map((content, index) => (
                <div key={index} className={styles.contentItem}>
                  {content.type === "video" && (
                    <iframe src={content.value} title="Video" />
                  )}
                  {content.type === "text" && <p>{content.value}</p>}
                  {content.type === "image" && (
                    <img src={content.value} alt="Imagen de clase" />
                  )}
                  {content.type === "file" && (
                    <a href={content.value} download>
                      Descargar Archivo
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p>Selecciona una clase para empezar</p>
        )}
      </div>
    </div>
  );
};

export default CourseDetails;
