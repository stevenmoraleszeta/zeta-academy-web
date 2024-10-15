"use client"; // Indica que este componente se ejecuta en el cliente

import React, { useContext, useState, useEffect, createContext } from "react";
import { auth, googleProvider, signInWithPopup } from "../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore"; // Importar funciones de Firestore
import { db } from "../firebase/firebase"; // Importar la instancia de Firestore

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
    const [userId, setUserId] = useState(null); // Nuevo estado para almacenar el ID del usuario

    // Manejar el cambio de estado de autenticación
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                checkUserInFirestore(user);
            }
            setCurrentUser(user);
            setUserId(user ? user.uid : null); // Guardar el ID del usuario o ponerlo en null si no hay usuario
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    // Función para iniciar sesión con Google
    const loginWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            setCurrentUser(result.user);
            setUserId(result.user.uid); // Guardar el ID del usuario al iniciar sesión
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
                console.log(userId)
            } else {
                setIsAdmin(false);
            }
        } else {
            await setDoc(userDocRef, {
                displayName: user.displayName,
                email: user.email,
                id: user.uid,
                photoURL: user.photoURL,
                role: "student"
            });
            setIsAdmin(false); // Asumimos que el nuevo usuario no es admin
            console.log("Usuario agregado a Firestore");
        }
    };

    const value = {
        currentUser,
        loginWithGoogle,
        updateCurrentUser: setCurrentUser,
        isAdmin,
        userId, // Añadir el userId en el valor del contexto
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
