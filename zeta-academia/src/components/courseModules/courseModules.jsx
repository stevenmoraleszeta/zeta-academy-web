// File: src/components/CourseModules.jsx

import React, { useState } from "react";
import styles from "./courseModules.module.css";

const CourseModules = ({ modules, setModules }) => {
    const handleAddModule = () => {
        const newModule = { title: "Nuevo Módulo", classes: [] };
        setModules((prevModules) => [...prevModules, newModule]);
    };

    return (
        <div className={styles.modulesContainer}>
            {modules.map((module, index) => (
                <Module
                    key={index}
                    moduleIndex={index}
                    title={module.title}
                    classes={module.classes}
                    setModules={setModules}
                />
            ))}
            <button onClick={handleAddModule} className={styles.addButton}>
                Agregar Módulo
            </button>
        </div>
    );
};

const Module = ({ moduleIndex, title, classes, setModules }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleAddClass = () => {
        setModules((prevModules) => {
            const newModules = [...prevModules];
            newModules[moduleIndex].classes.push("Nueva Clase");
            return newModules;
        });
    };

    const handleTitleChange = (e) => {
        setModules((prevModules) => {
            const newModules = [...prevModules];
            newModules[moduleIndex].title = e.target.value;
            return newModules;
        });
    };

    const handleClassChange = (classIndex, value) => {
        setModules((prevModules) => {
            const newModules = [...prevModules];
            newModules[moduleIndex].classes[classIndex] = value;
            return newModules;
        });
    };

    return (
        <div className={`${styles.module} ${isExpanded ? styles.expanded : ""}`}>
            <input
                type="text"
                value={title}
                onChange={handleTitleChange}
                className={styles.moduleTitleInput}
                onClick={() => setIsExpanded(!isExpanded)}
            />
            {isExpanded && (
                <ul className={styles.classList}>
                    {classes.map((classItem, index) => (
                        <li key={index} className={styles.classItem}>
                            <input
                                type="text"
                                value={classItem}
                                onChange={(e) => handleClassChange(index, e.target.value)}
                                className={styles.classInput}
                            />
                        </li>
                    ))}
                    <button onClick={handleAddClass} className={styles.addClassButton}>
                        Agregar Clase
                    </button>
                </ul>
            )}
        </div>
    );
};

export default CourseModules;
