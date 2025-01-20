"use client";

import React, { useState, useEffect } from "react";
import styles from './CrudMenu.module.css';
import useFetchData from "@/app/hooks/useFetchData";
import { collection, addDoc, doc, updateDoc, deleteDoc, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';
import imageCompression from 'browser-image-compression';
import { FaTrash, FaClone, FaEdit } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

//TODO Los actions icons, como el fa-trash, fa-clone, etc. Deben de ser componentes.
interface CrudMenuProps {
    collectionName: string;
    displayFields: { label: string; field: string; type?: string; selectType?: string; computeField?: (item: any) => string; }[];
    editFields: { label: string; field: string; type?: string; selectType?: string; options?: { value: string; label: string }[] }[];
    itemActions?: { label: string; handler: (item: any) => void }[];
    pageTitle: string;
    filterFunction?: (item: any) => boolean;
    fileUploadHandler?: (file: File) => Promise<string>;
    onSave?: (item: any, isEditMode: boolean) => Promise<void>;
    onDelete?: (item: any) => Promise<void>;
    determineState?: (item: any) => string;
    isCheckStatus?: () => void;
    getStateColor?: (state: string) => string;
    data?: any[];
    downloadBtn?: boolean;
}

const CrudMenu: React.FC<CrudMenuProps> = ({
    collectionName,
    displayFields,
    editFields,
    pageTitle,
    itemActions = [],
    filterFunction,
    fileUploadHandler,
    onSave,
    onDelete,
    determineState,
    getStateColor,
    data: propData,
    downloadBtn,
    isCheckStatus,
}) => {
    const { data: fetchedData, loading, error } = useFetchData(collectionName);
    const [data, setData] = useState<any[]>([]);
    const [filteredData, setFilteredData] = useState<any[]>([]);
    const [selectedItem, setSelectedItem] = useState<any | null>(null);
    const [selectOptions, setSelectOptions] = useState<{ [key: string]: any[] }>({});
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<any | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (propData) {
            setData(propData);
            setFilteredData(propData);
        } else if (fetchedData) {
            setData(fetchedData);
            setFilteredData(fetchedData);
        }
    }, [propData, fetchedData]);

    const handleGoToFicha = (item: any) => {
        router.push(`/admin/students/${item.id}`);
    };

    const initializeSelectOptions = () => {
        const options: { [key: string]: any[] } = {};
        editFields.forEach(field => {
            if (field.type === 'select' && field.options) {
                options[field.field] = field.options;
            }
        });
        setSelectOptions(options);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);

        if (term.trim() === '') {
            // Restaurar el estado original de los datos cuando el término está vacío
            setFilteredData(data);
            return;
        }

        const filtered = data.filter(item =>
            displayFields.some(({ field }) => {
                const value = item[field]?.toString().toLowerCase() || '';
                return value.includes(term);
            })
        );

        setFilteredData(filtered);
    };

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
        const { name, value, type, checked } = e.target as HTMLInputElement;
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
                        setSelectedItem((prevItem: any) => ({
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

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        if (!e.target.files || !fileUploadHandler) return;
        const file = e.target.files[0];
        setIsUploadingImage(true);
        try {
            const url = await fileUploadHandler(file);
            setSelectedItem((prev: Record<string, any>) => ({ ...prev, [field]: url }));
        } catch (err) {
            console.error('File upload failed', err);
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleSave = async () => {
        if (!selectedItem) return;
        if (isUploadingImage) {
            alert("Por favor espera a que la imagen termine de cargar.");
            return;
        }

        try {
            if (onSave) {
                await onSave(selectedItem, isEditMode);
            } else {
                if (isEditMode && selectedItem.id) {
                    const itemRef = doc(db, collectionName, selectedItem.id);
                    await updateDoc(itemRef, selectedItem);
                    setData((prevData) =>
                        prevData.map((item) => (item.id === selectedItem.id ? selectedItem : item))
                    );
                    setFilteredData((prevData) =>
                        prevData.map((item) => (item.id === selectedItem.id ? selectedItem : item))
                    );
                } else {
                    // Crear el documento en la colección de usuarios
                    const docRef = await addDoc(collection(db, collectionName), selectedItem);
                    const newItem = { ...selectedItem, id: docRef.id };

                    // Crear el documento en la colección de estudiantes
                    const estudianteDocRef = await addDoc(collection(db, "estudiantes"), {
                        userId: docRef.id,
                        createdAt: new Date(),
                        nombreCompleto: selectedItem.displayName || "",
                        edad: selectedItem.edad || "",
                        number: selectedItem.number || "",
                        email: selectedItem.email || "",
                        curso: "",
                        ocupacion: "",
                        estiloAprendizaje: "",
                        Intereses: "",
                        nivelInicial: "",
                        objetivosIndividuales: "",
                    });

                    // Actualizar el documento del usuario con el ID del estudiante
                    await updateDoc(docRef, {
                        estudianteId: estudianteDocRef.id,
                    });
                    setData((prevData) => [...prevData, newItem]);
                    setFilteredData((prevData) => [...prevData, newItem]);
                }
            }
            handleModalClose();
        } catch (error) {
            console.error("Error al guardar el elemento:", error);
        }
    };

    const handleDeleteItem = async (item: any) => {
        const confirmDelete = window.confirm("¿Estás seguro de que quieres eliminar este elemento?");
        if (!confirmDelete) return;

        try {
            if (onDelete) {
                await onDelete(item);
            } else {
                const itemRef = doc(db, collectionName, item.id);
                await deleteDoc(itemRef);
                setData((prevData) => prevData.filter((i) => i.id !== item.id));
                setFilteredData((prevData) => prevData.filter((i) => i.id !== item.id));
            }
            alert("Elemento eliminado con éxito");
        } catch (error) {
            console.error("Error al eliminar el elemento:", error);
            alert("Error al eliminar el elemento");
        }
    };

    const confirmDelete = async () => {
        if (!itemToDelete || !itemToDelete.id) return;

        try {
            const itemRef = doc(db, collectionName, itemToDelete.id);
            await deleteDoc(itemRef);
            setData((prevData) => prevData.filter((i) => i.id !== itemToDelete.id));
            setFilteredData((prevData) => prevData.filter((i) => i.id !== itemToDelete.id));
            alert("Elemento eliminado con éxito");
        } catch (error) {
            console.error("Error al eliminar el elemento:", error);
            alert("Error al eliminar el elemento");
        } finally {
            setIsConfirmModalOpen(false);
            setItemToDelete(null);
        }
    };

    const handleFileDownload = (fileUrl: string, fileName: string) => {
        const link = document.createElement('a');
        link.href = fileUrl;
        link.target = '_blank';
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <p>Cargando datos...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className={styles.CRUDContainer}>
            <h1 className={styles.pageTitle}>{pageTitle}</h1>
            <section className={styles.topBar}>
                <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
                <button onClick={handleAddClick}>Agregar</button>
                {isCheckStatus && (
                    <button onClick={isCheckStatus}>Revisar estados</button>
                )}
            </section>
            <section className={styles.itemsSection}>
                {filteredData.length > 0 ? (
                    filteredData.map((item) => {
                        const state = determineState ? determineState(item) : '';
                        const stateColor = getStateColor ? getStateColor(state) : 'gray';
                        return (
                            <div key={item.id} className={styles.itemCard}>
                                <div onClick={() => handleItemClick(item)} className={styles.cardContent}>
                                    {displayFields.map(({ label, field, type }) => (
                                        <div key={field} className={styles.fieldRow}>
                                            {type === 'image' ? (
                                                <img src={item[field]} alt={label} className={styles.itemImage} />
                                            ) : typeof item[field] === 'object' ? (
                                                <span>{item[field]?.label || item[field]?.value || JSON.stringify(item[field])}</span>
                                            ) : (
                                                <span>{item[field]}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className={styles.iconButtons}>
                                    <button
                                        className={styles.iconButton}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteItem(item);
                                        }}
                                        title="Eliminar"
                                    >
                                        <FaTrash size={20} />
                                    </button>
                                    {collectionName === 'estudiantes' && (
                                        <button onClick={() => handleGoToFicha(item)} className={styles.iconButton}><FaEdit size={20} /></button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p>No se encontraron elementos.</p>
                )}
            </section>

            {isModalOpen && selectedItem && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h2>{isEditMode ? "Editar Elemento" : "Agregar Nuevo Elemento"}</h2>
                        {editFields.map(({ label, field, type, selectType, options }) => (
                            <div key={field} className={styles.fieldRow}>
                                <label>{label}</label>
                                {type === 'file' ? (
                                    <input
                                        type="file"
                                        onChange={(e) => handleFileUpload(e, field)}
                                    />
                                ) : type === 'image' ? (
                                    <>
                                        <input
                                            type="file"
                                            name="file"
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
                                ) : type === 'select' && selectType === 'combobox' ? (
                                    <select
                                        name={field}
                                        value={selectedItem[field] || ""}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Seleccione una opción</option>
                                        {selectOptions[field]?.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type={type === 'number' ? 'number' : type === 'date' ? 'date' : 'text'}
                                        name={field}
                                        value={selectedItem[field] || ""}
                                        onChange={handleInputChange}
                                    />
                                )}
                            </div>
                        ))}
                        {downloadBtn && selectedItem?.studentFileUrl && (
                            <>
                                <label htmlFor="">Proyecto de estudiante: </label>
                                <a href={selectedItem?.studentFileUrl} download='proyecto' target="_blank" rel="noopener noreferrer">Descargar archivo</a>
                            </>
                        )}
                        <div className={styles.modalButtons}>
                            <button
                                onClick={handleSave}
                                disabled={isUploadingImage}
                                className={`${isUploadingImage ? styles.disabledButton : ''}`}
                            >
                                {isEditMode ? "Actualizar" : "Guardar"}
                            </button>
                            <button onClick={handleModalClose} className={styles.closeButton}>Cerrar</button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={confirmDelete}
                message="¿Estás seguro de que quieres eliminar este elemento?"
            />
        </div>
    );
};

const ConfirmationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    message: string;
}> = ({ isOpen, onClose, onConfirm, message }) => {
    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <p>{message}</p>
                <div className={styles.modalButtons}>
                    <button onClick={onConfirm} className={styles.confirmButton}>Confirmar</button>
                    <button onClick={onClose} className={styles.cancelButton}>Cancelar</button>
                </div>
            </div>
        </div>
    );
};

export default CrudMenu;
