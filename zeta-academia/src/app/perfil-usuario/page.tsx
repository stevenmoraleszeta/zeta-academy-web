// src/app/perfil-usuario/page.tsx
"use client"; // Indica que este es un Client Component para Next.js

import Image from 'next/image';
import styles from './userProfile.module.css';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAuth, updateProfile, updateEmail, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import RequireAuth from '../../components/RequireAuth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

function UserProfile() {
    const { currentUser, updateCurrentUser } = useAuth();
    const auth = getAuth();
    const storage = getStorage();
    const db = getFirestore();
    const router = useRouter();

    const [userInfo, setUserInfo] = useState({
        displayName: '',
        email: '',
        photoURL: '',
        number: '',
        edad: '',
        pais: '',
    });
    const [loading, setLoading] = useState(true);
    const [imageFile, setImageFile] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            if (currentUser) {
                const userDocRef = doc(db, 'users', currentUser.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    setUserInfo({
                        displayName: currentUser.displayName || '',
                        email: currentUser.email || '',
                        photoURL: currentUser.photoURL || '',
                        number: userDocSnap.data().number || '',
                        edad: userDocSnap.data().edad || '',
                        pais: userDocSnap.data().pais || '',
                    });
                } else {
                    console.log('No se encontró el documento del usuario en Firestore');
                }
                setLoading(false);
            }
        };

        fetchUserData();
    }, [currentUser]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push('/home');
        } catch (error) {
            console.error('Failed to log out', error);
        }
    };

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setUserInfo((prevInfo) => ({
            ...prevInfo,
            [name]: value,
        }));
    };

    const handleFileChange = (e: any) => {
        if (e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            let photoURL = userInfo.photoURL;

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
                const userDocRef = doc(db, 'users', currentUser.uid);
                await setDoc(userDocRef, {
                    number: userInfo.number,
                    edad: userInfo.edad,
                    pais: userInfo.pais,
                }, { merge: true });

                updateCurrentUser({ ...auth.currentUser, photoURL });
                router.push('/platform');
            }
        } catch (error) {
            console.error('Error updating profile', error);
        }
    };

    if (!currentUser) {
        router.push('/login');
        return null;
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
                            <Image alt='userProfileImage' src={userInfo.photoURL} width={500} height={500} className={styles.userImg} />
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
                            <p className={styles.inputLabels}>Número telefónico</p>
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
                                <select
                                    name="pais"
                                    id="countrySelect"
                                    className={styles.countrySelect}
                                    value={userInfo.pais}
                                    onChange={handleChange}
                                >
                                    <option value="">Selecciona tu país</option>
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
                                <input
                                    min={0}
                                    type="number"
                                    name="edad"
                                    value={userInfo.edad}
                                    required
                                    onChange={handleChange}
                                    className={styles.ageInput}
                                />
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
