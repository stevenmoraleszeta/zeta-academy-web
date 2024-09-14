// File: src/app/admin/page.tsx
"use client"; // Indica que este componente se ejecuta en el cliente

import { db } from '@/firebase/firebase';
import { collection, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import styles from './page.module.css';
import React, { useState, ChangeEvent, FormEvent } from 'react';
import RequireAuth from '@/components/RequireAuth';
import useFetchData from '@/app/hooks/useFetchData';

interface Course {
    id: string;
    title: string;
    description: string;
    category: string;
    price: number;
    duration: string;
    paymentInfo: string;
    learningResources: string;
    certificate: boolean;
    additionalInfo: string;
    scheduleDay: string;
    scheduleTime: string;
}

const AdminCourses: React.FC = () => {
    const courses: Course[] = useFetchData('courses'); // Consulta a la colección 'courses'
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [form, setForm] = useState<Course>({
        id: '',
        title: '',
        description: '',
        category: '',
        price: 0,
        duration: '',
        paymentInfo: '',
        learningResources: '',
        certificate: false,
        additionalInfo: '',
        scheduleDay: '',
        scheduleTime: '',
    });

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;
        setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    };

    const handleEditCourse = (course: Course) => {
        setSelectedCourse(course);
        setForm(course);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        try {
            if (selectedCourse) {
                // Actualizar curso existente
                const courseRef = doc(db, 'courses', selectedCourse.id);
                await updateDoc(courseRef, form);
                console.log('Curso actualizado:', form);
            } else {
                // Crear un nuevo curso
                await addDoc(collection(db, 'courses'), form);
                console.log('Curso creado:', form);
            }
            resetForm();
        } catch (error) {
            console.error('Error al guardar el curso:', error);
        }
    };

    const handleDeleteCourse = async (courseId: string) => {
        try {
            const courseRef = doc(db, 'courses', courseId);
            await deleteDoc(courseRef);
            console.log('Curso eliminado:', courseId);
        } catch (error) {
            console.error('Error al eliminar el curso:', error);
        }
    };

    const resetForm = () => {
        setSelectedCourse(null);
        setForm({
            id: '',
            title: '',
            description: '',
            category: '',
            price: 0,
            duration: '',
            paymentInfo: '',
            learningResources: '',
            certificate: false,
            additionalInfo: '',
            scheduleDay: '',
            scheduleTime: '',
        });
    };

    return (
        <RequireAuth>
            <div className={styles.adminCoursesContainer}>
                <h2>Gestión de Cursos</h2>

                {/* Formulario de Creación/Edición */}
                <form className={styles.courseForm} onSubmit={handleSubmit}>
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

                    <label htmlFor="paymentInfo">Información de Pago</label>
                    <input
                        type="text"
                        id="paymentInfo"
                        name="paymentInfo"
                        value={form.paymentInfo}
                        onChange={handleInputChange}
                    />

                    <label htmlFor="learningResources">Recursos de Aprendizaje</label>
                    <input
                        type="text"
                        id="learningResources"
                        name="learningResources"
                        value={form.learningResources}
                        onChange={handleInputChange}
                    />

                    <label htmlFor="certificate">Certificado</label>
                    <input
                        type="checkbox"
                        id="certificate"
                        name="certificate"
                        checked={form.certificate}
                        onChange={handleInputChange}
                    />
                    <span>{form.certificate ? 'Sí' : 'No'}</span>

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

                    <label htmlFor="scheduleTime">Hora del Horario</label>
                    <select
                        id="scheduleTime"
                        name="scheduleTime"
                        value={form.scheduleTime}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Seleccione una hora</option>
                        {[...Array(24).keys()].map((hour) => (
                            <option key={hour} value={`${hour.toString().padStart(2, '0')}:00`}>
                                {`${hour.toString().padStart(2, '0')}:00`}
                            </option>
                        ))}
                    </select>

                    <button type="submit">
                        {selectedCourse ? 'Actualizar Curso' : 'Crear Curso'}
                    </button>
                    {selectedCourse && (
                        <button type="button" onClick={resetForm}>
                            Cancelar
                        </button>
                    )}
                </form>

                {/* Listado de Cursos */}
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
                                <div className={styles.courseActions}>
                                    <button onClick={() => handleEditCourse(course)}>Editar</button>
                                    <button onClick={() => handleDeleteCourse(course.id)}>Eliminar</button>
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
