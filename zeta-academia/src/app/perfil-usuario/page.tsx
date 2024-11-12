// src/app/perfil-usuario/page.tsx
"use client"; // Indica que este es un Client Component para Next.js

import Image from 'next/image';
import styles from './userProfile.module.css'; // Importa los estilos modulares
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAuth, updateProfile, updateEmail, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation'; // Para manejar la navegación en Next.js
import RequireAuth from '../../components/RequireAuth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function UserProfile() {
    const { currentUser, updateCurrentUser } = useAuth();
    const auth = getAuth();
    const storage = getStorage();
    const router = useRouter(); // Reemplaza useNavigate de react-router-dom
    const [userInfo, setUserInfo] = useState({
        displayName: '',
        email: '',
        photoURL: '',
        number: '',
        edad: '',
    });
    const [loading, setLoading] = useState(true);
    const [imageFile, setImageFile] = useState(null);

    useEffect(() => {
        if (currentUser) {
            setUserInfo({
                displayName: currentUser.displayName || '',
                email: currentUser.email || '',
                photoURL: currentUser.photoURL || '',
                number: currentUser.number || '',
                edad: currentUser.edad || '',
            });
            setLoading(false);
        }
    }, [currentUser]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push('/home'); // Redirige usando el enrutador de Next.js
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

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let photoURL = userInfo.photoURL;

            // Si se ha seleccionado una nueva imagen, subirla a Firebase Storage
            if (imageFile) {
                const storageRef = ref(storage, `profileImages/${currentUser.uid}/${imageFile.name}`);
                await uploadBytes(storageRef, imageFile);
                photoURL = await getDownloadURL(storageRef);
            }

            if (auth.currentUser) {
                await updateProfile(auth.currentUser, {
                    displayName: userInfo.displayName,
                    photoURL: photoURL,
                });
                if (userInfo.email !== auth.currentUser.email) {
                    await updateEmail(auth.currentUser, userInfo.email);
                }
                updateCurrentUser({ ...auth.currentUser, photoURL });
                router.push('/platform'); // Redirige a la plataforma después de la actualización
            }
        } catch (error) {
            console.error('Error updating profile', error);
        }
    };

    if (!currentUser) {
        router.push('/login'); // Redirige al login si no hay usuario autenticado
        return null; // No renderiza nada mientras redirige
    }

    if (loading) {
        return <div>Cargando...</div>;
    }

    return (
        <RequireAuth>
            <section className={styles.userProfileContainer}>
                <form onSubmit={handleSubmit} className={styles.userProfileForm}>
                    <div className={styles.imgContainer}>
                        {userInfo.photoURL && (
                            <Image alt='userProfileImage' src={userInfo.photoURL} width={500} height={500} className={styles.userImg}></Image>
                        )}
                    </div>
                    <div className={styles.userInformationContainer}>
                        <div className={styles.firstContainerInformation}>
                            <input
                                type="text"
                                name="displayName"
                                value={userInfo.displayName}
                                onChange={handleChange}
                                required

                                className={styles.nameInput}
                            />
                            <p className={styles.inputLabels}>Número teléfonico</p>
                            <input
                                type="number"
                                name="number"
                                value={userInfo.number}
                                onChange={handleChange}
                                required
                                className={styles.inputNumber}
                            />
                        </div>
                        <div className={styles.secondContainerInformation}>
                            <div className={styles.countryContainer}>
                                <p className={styles.inputLabels}>País</p>
                                <select name="country" id="countrySelect" className={styles.countrySelect}>
                                    <option value="" selected disabled>Selecciona tu país</option>
                                    <option value="Costa Rica">Costa Rica</option>
                                    <option value="Nicaragua">Nicaragua</option>
                                    <option value="El Salvador">El Salvador</option>
                                    <option value="Colombia">Colombia</option>
                                    <option value="México">México</option>
                                    <option value="Estados Unidos">Estados Unidos</option>
                                </select>
                            </div>
                            <div className={styles.ageContainer}>
                                <p className={styles.inputLabels}>Edad</p>
                                <input min={0} type="number" name='edad' value={userInfo.edad} required onChange={handleChange} className={styles.ageInput} />
                            </div>
                        </div>
                        <button type="submit" className={styles.submitButton}>Guardar Cambios</button>
                    </div>
                    <button type="button" onClick={handleLogout} className={styles.logoutButton}>
                        Cerrar Sesión
                    </button>
                </form>
            </section>
        </RequireAuth>
    );
}

export default UserProfile;

/* 
<div className={styles.userProfileContainer}>
                <h1>Perfil de Usuario</h1>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label>Nombre:</label>
                        <input
                            type="text"
                            name="displayName"
                            value={userInfo.displayName}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Email:</label>
                        <input
                            type="email"
                            name="email"
                            value={userInfo.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.profileImageSection}>
                        {userInfo.photoURL && (
                            <div className={styles.profileImageContainer}>
                                <img src={userInfo.photoURL} alt="Perfil" className={styles.profileImageInput} />
                            </div>
                        )}
                        <div className={styles.profileImageUpload}>
                            <label className={styles.profileLabel}>Imagen de Perfil:</label>
                            <input
                                type="file"
                                onChange={handleFileChange}
                                accept="image/*"
                                className={styles.profileInput}
                            />
                        </div>
                    </div>
                    <button type="submit" className={styles.submitButton}>Guardar Cambios</button>
                    <button type="button" onClick={handleLogout} className={styles.logoutButton}>
                        Cerrar Sesión
                    </button>
                </form>
            </div>
*/