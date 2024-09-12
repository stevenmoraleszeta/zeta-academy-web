// src/pages/UserProfile.js
import './UserProfile.css';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAuth, updateProfile, updateEmail, signOut } from 'firebase/auth';
import { Navigate, useNavigate } from 'react-router-dom';
import RequireAuth from '../../components/RequireAuth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function UserProfile() {
    const { currentUser, updateCurrentUser } = useAuth();
    const auth = getAuth();
    const storage = getStorage();
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState({
        displayName: '',
        email: '',
        photoURL: '',
    });
    const [loading, setLoading] = useState(true);
    const [imageFile, setImageFile] = useState(null);

    useEffect(() => {
        if (currentUser) {
            setUserInfo({
                displayName: currentUser.displayName || '',
                email: currentUser.email || '',
                photoURL: currentUser.photoURL || '',
            });
            setLoading(false);
        }
    }, [currentUser]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Failed to log out', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserInfo((prevInfo) => ({
            ...prevInfo,
            [name]: value,
        }));
    };

    // Manejar el cambio de archivo de imagen
    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    // Subir la imagen a Firebase Storage y actualizar el perfil
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let photoURL = userInfo.photoURL;

            // Si se ha seleccionado una nueva imagen, subirla a Firebase Storage
            if (imageFile) {
                const storageRef = ref(storage, `profileImages/${currentUser.uid}/${imageFile.name}`);
                await uploadBytes(storageRef, imageFile);
                photoURL = await getDownloadURL(storageRef); // Obtener la URL de descarga de la imagen subida
            }

            if (auth.currentUser) {
                await updateProfile(auth.currentUser, {
                    displayName: userInfo.displayName,
                    photoURL: photoURL,
                });
                if (userInfo.email !== auth.currentUser.email) {
                    await updateEmail(auth.currentUser, userInfo.email);
                }
                // Actualiza el estado de currentUser en el contexto
                updateCurrentUser({ ...auth.currentUser, photoURL });
                navigate('/platform');
            }
        } catch (error) {
            console.error('Error updating profile', error);
        }
    };

    if (!currentUser) {
        return <Navigate to="/home" />;
    }

    if (loading) {
        return <div>Cargando</div>;
    }

    return (
        <RequireAuth>
            <div className="user-profile-container">
                <h1>Perfil de Usuario</h1>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Nombre:</label>
                        <input
                            type="text"
                            name="displayName"
                            value={userInfo.displayName}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label>Email:</label>
                        <input
                            type="email"
                            name="email"
                            value={userInfo.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="profile-image-section">
                        {userInfo.photoURL && (
                            <div className="profile-image-container">
                                <img src={userInfo.photoURL} alt="Perfil" className="profile-image-input" />
                            </div>
                        )}
                        <div className="profile-image-upload">
                            <label className="profile-label">Imagen de Perfil:</label>
                            <input type="file" onChange={handleFileChange} accept="image/*" className="profile-input" />
                        </div>
                    </div>


                    <button type="submit">Guardar Cambios</button>
                    <button type="button" onClick={handleLogout}>
                        Cerrar Sesión
                    </button>
                </form>

            </div>
        </RequireAuth>
    );
}

export default UserProfile;
