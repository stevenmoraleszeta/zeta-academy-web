// src/components/RequireAuth.js
"use client"; // Esto indica que el componente es un Client Component

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation'; // Usa useRouter de Next.js

const RequireAuth = ({ children }) => {
    const { currentUser } = useAuth();
    const router = useRouter();

    // Verificar si no hay un usuario autenticado y redirigir al login
    if (!currentUser) {
        router.push('/login'); // Redirige a la página de login en Next.js
        return null; // No renderiza nada mientras redirige
    }

    return children;
};

export default RequireAuth;
