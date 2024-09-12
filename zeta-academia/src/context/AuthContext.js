"use client"; // Esto indica que el componente es un Client Component

import React, { useContext, useState, useEffect, createContext } from "react";
import { auth, googleProvider, signInWithPopup } from "../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";

const AuthContext = createContext();

// Hook personalizado para consumir el contexto
export function useAuth() {
    return useContext(AuthContext);
}

// Componente proveedor de autenticación
export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Manejar el cambio de estado de autenticación
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
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
        } catch (error) {
            console.error("Error al iniciar sesión con Google:", error);
        }
    };

    // Función para actualizar el usuario actual manualmente si es necesario
    const updateCurrentUser = (user) => {
        setCurrentUser(user);
    };

    // Valores que se proporcionan a los componentes que consumen este contexto
    const value = {
        currentUser,
        loginWithGoogle,
        updateCurrentUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
