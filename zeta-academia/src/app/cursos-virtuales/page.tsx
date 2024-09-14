// File: src/app/platform/page.tsx
"use client"; // Indica que este es un Client Component para Next.js

import styles from './page.module.css';
import React, { useState } from 'react';
import RequireAuth from '@/components/RequireAuth'; // Ajusta la ruta según tu estructura
import useFetchData from '@/app/hooks/useFetchData'; // Ajusta la ruta según tu estructura

interface Course {
    id: string;
    title: string;
    description: string;
    category: string;
    price: number;
}

function VirtualCourses() {
    const courses: Course[] = useFetchData('courses'); // Consulta a la colección 'courses'
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [maxPrice, setMaxPrice] = useState<number>(100000); // Precio máximo seleccionado

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

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMaxPrice(Number(e.target.value));
    };

    const filteredCourses = courses.filter((course) => {
        const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory =
            selectedCategories.length === 0 || selectedCategories.includes(course.category);
        const matchesPrice = course.price <= maxPrice;
        return matchesSearch && matchesCategory && matchesPrice;
    });

    //TODO debe de mostrarse más información y una imagen en la ficha del curso, además de ser más grande. 
    //TODO Deben poderse filtrar por dificultad
    //TODO Al tocarse un curso debe abrirse una página con más información del curso
    //TODO Debe de añadirse un botón de contactar.
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
                                <div key={course.id} className={styles.courseCard}>
                                    <h4>{course.title}</h4>
                                    <p>{course.description}</p>
                                    <span className={styles.categoryLabel}>{course.category}</span>
                                    <p className={styles.priceLabel}>Precio: {course.price.toLocaleString()} CRC</p>
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
}

export default VirtualCourses;
