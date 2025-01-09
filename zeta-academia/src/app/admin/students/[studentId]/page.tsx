"use client";

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebase';
import styles from './page.module.css';

const StudentPage = () => {
    const params = useParams();
    const studentId = params ? params.studentId : null;
    interface StudentData {
        nombreCompleto: string;
        edad: number;
        email: string;
        username: string;
        ocupacion: string;
        estiloAprendizaje: string;
        Intereses: string;
        nivelInicial: string;
        objetivosIndividuales: string;
        curso: string;
    }

    const [studentData, setStudentData] = useState<StudentData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (studentId) {
            const fetchStudentData = async () => {
                try {
                    const docRef = doc(db, 'estudiantes', studentId as string);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setStudentData(docSnap.data() as StudentData);
                    } else {
                        setError('No such document!');
                    }
                } catch (err: any) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            };

            fetchStudentData();
        }
    }, [studentId]);

    const handleSave = async () => {
        if (!studentData) return;

        try {
            const docRef = doc(db, 'estudiantes', studentId as string);
            await updateDoc(docRef, { ...studentData });
            alert('Datos actualizados con éxito');
        } catch (err: any) {
            setError(err.message);
        }
    };

    if (loading) return <p>Cargando datos...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className={styles.studentPageContainer}>
            <h1>Ficha de Estudiante</h1>
            {studentData && <h1>{studentData.nombreCompleto}</h1>}
            {studentData && (
                <div className={styles.studentInformation}>
                    <div className={styles.studentDataContainer}>
                        <h2>Información personal</h2>
                        <p>Nombre de usuario: {studentData.username || ''}</p>
                        <p>Email: {studentData.email || ''}</p>
                        <p>Edad: {studentData.edad || ''}</p>
                    </div>
                    <div className={styles.studentTableContainer}>
                        <h2>Perfil de estudio</h2>
                        {studentData && (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Ocupación</th>
                                        <th>Intereses personales</th>
                                        <th>Estilo de aprendizaje</th>
                                        <th>Nivel inicial</th>
                                        <th>Objetivos individuales</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>{studentData.ocupacion}</td>
                                        <td>{studentData.Intereses}</td>
                                        <td>{studentData.estiloAprendizaje}</td>
                                        <td>{studentData.nivelInicial}</td>
                                        <td>{studentData.objetivosIndividuales}</td>
                                    </tr>
                                </tbody>
                            </table>
                        )}
                        <h2>Notas</h2>
                        {studentData && (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Cursos</th>
                                        <th>Notas</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>{studentData.curso}</td>
                                        <td>80%</td>
                                    </tr>
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentPage;