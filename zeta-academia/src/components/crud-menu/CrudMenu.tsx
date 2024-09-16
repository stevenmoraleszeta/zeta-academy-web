"use client";

import React, { useState, useEffect } from "react";
import styles from './CrudMenu.module.css';
import useFetchData from "@/app/hooks/useFetchData";
import { collection, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';
import imageCompression from 'browser-image-compression'; // Importar la librería para comprimir imágenes

interface CrudMenuProps {
    collectionName: string;
    displayFields: { label: string; field: string; type?: string }[];
    editFields: { label: string; field: string; type?: string }[];
}

const CrudMenu: React.FC<CrudMenuProps> = ({ collectionName, displayFields, editFields }) => {
    const { data: fetchedData, loading, error } = useFetchData(collectionName);
    const [data, setData] = useState<any[]>([]);
    const [selectedItem, setSelectedItem] = useState<any | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);

    useEffect(() => {
        setData(fetchedData);
    }, [fetchedData]);

    const handleItemClick = (item: any) => {
        setSelectedItem(item);
        setImagePreview(item.imageUrl || null);
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const handleAddClick = () => {
        const emptyItem = editFields.reduce((acc, { field }) => ({ ...acc, [field]: '' }), {});
        setSelectedItem(emptyItem);
        setImagePreview(null);
        setIsEditMode(false);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setSelectedItem(null);
        setImagePreview(null);
        setIsModalOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;
        setSelectedItem({ ...selectedItem, [name]: type === 'checkbox' ? checked : value });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            // Configura las opciones de compresión
            const options = {
                maxSizeMB: 0.5, // Tamaño máximo de 0.5MB
                maxWidthOrHeight: 800, // Dimensión máxima de 800px
                useWebWorker: true,
            };

            // Comprime la imagen
            const compressedFile = await imageCompression(file, options);

            setIsUploadingImage(true);
            const storage = getStorage();
            const uniqueFileName = `${uuidv4()}-${compressedFile.name}`;
            const storageRef = ref(storage, `images/${uniqueFileName}`);
            const uploadTask = uploadBytesResumable(storageRef, compressedFile);

            uploadTask.on(
                'state_changed',
                null,
                (error) => {
                    console.error("Error al subir la imagen:", error);
                    alert("Error al subir la imagen. Verifica los permisos de Firebase Storage.");
                    setIsUploadingImage(false);
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        setSelectedItem((prevItem) => ({
                            ...prevItem,
                            imageUrl: downloadURL,
                        }));
                        setImagePreview(downloadURL);
                        setIsUploadingImage(false);
                    });
                }
            );
        } catch (error) {
            console.error("Error al comprimir la imagen:", error);
            alert("Error al comprimir la imagen.");
        }
    };

    const handleSave = async () => {
        if (!selectedItem) return;
        if (isUploadingImage) {
            alert("Por favor espera a que la imagen termine de cargar.");
            return;
        }

        try {
            if (isEditMode && selectedItem.id) {
                const itemRef = doc(db, collectionName, selectedItem.id);
                await updateDoc(itemRef, selectedItem);
                setData((prevData) =>
                    prevData.map((item) => (item.id === selectedItem.id ? selectedItem : item))
                );
                alert("Elemento actualizado con éxito");
            } else {
                const docRef = await addDoc(collection(db, collectionName), selectedItem);
                setData((prevData) => [...prevData, { ...selectedItem, id: docRef.id }]);
                alert("Elemento agregado con éxito");
            }
            handleModalClose();
        } catch (error) {
            console.error("Error al guardar el elemento:", error);
        }
    };

    const handleDelete = async () => {
        if (!selectedItem || !selectedItem.id) return;

        try {
            const itemRef = doc(db, collectionName, selectedItem.id);
            await deleteDoc(itemRef);
            setData((prevData) => prevData.filter((item) => item.id !== selectedItem.id));
            alert("Elemento eliminado con éxito");
            handleModalClose();
        } catch (error) {
            console.error("Error al eliminar el elemento:", error);
        }
    };

    if (loading) return <p>Cargando datos...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className={styles.CRUDContainer}>
            <section className={styles.topBar}>
                <button onClick={handleAddClick}>Agregar</button>
                <input type="text" placeholder="Buscar..." />
            </section>
            <section className={styles.itemsSection}>
                {data.length > 0 ? (
                    data.map((item) => (
                        <div
                            key={item.id}
                            className={styles.itemCard}
                            onClick={() => handleItemClick(item)}
                        >
                            {displayFields.map(({ label, field, type }) => (
                                <div key={field} className={styles.fieldRow}>
                                    {type === 'image' ? (
                                        <img src={item[field]} alt={label} className={styles.itemImage} />
                                    ) : field === 'title' ? (
                                        <strong className={styles.title}>{item[field]}</strong>
                                    ) : (
                                        <span>{item[field]}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))
                ) : (
                    <p>No se encontraron elementos.</p>
                )}
            </section>

            {isModalOpen && selectedItem && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h2>{isEditMode ? "Editar Elemento" : "Agregar Nuevo Elemento"}</h2>
                        {editFields.map(({ label, field, type }) => (
                            <div key={field} className={styles.fieldRow}>
                                <label>{label}:</label>
                                {type === 'image' ? (
                                    <>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                        />
                                        {imagePreview && (
                                            <img
                                                src={imagePreview}
                                                alt="Previsualización"
                                                className={styles.imagePreview}
                                            />
                                        )}
                                    </>
                                ) : (
                                    <input
                                        type={type === 'number' ? 'number' : type === 'checkbox' ? 'checkbox' : 'text'}
                                        name={field}
                                        value={type === 'checkbox' ? undefined : selectedItem[field] || ""}
                                        checked={type === 'checkbox' ? selectedItem[field] : undefined}
                                        onChange={handleInputChange}
                                    />
                                )}
                            </div>
                        ))}
                        <button
                            onClick={handleSave}
                            disabled={isUploadingImage}
                            className={`${isUploadingImage ? styles.disabledButton : ''}`}
                        >
                            {isEditMode ? "Actualizar" : "Guardar"}
                        </button>

                        {isEditMode && <button onClick={handleDelete} className={styles.deleteButton}>Eliminar</button>}
                        <button onClick={handleModalClose} className={styles.closeButton}>Cerrar</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CrudMenu;
