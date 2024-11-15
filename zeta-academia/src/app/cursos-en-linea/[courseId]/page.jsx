"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc, collection, getDocs, addDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { FaRegImage, FaPencilAlt, FaTrash, FaPlus, FaRegCircle, FaArrowUp, FaArrowDown } from "react-icons/fa";
import debounce from "lodash/debounce";
import styles from "./page.module.css";

const CourseDetail = ({ params }) => {
  const router = useRouter();
  const courseId = params.courseId;
  const [course, setCourse] = useState({
    title: "Introducción a la Programación con Python",
    description: "Conviértete en programador con Python desde cero. No necesitarás conocimientos previos y cuenta con apoyo personalizado.",
    discountedPrice: 14900,
    originalPrice: 29900,
    category: "Programación",
    videoUrl: "https://www.youtube.com/embed/rc9Db0uuOPI?si=DiiGkghjvsq_QkGU",
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2FprogrammingDefaulImage.webp?alt=media&token=1ddc96cb-88e5-498e-8d9f-a870f32ecc45",
    courseIcon: "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2FpythonIconPng.png?alt=media&token=6583f3bc-0ce1-42f8-adbe-75e4ede5e662",
    features: [
      {
        iconUrl: "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FReloj%20Icon.png?alt=media&token=d323e959-9e9a-493c-a697-3b40799f94de",
        title: "Curso asincrónico",
        description: "Aprende cualquier día y hora."
      },
      {
        iconUrl: "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FPerson%20Notify%20Icon.png?alt=media&token=c37120e9-371b-45c9-b24e-5bc891fbfde3",
        title: "Atención personalizada",
        description: "Consulta al mentor en cualquier momento."
      },
      {
        iconUrl: "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FIdea%20Icon.png?alt=media&token=38c0b934-1b7c-45ac-b665-26205af181a7",
        title: "Aprendizaje práctico",
        description: "Aprende con problemas reales."
      },
      {
        iconUrl: "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FCertificado%20Icon.png?alt=media&token=608dc368-d510-4276-a551-f50cdcb4b7e6",
        title: "Certificado de finalización",
        description: "Incrementa tu conocimiento."
      }
    ],
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");
  const [currentIconUrl, setCurrentIconUrl] = useState("");
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [modules, setModules] = useState([]);

  useEffect(() => {
    const fetchCourse = async () => {
      const docRef = doc(db, "onlineCourses", courseId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const fetchedData = docSnap.data();
        setCourse((prevCourse) => ({
          ...prevCourse,
          ...fetchedData,
        }));
      } else {
        console.error("Course not found");
        router.push("/cursos-en-linea");
      }
    };

    const fetchModules = async () => {
      const modulesRef = collection(db, "onlineCourses", courseId, "modules");
      const modulesSnapshot = await getDocs(modulesRef);
      const fetchedModules = await Promise.all(
        modulesSnapshot.docs.map(async (doc) => {
          const moduleData = doc.data();
          const classesRef = collection(db, "onlineCourses", courseId, "modules", doc.id, "classes");
          const classesSnapshot = await getDocs(classesRef);
          const classes = classesSnapshot.docs.map((classDoc) => ({
            id: classDoc.id,
            ...classDoc.data(),
          }));
          return {
            id: doc.id,
            ...moduleData,
            classes,
          };
        })
      );
      setModules(fetchedModules);
    };

    fetchCourse();
    fetchModules();
  }, [courseId]);

  const handleFieldChange = async (field, value) => {
    const updatedCourse = { ...course, [field]: value };
    setCourse(updatedCourse);
    const docRef = doc(db, "onlineCourses", courseId);
    await updateDoc(docRef, { [field]: value });
  };

  const debouncedUpdateModuleTitle = debounce(async (moduleId, newTitle) => {
    try {
      const moduleRef = doc(db, "onlineCourses", courseId, "modules", moduleId);
      await updateDoc(moduleRef, { title: newTitle });
    } catch (error) {
      console.error("Error al actualizar el título del módulo:", error);
    }
  }, 500);

  const handleModuleTitleChange = (moduleId, newTitle) => {
    setModules((prevModules) =>
      prevModules.map((module) =>
        module.id === moduleId ? { ...module, title: newTitle } : module
      )
    );
    debouncedUpdateModuleTitle(moduleId, newTitle);
  };

  const debouncedUpdateClassTitle = debounce(async (moduleId, classId, newTitle) => {
    try {
      const classRef = doc(db, "onlineCourses", courseId, "modules", moduleId, "classes", classId);
      await updateDoc(classRef, { title: newTitle });
    } catch (error) {
      console.error("Error al actualizar el título de la clase:", error);
    }
  }, 500);

  const handleClassTitleChange = (moduleId, classId, newTitle) => {
    setModules((prevModules) =>
      prevModules.map((module) => {
        if (module.id === moduleId) {
          return {
            ...module,
            classes: module.classes.map((cls) =>
              cls.id === classId ? { ...cls, title: newTitle } : cls
            ),
          };
        }
        return module;
      })
    );
    debouncedUpdateClassTitle(moduleId, classId, newTitle);
  };

  const handleContactClick = () => {
    const phoneNumber = "+50661304830";
    const message = `Hola, estoy interesado/a en el curso en línea ${course.title}.`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
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

  const addModule = async () => {
    const newModule = { title: "Nuevo Módulo", classes: [] };
    const moduleRef = await addDoc(collection(db, "onlineCourses", courseId, "modules"), newModule);
    setModules((prevModules) => [...prevModules, { id: moduleRef.id, ...newModule }]);
  };

  const deleteModule = async (moduleId) => {
    if (confirm("¿Estás seguro de que deseas eliminar este módulo?")) {
      await deleteDoc(doc(db, "onlineCourses", courseId, "modules", moduleId));
      setModules(modules.filter((module) => module.id !== moduleId));
    }
  };

  const addClass = async (moduleId) => {
    const newClass = { title: "Nueva Clase" };
    const classRef = await addDoc(collection(db, "onlineCourses", courseId, "modules", moduleId, "classes"), newClass);
    setModules((prevModules) =>
      prevModules.map((module) => {
        if (module.id === moduleId) {
          return {
            ...module,
            classes: [...module.classes, { id: classRef.id, ...newClass }],
          };
        }
        return module;
      })
    );
  };

  const deleteClass = async (moduleId, classId) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta clase?")) {
      await deleteDoc(doc(db, "onlineCourses", courseId, "modules", moduleId, "classes", classId));
      setModules(modules.map((module) => {
        if (module.id === moduleId) {
          return {
            ...module,
            classes: module.classes.filter((c) => c.id !== classId),
          };
        }
        return module;
      }));
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
          const moduleRef = doc(db, "onlineCourses", courseId, "modules", module.id);
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
      prevModules.map((module) => {
        if (module.id === moduleId) {
          const newClasses = [...module.classes];
          const [movedClass] = newClasses.splice(classIndex, 1);
          newClasses.splice(classIndex + direction, 0, movedClass);

          // Update the order in the database
          newClasses.forEach(async (cls, newIndex) => {
            try {
              const classRef = doc(db, "onlineCourses", courseId, "modules", moduleId, "classes", cls.id);
              await updateDoc(classRef, { order: newIndex });
            } catch (error) {
              console.error("Error updating class order:", error);
            }
          });

          return { ...module, classes: newClasses };
        }
        return module;
      })
    );
  };

  // Function to load modules and classes, sorted by order
  const loadModules = async () => {
    const modulesSnapshot = await getDocs(collection(db, "onlineCourses", courseId, "modules"));
    const modules = modulesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Sort modules by order
    modules.sort((a, b) => a.order - b.order);

    // Load and sort classes for each module
    for (let module of modules) {
      const classesSnapshot = await getDocs(collection(db, "onlineCourses", courseId, "modules", module.id, "classes"));
      const classes = classesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Sort classes by order
      classes.sort((a, b) => a.order - b.order);

      module.classes = classes;
    }

    setModules(modules);
  };

  const handleClassClick = (moduleId, classId) => {
    router.push(`/cursos-en-linea/${courseId}/${moduleId}/${classId}`);
  };  


  // Call loadModules when the component mounts
  useEffect(() => {
    loadModules();
  }, []);

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
            <button className={styles.contactButton} onClick={handleContactClick}>Contáctanos</button>
            <div className={styles.iconWrapper} onClick={openModal}>
              <FaRegImage className={styles.editIcon} />
            </div>
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
      <div className={styles.modules}>
        {modules.map((module, moduleIndex) => (
          <div key={module.id} className={styles.module}>
            <div className={styles.moduleHeader}>
              <input
                type="text"
                value={module.title}
                onChange={(e) => handleModuleTitleChange(module.id, e.target.value)}
                className={styles.moduleTitle}
              />
              <div className={styles.moduleActions}>
                <button onClick={() => moveModule(moduleIndex, -1)} disabled={moduleIndex === 0} className={styles.moveButton}>
                  <FaArrowUp />
                </button>
                <button onClick={() => moveModule(moduleIndex, 1)} disabled={moduleIndex === modules.length - 1} className={styles.moveButton}>
                  <FaArrowDown />
                </button>
                <button onClick={() => addClass(module.id)} title="Añadir Clase">
                  <FaPlus />
                </button>
                <button onClick={() => deleteModule(module.id)} title="Eliminar Módulo">
                  <FaTrash />
                </button>
              </div>
            </div>

            <div className={styles.classes}>
              {module.classes.map((cls, classIndex) => (
                <div key={cls.id} className={styles.class} onClick={() => handleClassClick(module.id, cls.id)}>
                  <div className={styles.classCircle} />
                  <span className={styles.classTitle}>{cls.title}</span>
                  <div className={styles.moduleActions}>
                    <button onClick={() => moveClass(module.id, classIndex, -1)} disabled={classIndex === 0} className={styles.moveButton}>
                      <FaArrowUp />
                    </button>
                    <button onClick={() => moveClass(module.id, classIndex, 1)} disabled={classIndex === module.classes.length - 1} className={styles.moveButton}>
                      <FaArrowDown />
                    </button>
                    <button onClick={() => deleteClass(module.id, cls.id)} className={styles.classAction} title="Eliminar Clase">
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        <button onClick={addModule} className={styles.addModuleButton} title="Añadir Módulo">
          <FaPlus />
        </button>
      </div>
    </div>
  );
};

export default CourseDetail;
