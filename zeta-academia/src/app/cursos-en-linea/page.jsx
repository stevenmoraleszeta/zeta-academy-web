// File: src/app/cursos-en-linea/page.jsx
"use client";

import React, { useState, useEffect } from "react";
import useFetchData from "@/app/hooks/useFetchData";
import { useRouter } from "next/navigation";
import {
  collection,
  getDocs,
  addDoc,
} from "firebase/firestore";
import { db } from "@/firebase/firebase";
import styles from "./page.module.css";
import CourseCardMenu from "@/components/courseCardMenu/courseCardMenu";
import { useAuth } from "@/context/AuthContext";

const OnlineCourses = () => {
  //titulo tab
  document.title = "Cursos en Linea - ZETA";
  const router = useRouter();
  const { data: courses, loading, error } = useFetchData("onlineCourses");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [priceRange, setPriceRange] = useState(maxPrice);
  const [selectedCategory, setSelectedCategory] = useState("");
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    if (courses && courses.length > 0) {
      const activeCourses = courses.filter((course) => !course.archived);
      const prices = activeCourses.map((course) => course.discountedPrice);
      const minCoursePrice = Math.floor(Math.min(...prices) / 10) * 10;
      const maxCoursePrice = Math.ceil(Math.max(...prices) / 10) * 10;

      setMinPrice(minCoursePrice);
      setMaxPrice(maxCoursePrice);
      setPriceRange(maxCoursePrice);
      setFilteredCourses(activeCourses);
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
    setSelectedCategory((prevCategory) =>
      prevCategory === category ? "" : category
    );
  };

  const handleFilter = () => {
    if (!courses) return;
    const filtered = courses.filter((course) => {
      const matchesQuery = course?.title
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
      const withinPriceRange = course?.discountedPrice <= priceRange;
      const matchesCategory =
        !selectedCategory || course?.category === selectedCategory;
      return (
        matchesQuery && withinPriceRange && matchesCategory && !course.archived
      );
    });
    setFilteredCourses(filtered);
  };

  const handleAddCourse = async () => {
    try {
      const docRef = await addDoc(collection(db, "onlineCourses"), {
        title: "",
        description: "",
        discountedPrice: 0,
        originalPrice: 0,
        category: "",
        imageUrl: "",
        features: [],
        archived: false,
      });
      router.push(`/cursos-en-linea/${docRef.id}`);
    } catch (error) {
      console.error("Error adding course: ", error);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <input
          type="text"
          placeholder="Python, SQL, Excel..."
          className={styles.searchBar}
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </header>

      <div className={styles.filters}>
        <div className={styles.filterOptions}>
          <button
            className={`${styles.filterButton} ${selectedCategory === "Programación" ? styles.activeFilter : ""
              }`}
            onClick={() => handleCategoryChange("Programación")}
          >
            Programación
          </button>
          <button
            className={`${styles.filterButton} ${selectedCategory === "Ofimática" ? styles.activeFilter : ""
              }`}
            onClick={() => handleCategoryChange("Ofimática")}
          >
            Ofimática
          </button>
          <div className={styles.sliderContainer}>
            <input
              type="range"
              min={minPrice}
              max={maxPrice}
              step="10"
              value={priceRange}
              onChange={handlePriceChange}
              className={styles.slider}
            />
            <span>$</span>
            <span>{priceRange}</span>
          </div>
        </div>
        {isAdmin ? (
          <button className={styles.addButton} onClick={handleAddCourse}>
            Agregar curso
          </button>
        ) : null}
      </div>

      {loading && <p>Loading courses...</p>}
      {error && <p>{error}</p>}

      <div className={styles.courseGrid}>
        {filteredCourses?.length > 0 ? (
          filteredCourses.map((course) => (
            <CourseCardMenu
              key={course.id}
              course={course}
              courseType={"online"}
            />
          ))
        ) : (
          <p>No encuentro algo como lo que buscas, porfavor contáctanos.</p>
        )}
      </div>

      <footer className={styles.footer}>
        <p>¿No ves el curso que buscas?</p>
        <a
          href="https://wa.link/hvutf8"
          target="_blank"
          rel="noopener noreferrer"
        >
          <button className={styles.contactButton}>Contáctanos</button>
        </a>
      </footer>
    </div>
  );
};

export default OnlineCourses;
