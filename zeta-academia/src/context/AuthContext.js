// src/context/AuthContext.js
"use client"; // Indica que este componente se ejecuta en el cliente

import React, { useContext, useState, useEffect, createContext } from "react";
import { auth, googleProvider, signInWithPopup } from "../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, addDoc, collection, query, where, getDocs } from "firebase/firestore"; // Importar funciones de Firestore
import { db } from "../firebase/firebase";
import { useRouter } from "next/navigation";


// Crear el contexto de autenticación
const AuthContext = createContext();

// Hook personalizado para consumir el contexto de autenticación
export function useAuth() {
    return useContext(AuthContext);
}

// Componente proveedor de autenticación
export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [missingInfo, setMissingInfo] = useState(null); // Inicializa en null para evitar redirecciones prematuras
    const [isCheckingUser, setIsCheckingUser] = useState(false); // new information checker 
    const router = useRouter();

    // Manejar el cambio de estado de autenticación
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setLoading(true); // Indica que la aplicación está cargando
            if (user) {
                setIsCheckingUser(true);
                await checkUserInFirestore(user);
                setCurrentUser(user);
                setIsCheckingUser(false);
            } else {
                setCurrentUser(null);
                setMissingInfo(null); // Reinicia el estado si no hay usuario
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    // Función para iniciar sesión con Google
    const loginWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            setCurrentUser(result.user);
            console.log("Usuario autenticado:", result.user);

            setIsCheckingUser(true);
            await checkUserInFirestore(result.user);
            setIsCheckingUser(false);
        } catch (error) {
            console.error("Error al iniciar sesión con Google:", error);
        }
    };

    const checkUserInFirestore = async (user) => {
        try {
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();

                setIsAdmin(userData.role === "admin");
                setMissingInfo(
                    !userData.pais?.trim() || !userData.number?.trim() || !userData.edad?.trim() // makes sure all this data is being store in the DB
                );
            } else {


                const estudiantesQuery = query(collection(db, "estudiantes"), where("userId", "==", user.uid));
                const estudiantesSnapshot = await getDocs(estudiantesQuery);

                let estudianteDocRef;
                if (estudiantesSnapshot.empty) {

                    estudianteDocRef = await addDoc(collection(db, "estudiantes"), {
                        userId: user.uid,
                        createdAt: new Date(),
                        nombreCompleto: "",
                        edad: "",
                        number: "",
                        email: "",
                        curso: "",
                        ocupacion: "",
                        estiloAprendizaje: "",
                        Intereses: "",
                        nivelInicial: "",
                        objetivosIndividuales: "",
                    });
                } else {
                    estudianteDocRef = estudiantesSnapshot.docs[0].ref;
                }

                await setDoc(userDocRef, {
                    displayName: user.displayName,
                    email: user.email,
                    photoURL: user.photoURL,
                    role: "student",
                    pais: "",
                    number: "",
                    edad: "",
                    estudianteId: estudianteDocRef.id,
                });
                setIsAdmin(false);
                setMissingInfo(true);
                console.log("Usuario agregado a Firestore");
            }
        } catch (error) {
            console.error("Error verificando usuario en Firestore:", error);
        }
    };

    // if loading and is checking user is different from true, will push the user to the complete information page 
    useEffect(() => {
        if (!loading && !isCheckingUser) {
            if (currentUser && missingInfo) {
                router.push("/completeInfoPage");
            }
        }
    }, [currentUser, missingInfo, loading, isCheckingUser, router]);

    const value = {
        currentUser,
        loginWithGoogle,
        updateCurrentUser: setCurrentUser,
        isAdmin,
        missingInfo,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
