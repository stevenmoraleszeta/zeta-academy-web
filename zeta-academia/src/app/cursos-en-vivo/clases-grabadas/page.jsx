"use client";

import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "@/firebase/firebase";
import { FaTrash, FaPlus, FaPencilAlt, FaTimes } from "react-icons/fa";
import styles from "./page.module.css";

const ClassesRecorded = ({ courseId }) => {
  const [recordings, setRecordings] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingUrl, setEditingUrl] = useState("");
  const [userRole, setUserRole] = useState(null); // Nuevo estado para el rol

  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    alert("Debes iniciar sesión para realizar esta acción.");
    return null;
  }

  const coursesRef = doc(db, `liveCourses/${courseId}`);

  // Obtener el rol del usuario
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const userRef = doc(db, "users", user.uid); // Obtener el documento del usuario
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          setUserRole(docSnap.data().role); // Suponiendo que el campo "role" existe
        }
      } catch (error) {
        console.error("Error al obtener rol de usuario:", error);
      }
    };

    fetchUserRole();
  }, [user]);

  // Leer las grabaciones al cargar el componente
  useEffect(() => {
    const fetchRecordings = async () => {
      try {
        // Obtener las grabaciones desde la subcolección
        const recordingsRef = collection(coursesRef, "recordings");
        const snapshot = await getDocs(recordingsRef);
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setRecordings(data);
      } catch (error) {
        console.error("Error al obtener grabaciones:", error);
      }
    };

    if (courseId) {
      fetchRecordings();
    }
  }, [courseId]);

  // Agregar una nueva grabación
  const addRecording = async () => {
    if (newTitle && newUrl) {
      try {
        const recordingsRef = collection(coursesRef, "recordings");
        const newRecording = { title: newTitle, url: newUrl };
        const docRef = await addDoc(recordingsRef, newRecording);

        setRecordings((prev) => [...prev, { id: docRef.id, ...newRecording }]);
        setNewTitle("");
        setNewUrl("");
      } catch (error) {
        console.error("Error al agregar grabación:", error);
      }
    }
  };

  // Eliminar una grabación
  const deleteRecording = async (id) => {
    const confirmDelete = window.confirm("¿Estás seguro de eliminar esta grabación?");

    if (confirmDelete) {
      try {
        const recordingsRef = collection(coursesRef, "recordings");
        await deleteDoc(doc(recordingsRef, id));
        setRecordings((prev) => prev.filter((rec) => rec.id !== id));
      } catch (error) {
        console.error("Error al eliminar grabación:", error);
      }
    }
  };

  // Actualizar una grabación
  const updateRecording = async () => {
    if (editingId && editingTitle && editingUrl) {
      try {
        const recordingsRef = collection(coursesRef, "recordings");
        const updatedRecording = { title: editingTitle, url: editingUrl };
        await updateDoc(doc(recordingsRef, editingId), updatedRecording);

        setRecordings((prev) =>
          prev.map((rec) =>
            rec.id === editingId ? { ...rec, ...updatedRecording } : rec
          )
        );
        setEditingId(null);
        setEditingTitle("");
        setEditingUrl("");
      } catch (error) {
        console.error("Error al actualizar grabación:", error);
      }
    }
  };

  return (
    <div className={styles.recordingsBlock}>

    <div className={styles.container}>
      <h3>Grabaciones</h3>

      {/* Lista de grabaciones */}
      <div>
        {recordings.map((rec) => (
          <div key={rec.id} className={styles.recordingItem}>
            {editingId === rec.id ? (
              <div className={styles.editRecording}>
                <input
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  placeholder="Editar título"
                  className={styles.title}
                  />
                <input
                  type="url"
                  value={editingUrl}
                  onChange={(e) => setEditingUrl(e.target.value)}
                  placeholder="Editar URL"
                  className={styles.title}
                  />
                <button onClick={updateRecording} className={styles.saveButton}>
                  <FaPencilAlt /> Guardar
                </button>
                <button onClick={() => setEditingId(null)} className={styles.saveButton}>
                <FaTimes />  Cancelar
                </button>
              </div>
            ) : (
              <>
            
               <div  className={styles.recordingTitle}>

                <span title={rec.title}>
                  <a href={rec.url} target="_blank" rel="noopener noreferrer"  className={styles.link} >
                 { rec.title.length > 30 ? rec.title.substring(0, 30) + "..." : rec.title } {" "} 
                  </a>
                </span>
               
                 
                {userRole === "admin" && ( // Solo los ADMIN pueden editar
                  <div className={styles.actions}>
                    <button className={styles.actionButton}
                      onClick={() => {
                        setEditingId(rec.id);
                        setEditingTitle(rec.title);
                        setEditingUrl(rec.url);
                      }}
                      >
                      <FaPencilAlt />
                    </button>
                    <button onClick={() => deleteRecording(rec.id)} className={styles.actionButton}>
                      <FaTrash />
                    </button>
                     
                  </div>
                  )}
                  </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Formulario para agregar nuevas grabaciones */}
      {userRole === "admin" && ( // Solo los ADMIN pueden agregar grabaciones
        <div className={styles.addRecording}>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Título de la grabación"
            className={styles.title}
            />
          <input
            type="url"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="URL de la grabación"
            className={styles.title}
            />
          <button onClick={addRecording} className={styles.addButton}>
            <FaPlus /> Añadir Grabación
          </button>
        </div>
      )}
    </div>
      </div>
  );
};

export default ClassesRecorded;
