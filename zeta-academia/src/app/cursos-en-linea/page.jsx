// File: src/app/cursos-en-linea/page.jsx
"use client";

import React, { useState, useEffect } from "react";
import useFetchData from "@/app/hooks/useFetchData";
import { useRouter } from "next/navigation";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import styles from "./page.module.css";

const OnlineCourses = () => {
  const router = useRouter();
  const { data: courses, loading, error } = useFetchData("onlineCourses");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [priceRange, setPriceRange] = useState(maxPrice);
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    if (courses && courses.length > 0) {
      const prices = courses.map((course) => course.discountedPrice);
      const minCoursePrice = Math.floor(Math.min(...prices) / 1000) * 1000;
      const maxCoursePrice = Math.ceil(Math.max(...prices) / 1000) * 1000;

      setMinPrice(minCoursePrice);
      setMaxPrice(maxCoursePrice);
      setPriceRange(maxCoursePrice);
      setFilteredCourses(courses);
    }
  }, [courses]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleFilter();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, priceRange, selectedCategory]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handlePriceChange = (event) => {
    setPriceRange(parseInt(event.target.value, 10));
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory((prevCategory) => (prevCategory === category ? "" : category));
  };

  const handleFilter = () => {
    if (!courses) return; // Safeguard against undefined courses
    const filtered = courses.filter((course) => {
      const matchesQuery = course?.title?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
      const withinPriceRange = course?.discountedPrice <= priceRange || false;
      const matchesCategory = !selectedCategory || course?.category === selectedCategory;

      return matchesQuery && withinPriceRange && matchesCategory;
    });
    setFilteredCourses(filtered);
  };

  // Create a new course and navigate to the detail page
  const handleAddCourse = async () => {
    try {
      const docRef = await addDoc(collection(db, "onlineCourses"), {
        title: "", // Default title (empty for now)
        description: "", // Default description
        discountedPrice: 0, // Default price
        originalPrice: 0, // Default original price
        category: "", // Default category
        imageUrl: "", // Default image URL
        features: [], // Default features
      });
      router.push(`/cursos-en-linea/${docRef.id}`); // Redirect to the new course page
    } catch (error) {
      console.error("Error adding course: ", error);
    }
  };

  // Redirect to course detail page when "Ver Información" is clicked
  const handleViewCourse = (courseId) => {
    router.push(`/cursos-en-linea/${courseId}`);
  };

  return (
    <div className={styles.container}>
      {/* Search Bar */}
      <header className={styles.header}>
        <input
          type="text"
          placeholder="Python, SQL, Excel..."
          className={styles.searchBar}
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </header>

      {/* Filters Section with "Agregar curso" Button aligned right */}
      <div className={styles.filters}>
        <div className={styles.filterOptions}>
          <button
            className={`${styles.filterButton} ${selectedCategory === 'Programación' ? styles.activeFilter : ''}`}
            onClick={() => handleCategoryChange("Programación")}
          >
            Programación
          </button>
          <button
            className={`${styles.filterButton} ${selectedCategory === 'Ofimática' ? styles.activeFilter : ''}`}
            onClick={() => handleCategoryChange("Ofimática")}
          >
            Ofimática
          </button>
          <div className={styles.sliderContainer}>
            <span>₡</span>
            <span>{priceRange}</span>
            <input
              type="range"
              min={minPrice}
              max={maxPrice}
              step="1000"
              value={priceRange}
              onChange={handlePriceChange}
              className={styles.slider}
            />
          </div>
        </div>
        <button className={styles.addButton} onClick={handleAddCourse}>Agregar curso</button>
      </div>

      {/* Loading and Error States */}
      {loading && <p>Loading courses...</p>}
      {error && <p>{error}</p>}

      {/* Courses Grid */}
      <div className={styles.courseGrid}>
        {filteredCourses?.length > 0 ? (
          filteredCourses.map((course) => (
            <div key={course.id} className={styles.courseCard}>
              <img
                src={course.imageUrl || "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2FprogrammingDefaulImage.webp?alt=media&token=1ddc96cb-88e5-498e-8d9f-a870f32ecc45"}
                alt={course.title}
                className={styles.courseImage}
              />
              <div className={styles.courseInfo}>
                <h2>{course.title}</h2>
                <p>{course.description}</p>
                <div className={styles.priceContainer}>
                  <span className={styles.discountedPrice}>
                    ₡{course.discountedPrice}
                  </span>
                  <span className={styles.originalPrice}>
                    ₡{course.originalPrice}
                  </span>
                </div>
                <button 
                  className={styles.infoButton} 
                  onClick={() => handleViewCourse(course.id)}
                >
                  Ver Información
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No courses available.</p>
        )}
      </div>

      {/* Footer Section */}
      <footer className={styles.footer}>
        <p>¿No ves el curso que buscas?</p>
        <button className={styles.contactButton}>Contáctanos</button>
      </footer>
    </div>
  );
};

export default OnlineCourses;
