// File: src/app/admin/cursos/page.tsx
"use client";

import { db } from '@/firebase/firebase';
import { collection, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import styles from './page.module.css';
import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import RequireAuth from '@/components/RequireAuth';
import useFetchData from '@/app/hooks/useFetchData';

interface Course {
    id?: string; // El id es opcional para no manejarlo como parte del formulario
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

const AdminCourses: React.FC = () => {
    const { data: fetchedCourses, loading, error } = useFetchData('courses');
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [form, setForm] = useState<Omit<Course, 'id'>>({
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
        setCourses(fetchedCourses);
    }, [fetchedCourses]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;
        setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    };

    const handleEditCourse = (course: Course) => {
        setSelectedCourse(course);
        setForm({ ...course }); // No se incluye el id en el formulario
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        try {
            if (selectedCourse?.id) {
                // Actualizar un curso existente usando el id del curso seleccionado
                const courseRef = doc(db, 'courses', selectedCourse.id);
                await updateDoc(courseRef, form);
                console.log('Curso actualizado:', form);

                // Actualizar el curso en la lista local de cursos
                setCourses(courses.map(c => c.id === selectedCourse.id ? { ...form, id: selectedCourse.id } : c));
            } else {
                // Crear un nuevo curso, no incluye id ya que lo asigna Firebase
                const docRef = await addDoc(collection(db, 'courses'), form);
                console.log('Curso creado:', form);

                // Agregar el nuevo curso a la lista local de cursos
                setCourses([...courses, { ...form, id: docRef.id }]);
            }
            resetForm();
        } catch (error) {
            console.error('Error al guardar el curso:', error);
        }
    };

    const handleDeleteCourse = async (courseId: string) => {
        if (!courseId) {
            console.error('ID del curso no válido');
            return;
        }

        try {
            const courseRef = doc(db, 'courses', courseId);
            await deleteDoc(courseRef);
            console.log('Curso eliminado:', courseId);

            // Remover el curso eliminado de la lista local de cursos
            setCourses(courses.filter(c => c.id !== courseId));
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
                    {/* Campos del formulario */}
                    <label htmlFor="title">Título del curso</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={form.title}
                        onChange={handleInputChange}
                    />

                    <label htmlFor="description">Descripción del curso</label>
                    <textarea
                        id="description"
                        name="description"
                        value={form.description}
                        onChange={handleInputChange}
                    />

                    <label htmlFor="category">Categoría</label>
                    <input
                        type="text"
                        id="category"
                        name="category"
                        value={form.category}
                        onChange={handleInputChange}red
                    />

                    <label htmlFor="price">Precio</label>
                    <input
                        type="number"
                        id="price"
                        name="price"
                        value={form.price}
                        onChange={handleInputChange}
                    />

                    <label htmlFor="duration">Duración</label>
                    <input
                        type="text"
                        id="duration"
                        name="duration"
                        value={form.duration}
                        onChange={handleInputChange}
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
                    </div>

                    <label htmlFor="additionalInfo">Información Adicional</label>
                    <textarea
                        id="additionalInfo"
                        name="additionalInfo"
                        value={form.additionalInfo}
                        onChange={handleInputChange}
                    />

                    <label htmlFor="scheduleDay">Día del Horario</label>
                    <select
                        id="scheduleDay"
                        name="scheduleDay"
                        value={form.scheduleDay}
                        onChange={handleInputChange}
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
                    />

                    <label htmlFor="endTime">Hora de Fin</label>
                    <input
                        type="time"
                        id="endTime"
                        name="endTime"
                        value={form.endTime}
                        onChange={handleInputChange}
                    />

                    <button type="submit">
                        {selectedCourse ? 'Actualizar Curso' : 'Crear Curso'}
                    </button>
                    {selectedCourse && (
                        <button type="button" onClick={resetForm}>
                            Cancelar
                        </button>
                    )}
                </form>

                <section className={styles.coursesSection}>
                    {courses.length > 0 ? (
                        courses.map((course) => (
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

export default AdminCourses;
