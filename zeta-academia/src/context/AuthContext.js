// src/context/AuthContext.js
"use client"; // Indica que este componente se ejecuta en el cliente

import React, { useContext, useState, useEffect, createContext } from "react";
import { auth, googleProvider, signInWithPopup } from "../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore"; // Importar funciones de Firestore
import { db } from "../firebase/firebase"; // Importar la instancia de Firestore
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
    const [missingInfo, setMissingInfo] = useState(false);

    // Manejar el cambio de estado de autenticación
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                checkUserInFirestore(user);
            }
            setCurrentUser(user);
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

            checkUserInFirestore(result.user);
        } catch (error) {
            console.error("Error al iniciar sesión con Google:", error);
        }
    };

    const checkUserInFirestore = async (user) => {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.role === "admin") {
                setIsAdmin(true);
            } else {
                setIsAdmin(false);
            }
            if (!userData.pais || !userData.numeroTel || !userData.edad) {
                setMissingInfo(true);
            } else {
                setMissingInfo(false);
            }
        } else {
            await setDoc(userDocRef, {
                displayName: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                role: "student",
                pais: "",
                numeroTel: "",
                edad: '',
            });
            setIsAdmin(false);
            setMissingInfo(true);
            console.log("Usuario agregado a Firestore");
            router.push("/completeInformation");
        }
    };

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
