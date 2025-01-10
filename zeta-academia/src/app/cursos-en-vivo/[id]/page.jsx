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
} from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { FaRegImage, FaPencilAlt, FaArrowUp, FaArrowDown, FaTrash, FaPlus, FaCheck, FaLock, FaLockOpen } from "react-icons/fa";
import styles from "./page.module.css";
import { useAuth } from "@/context/AuthContext";

const CourseDetail = ({ params }) => {
  const router = useRouter();
  const courseId = params.id;

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

  const [modules, setModules] = useState([]);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState(null);

  const fetchCourse = async () => {
    try {
      const docRef = doc(db, "liveCourses", courseId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const fetchedData = docSnap.data();
        setCourse({
          ...course,
          ...fetchedData,
          features: fetchedData.features && fetchedData.features.length > 0
            ? fetchedData.features
            : course.features,
        });
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
      console.log("Fetching modules for course:", courseId);

      const modulesRef = collection(db, "liveCourses", courseId, "modules");
      const modulesSnapshot = await getDocs(modulesRef);

      console.log("Found modules:", modulesSnapshot.size);

      const fetchedModules = [];

      for (const moduleDoc of modulesSnapshot.docs) {
        const moduleData = moduleDoc.data();
        console.log("Module data:", moduleData);

        // Fetch classes
        const classesRef = collection(db, "liveCourses", courseId, "modules", moduleDoc.id, "classes");
        const classesSnapshot = await getDocs(classesRef);
        const classes = classesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          type: "class" // Añadir tipo para diferenciar
        }));

        // Fetch projects
        const projectsRef = collection(db, "liveCourses", courseId, "modules", moduleDoc.id, "projects");
        const projectsSnapshot = await getDocs(projectsRef);
        const projects = projectsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          type: "project" // Añadir tipo para diferenciar
        }));

        fetchedModules.push({
          id: moduleDoc.id,
          ...moduleData,
          classes: classes.sort((a, b) => (a.order || 0) - (b.order || 0)),
          projects: projects.sort((a, b) => (a.order || 0) - (b.order || 0))
        });
      }

      // Sort modules by order
      fetchedModules.sort((a, b) => (a.order || 0) - (b.order || 0));

      console.log("Final modules:", fetchedModules);

      setModules(fetchedModules);
    } catch (error) {
      console.error("Error fetching modules:", error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) {
        console.log("Usuario no autenticado");
        router.push('/login');
        return;
      }

      try {
        await fetchCourse();
        await fetchModules();
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
            <button className={styles.enrollButton} onClick={handleEnrollClick}>
              Inscríbete
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
                      setModules((prevModules) =>
                        prevModules.map((mod, index) =>
                          index === moduleIndex
                            ? { ...mod, title: e.target.value }
                            : mod
                        )
                      )
                    }
                    className={styles.moduleTitle}
                  />
                ) : (
                  <span className={styles.moduleTitle}>{module.title}</span>
                )}
                {isAdmin && (
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
                      onClick={() => deleteModule(module.id)}
                      className={styles.deleteButton}
                    >
                      <FaTrash />
                    </button>
                  </div>
                )}
              </div>
              <div className={styles.moduleContent}>
                {[...(module.classes || []), ...(module.projects || [])]
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((item, index) => (
                    <div
                      key={item.id}
                      className={styles.classItem}
                      onClick={() => handleItemClick(module.id, item.id, item.type)}
                    >
                      <div className={styles.classInfo}>
                        <span className={styles.classTitle}>
                          {item.title || "Sin título"}
                          <span className={`${styles.itemType} ${item.type === "project" ? styles.projectType : ""}`}>
                            {item.type === "class" ? "📚 Clase" : "🛠️ Proyecto"}
                          </span>
                        </span>
                      </div>
                      {isAdmin && (
                        <div className={styles.classActions}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const collection = item.type === "class" ? "classes" : "projects";
                              moveItem(module.id, index, -1, collection);
                            }}
                            disabled={index === 0}
                            className={styles.moveButton}
                            title="Mover arriba"
                          >
                            <FaArrowUp />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const collection = item.type === "class" ? "classes" : "projects";
                              moveItem(module.id, index, 1, collection);
                            }}
                            disabled={index === module[item.type === "class" ? "classes" : "projects"].length - 1}
                            className={styles.moveButton}
                            title="Mover abajo"
                          >
                            <FaArrowDown />
                          </button>
                          {item.type === "class" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleClassRestriction(module.id, item.id, item.restricted);
                              }}
                              className={styles.classAction}
                              title={item.restricted ? "Desbloquear Clase" : "Bloquear Clase"}
                            >
                              {item.restricted ? <FaLock /> : <FaLockOpen />}
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const collection = item.type === "class" ? "classes" : "projects";
                              deleteItem(module.id, item.id, collection);
                            }}
                            className={styles.classAction}
                            title={`Eliminar ${item.type === "class" ? "Clase" : "Proyecto"}`}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                {isAdmin && (
                  <button
                    onClick={() => handleAddItem(module.id)}
                    className={styles.addClassButton}
                  >
                    <FaPlus /> Añadir Contenido
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p>No hay módulos disponibles.</p>
        )}
        {isAdmin && (
          <button className={styles.addModuleButton} onClick={addModule}>
            <FaPlus /> Añadir Módulo
          </button>
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
    </div>
  );
};

export default CourseDetail;

