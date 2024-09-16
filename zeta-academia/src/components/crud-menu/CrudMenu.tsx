"use client";

import React, { useState, useEffect } from "react";
import styles from './CrudMenu.module.css';
import useFetchData from "@/app/hooks/useFetchData";
import { collection, addDoc, doc, updateDoc, deleteDoc, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';
import imageCompression from 'browser-image-compression'; // Importar la librería para comprimir imágenes

interface CrudMenuProps {
    collectionName: string;
    displayFields: { label: string; field: string; type?: string; selectType?: string }[];
    editFields: { label: string; field: string; type?: string; selectType?: string }[];
}

const CrudMenu: React.FC<CrudMenuProps> = ({ collectionName, displayFields, editFields }) => {
    const { data: fetchedData, loading, error } = useFetchData(collectionName);
    const [data, setData] = useState<any[]>([]);
    const [selectedItem, setSelectedItem] = useState<any | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [selectOptions, setSelectOptions] = useState<{ [key: string]: any[] }>({}); // Almacena las opciones del select

    useEffect(() => {
        setData(fetchedData);
    }, [fetchedData]);

    // Función para obtener las opciones dinámicas del select desde una colección
    const fetchSelectOptions = async (collectionName: string, field: string) => {
        const colRef = collection(db, collectionName);
        const snapshot = await getDocs(colRef);
        const options = snapshot.docs.map((doc) => ({
            value: doc.data()[field],
            label: doc.data()[field],
        }));

        return options;
    };

    // Cargar las opciones de los campos tipo 'select' dinámicos
    useEffect(() => {
        editFields.forEach(async ({ type, field, selectType }) => {
            if (type === 'select' && selectType === 'dynamic') {
                const options = await fetchSelectOptions(collectionName, field); // Usamos el `field` para obtener los datos
                setSelectOptions((prevOptions) => ({
                    ...prevOptions,
                    [field]: options,
                }));
            }
        });
    }, [editFields, collectionName]);

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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement | HTMLSelectElement;
        setSelectedItem({ ...selectedItem, [name]: type === 'checkbox' ? checked : value });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const options = {
                maxSizeMB: 0.5,
                maxWidthOrHeight: 800,
                useWebWorker: true,
            };

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

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const filteredData = data.filter((item) =>
        displayFields.some(({ field }) =>
            item[field]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    if (loading) return <p>Cargando datos...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className={styles.CRUDContainer}>
            <section className={styles.topBar}>
                <button onClick={handleAddClick}>Agregar</button>
                <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
            </section>
            <section className={styles.itemsSection}>
                {filteredData.length > 0 ? (
                    filteredData.map((item) => (
                        <div
                            key={item.id}
                            className={styles.itemCard}
                            onClick={() => handleItemClick(item)}
                        >
                            {displayFields.map(({ label, field, type }) => (
                                <div key={field} className={styles.fieldRow}>
                                    {type === 'image' ? (
                                        <img src={item[field]} alt={label} className={styles.itemImage} />
                                    ) : field === 'title' || field === 'name' ? (
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
                        {editFields.map(({ label, field, type, selectType }) => (
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
                                ) : type === 'select' && selectType === 'dynamic' ? (
                                    <select
                                        name={field}
                                        value={selectedItem[field] || ""}
                                        onChange={handleInputChange}
                                    >
                                        {selectOptions[field]?.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
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
                        <button onClick={handleSave} disabled={isUploadingImage} className={`${isUploadingImage ? styles.disabledButton : ''}`}>
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
