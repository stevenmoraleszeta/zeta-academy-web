/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true, // Ignorar errores de ESLint durante la compilación
    },
    images: {
        domains: [
            'lh3.googleusercontent.com', 
            'firebasestorage.googleapis.com', 
            'static.vecteezy.com' // Agregamos este dominio
        ],
    },
};

export default nextConfig;
