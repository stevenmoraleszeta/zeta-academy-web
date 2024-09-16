// File: src/app/platform/page.tsx
"use client";

import styles from './page.module.css';
import React, { useState } from 'react';
import RequireAuth from '@/components/RequireAuth';
import useFetchData from '@/app/hooks/useFetchData';
import { useRouter } from 'next/navigation';

interface Course {
    id: string;
    title: string;
    description: string;
    category: string;
    price: number;
    scheduleDay: string;
    startTime: string;
    endTime: string;
    imageUrl?: string;
}

const LiveCourses: React.FC = () => {
    const { data: courses, loading, error } = useFetchData('virtualCourses'); // Asegúrate de usar el destructuring correcto
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedDay, setSelectedDay] = useState<string>(''); // Cambiado a string para usar con select
    const [maxPrice, setMaxPrice] = useState<number>(100000);
    const router = useRouter();

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleCategoryChange = (category: string) => {
        setSelectedCategories((prev) =>
            prev.includes(category)
                ? prev.filter((cat) => cat !== category)
                : [...prev, category]
        );
    };

    const handleDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedDay(e.target.value);
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMaxPrice(Number(e.target.value));
    };

    // Asegurarse de que courses es un array antes de filtrar
    const filteredCourses = Array.isArray(courses)
        ? courses.filter((course) => {
            const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory =
                selectedCategories.length === 0 || selectedCategories.includes(course.category);
            const matchesDay =
                selectedDay === '' || course.scheduleDay === selectedDay;
            const matchesPrice = course.price <= maxPrice;
            return matchesSearch && matchesCategory && matchesDay && matchesPrice;
        })
        : [];

    const handleCourseClick = (courseId: string) => {
        router.push(`/platform/courses/${courseId}`);
    };

    if (loading) return <p>Cargando cursos...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <RequireAuth>
            <div className={styles.platformContainer}>
                <aside className={styles.sidebar}>
                    <h3>Filtros</h3>
                    <div className={styles.filterCategory}>
                        <h4>Categorías</h4>
                        {['Python', 'Excel', 'Java'].map((category) => (
                            <label key={category}>
                                <input
                                    type="checkbox"
                                    checked={selectedCategories.includes(category)}
                                    onChange={() => handleCategoryChange(category)}
                                />
                                {category}
                            </label>
                        ))}
                    </div>
                    <div className={styles.filterDays}>
                        <h4>Filtrar por Día</h4>
                        <select value={selectedDay} onChange={handleDayChange}>
                            <option value="">Todos los días</option>
                            {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((day) => (
                                <option key={day} value={day}>
                                    {day}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.filterPrice}>
                        <h4>Precio Máximo: {maxPrice.toLocaleString()} CRC</h4>
                        <input
                            type="range"
                            min="0"
                            max="100000"
                            value={maxPrice}
                            onChange={handlePriceChange}
                            className={styles.priceSlider}
                        />
                    </div>
                </aside>

                <main className={styles.mainContent}>
                    <div className={styles.searchBar}>
                        <input
                            type="text"
                            placeholder="Buscar cursos..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>
                    <section className={styles.coursesSection}>
                        {filteredCourses.length > 0 ? (
                            filteredCourses.map((course) => (
                                <div
                                    key={course.id}
                                    className={styles.courseCard}
                                    onClick={() => handleCourseClick(course.id)}
                                >
                                    {course.imageUrl && (
                                        <img
                                            src={course.imageUrl}
                                            alt={course.title}
                                            className={styles.courseImage}
                                        />
                                    )}
                                    <h4 className={styles.courseTitle}>{course.title}</h4>
                                    <p className={styles.courseDescription}>{course.description}</p>
                                    <span className={styles.categoryLabel}>{course.category}</span>
                                    <p className={styles.priceLabel}>
                                        Precio: {course.price.toLocaleString()} CRC
                                    </p>
                                    <p className={styles.scheduleLabel}>
                                        {course.scheduleDay}, {course.startTime} - {course.endTime}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p>No se encontraron cursos.</p>
                        )}
                    </section>
                </main>
            </div>
        </RequireAuth>
    );
};

export default LiveCourses;
