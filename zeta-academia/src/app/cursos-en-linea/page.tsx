"use client";
import styles from "./page.module.css";
import React, { useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import useFetchData from "@/app/hooks/useFetchData"; // Usamos tu hook aquí
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { doc } from "firebase/firestore"; // Importamos la función para generar referencias a documentos
import { db } from "@/firebase/firebase"; // Importamos la instancia de Firestore

const LiveCourses: React.FC = () => {
  const { data: courses, loading, error } = useFetchData("onlineCourses"); // Utilizamos el hook para obtener datos de "onlineCourses"
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<number>(100000);
  const [showEnrolledCourses, setShowEnrolledCourses] =
    useState<boolean>(false); // Estado para mostrar cursos matriculados o todos
  const { userId } = useAuth();
  const router = useRouter();

  // Generamos la referencia del documento del usuario actual
  const userDocRef = doc(db, "users", userId); // Ajusta el path según tu estructura de base de datos

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

  // Verifica si el userId está definido
  if (!userId) {
    return <p>Por favor, inicia sesión para ver los cursos matriculados.</p>;
  }

  // Filtrar los cursos matriculados por el estudiante comparando las rutas de referencia
  const enrolledCourses = Array.isArray(courses)
    ? courses.filter(
        (course) =>
          Array.isArray(course.studentsEnrolled) &&
          course.studentsEnrolled.some(
            (studentRef) => studentRef.path === userDocRef.path
          )
      )
    : [];

  // Filtrar los cursos según la búsqueda, categorías, días, etc.
  const filteredCourses = Array.isArray(courses)
    ? courses.filter((course) => {
        const matchesSearch = course.title
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesCategory =
          selectedCategories.length === 0 ||
          selectedCategories.includes(course.category);
        const matchesDay =
          selectedDay === "" || course.scheduleDay === selectedDay;
        const matchesPrice = course.price <= maxPrice;
        return matchesSearch && matchesCategory && matchesDay && matchesPrice;
      })
    : [];

    const handleCourseClick = (courseId: string) => {
    router.push(`/curso-en-linea-acesso?pageId=${courseId}`);
    };


  if (loading) return <p>Cargando cursos...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <RequireAuth>
      <div className={styles.platformContainer}>
        <div className={styles.topActions}>
          {/* Botón para mostrar los cursos en los que el estudiante está matriculado */}
          <button onClick={() => setShowEnrolledCourses(true)}>
            Mis Cursos Matriculados
          </button>

          {/* Botón para mostrar todos los cursos disponibles */}
          <button onClick={() => setShowEnrolledCourses(false)}>
            Todos los Cursos Disponibles
          </button>
        </div>

        <aside className={styles.sidebar}>
          <h3>Filtros</h3>
          <div className={styles.filterCategory}>
            <h4>Categorías</h4>
            {["Python", "Excel", "Java"].map((category) => (
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
              {[
                "Lunes",
                "Martes",
                "Miércoles",
                "Jueves",
                "Viernes",
                "Sábado",
                "Domingo",
              ].map((day) => (
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
            {/* Mostrar los cursos matriculados o todos los cursos según el estado */}
            {showEnrolledCourses ? (
              enrolledCourses.length > 0 ? (
                enrolledCourses.map((course) => (
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
                    <p className={styles.courseDescription}>
                      {course.description}
                    </p>
                    <span className={styles.categoryLabel}>
                      {course.category}
                    </span>
                    <p className={styles.priceLabel}>
                      Precio: {course.price.toLocaleString()} CRC
                    </p>
                    <p className={styles.scheduleLabel}>
                      {course.scheduleDay}, {course.startTime} -{" "}
                      {course.endTime}
                    </p>
                  </div>
                ))
              ) : (
                <p>No estás matriculado en ningún curso.</p>
              )
            ) : filteredCourses.length > 0 ? (
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
                  <p className={styles.courseDescription}>
                    {course.description}
                  </p>
                  <span className={styles.categoryLabel}>
                    {course.category}
                  </span>
                  <p className={styles.priceLabel}>
                    Precio: {course.price.toLocaleString()} CRC
                  </p>
                  <p className={styles.scheduleLabel}>
                    {course.scheduleDay}, {course.startTime} - {course.endTime}
                  </p>
                </div>
              ))
            ) : (
              <p>No se encontraron cursos disponibles.</p>
            )}
          </section>
        </main>
      </div>
    </RequireAuth>
  );
};

export default LiveCourses;
