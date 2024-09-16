// File: src/app/admin/cursos/page.tsx
"use client";

import { db } from '@/firebase/firebase';
import { collection, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import styles from './page.module.css';
import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import RequireAuth from '@/components/RequireAuth';
import useFetchData from '@/app/hooks/useFetchData';

interface LiveCourse {
    id?: string; 
    title: string;
    description: string;
    category: string;
    price: number;
    duration: string;
    paymentInfo: string;
    certificate: boolean;
    additionalInfo: string;
    scheduleDay: string;
    startTime: string;
    endTime: string;
}

const AdminLiveCourses: React.FC = () => {
    const { data: fetchedLiveCourses, loading, error } = useFetchData('liveCourses');
    const [liveCourses, setCourses] = useState<LiveCourse[]>([]);
    const [selectedLiveCourse, setSelectedCourse] = useState<LiveCourse | null>(null);
    const [form, setForm] = useState<Omit<LiveCourse, 'id'>>({
        title: '',
        description: '',
        category: '',
        price: 0,
        duration: '',
        paymentInfo: '',
        certificate: false,
        additionalInfo: '',
        scheduleDay: '',
        startTime: '',
        endTime: '',
    });

    // Actualizar el estado de los cursos cuando se cargan los datos
    useEffect(() => {
        setCourses(fetchedLiveCourses);
    }, [fetchedLiveCourses]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;
        setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    };

    const handleEditCourse = (liveCourse: LiveCourse) => {
        setSelectedCourse(liveCourse);
        setForm({ ...liveCourse }); // No se incluye el id en el formulario
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        try {
            if (selectedLiveCourse?.id) {
                // Actualizar un curso existente usando el id del curso seleccionado
                const courseRef = doc(db, 'liveCourses', selectedLiveCourse.id);
                await updateDoc(courseRef, form);
                console.log('Curso actualizado:', form);

                // Actualizar el curso en la lista local de cursos
                setCourses(liveCourses.map(c => c.id === selectedLiveCourse.id ? { ...form, id: selectedLiveCourse.id } : c));
            } else {
                // Crear un nuevo curso, no incluye id ya que lo asigna Firebase
                const docRef = await addDoc(collection(db, 'liveCourses'), form);
                console.log('Curso creado:', form);

                // Agregar el nuevo curso a la lista local de cursos
                setCourses([...liveCourses, { ...form, id: docRef.id }]);
            }
            resetForm();
        } catch (error) {
            console.error('Error al guardar el curso:', error);
        }
    };

    const handleDeleteCourse = async (liveCourseId: string) => {
        if (!liveCourseId) {
            console.error('ID del curso no válido');
            return;
        }

        try {
            const virtualCourseRef = doc(db, 'liveCourses', liveCourseId);
            await deleteDoc(virtualCourseRef);
            console.log('Curso eliminado:', liveCourseId);

            // Remover el curso eliminado de la lista local de cursos
            setCourses(liveCourses.filter(c => c.id !== liveCourseId));
        } catch (error) {
            console.error('Error al eliminar el curso:', error);
        }
    };

    const resetForm = () => {
        setSelectedCourse(null);
        setForm({
            title: '',
            description: '',
            category: '',
            price: 0,
            duration: '',
            paymentInfo: '',
            certificate: false,
            additionalInfo: '',
            scheduleDay: '',
            startTime: '',
            endTime: '',
        });
    };

    return (
        <RequireAuth>
            <div className={styles.adminCoursesContainer}>
                <h2>Gestión de Cursos</h2>
                {loading && <p>Cargando cursos...</p>}
                {error && <p>Error: {error}</p>}

                <form className={styles.courseForm} onSubmit={handleSubmit}>
                    {/* Orden lógico de los campos */}
                    <label htmlFor="title">Título del curso</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={form.title}
                        onChange={handleInputChange}
                        required
                    />

                    <label htmlFor="description">Descripción del curso</label>
                    <textarea
                        id="description"
                        name="description"
                        value={form.description}
                        onChange={handleInputChange}
                        required
                    />

                    <label htmlFor="category">Categoría</label>
                    <input
                        type="text"
                        id="category"
                        name="category"
                        value={form.category}
                        onChange={handleInputChange}
                        required
                    />

                    <label htmlFor="price">Precio</label>
                    <input
                        type="number"
                        id="price"
                        name="price"
                        value={form.price}
                        onChange={handleInputChange}
                        required
                    />

                    <label htmlFor="duration">Duración</label>
                    <input
                        type="text"
                        id="duration"
                        name="duration"
                        value={form.duration}
                        onChange={handleInputChange}
                    />

                    <label htmlFor="scheduleDay">Día del Horario</label>
                    <select
                        id="scheduleDay"
                        name="scheduleDay"
                        value={form.scheduleDay}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Seleccione un día</option>
                        <option value="Lunes">Lunes</option>
                        <option value="Martes">Martes</option>
                        <option value="Miércoles">Miércoles</option>
                        <option value="Jueves">Jueves</option>
                        <option value="Viernes">Viernes</option>
                        <option value="Sábado">Sábado</option>
                        <option value="Domingo">Domingo</option>
                    </select>

                    <label htmlFor="startTime">Hora de Inicio</label>
                    <input
                        type="time"
                        id="startTime"
                        name="startTime"
                        value={form.startTime}
                        onChange={handleInputChange}
                        required
                    />

                    <label htmlFor="endTime">Hora de Fin</label>
                    <input
                        type="time"
                        id="endTime"
                        name="endTime"
                        value={form.endTime}
                        onChange={handleInputChange}
                        required
                    />

                    <label htmlFor="paymentInfo">Información de Pago</label>
                    <input
                        type="text"
                        id="paymentInfo"
                        name="paymentInfo"
                        value={form.paymentInfo}
                        onChange={handleInputChange}
                    />

                    <label htmlFor="certificate">Certificado</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                            type="checkbox"
                            id="certificate"
                            name="certificate"
                            checked={form.certificate}
                            onChange={handleInputChange}
                        />
                        <span>{form.certificate ? 'Sí' : 'No'}</span>
                    </div>

                    <label htmlFor="additionalInfo">Información Adicional</label>
                    <textarea
                        id="additionalInfo"
                        name="additionalInfo"
                        value={form.additionalInfo}
                        onChange={handleInputChange}
                    />

                    <button type="submit">
                        {selectedLiveCourse ? 'Actualizar Curso' : 'Crear Curso'}
                    </button>
                    {selectedLiveCourse && (
                        <button type="button" onClick={resetForm}>
                            Cancelar
                        </button>
                    )}
                </form>

                <section className={styles.coursesSection}>
                    {liveCourses.length > 0 ? (
                        liveCourses.map((course) => (
                            <div key={course.id} className={styles.courseCard}>
                                <h4>{course.title}</h4>
                                <p>{course.description}</p>
                                <span className={styles.categoryLabel}>{course.category}</span>
                                <p className={styles.priceLabel}>
                                    Precio: {course.price.toLocaleString()} CRC
                                </p>
                                <p className={styles.scheduleLabel}>
                                    {course.scheduleDay}, {course.startTime} - {course.endTime}
                                </p>
                                <div className={styles.courseActions}>
                                    <button onClick={() => handleEditCourse(course)}>Editar</button>
                                    <button onClick={() => handleDeleteCourse(course.id!)}>Eliminar</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No se encontraron cursos.</p>
                    )}
                </section>
            </div>
        </RequireAuth>
    );
};

export default AdminLiveCourses;
