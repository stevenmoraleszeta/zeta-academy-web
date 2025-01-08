"use client";

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebase';
import styles from './page.module.css';

const StudentPage = () => {
    const router = useRouter();
    const params = useParams();
    const studentId = params ? params.studentId : null;
    interface StudentData {
        nombreCompleto: string;
        edad: number;
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
            <h1>Editar Estudiante</h1>
            {studentData && (
                <div>
                    <label>Nombre Completo</label>
                    <input
                        type="text"
                        value={studentData.nombreCompleto || ''}
                        onChange={(e) => setStudentData({ ...studentData, nombreCompleto: e.target.value })}
                    />
                    <label>Edad</label>
                    <input
                        type="number"
                        value={studentData.edad || ''}
                        onChange={(e) => setStudentData({ ...studentData, edad: Number(e.target.value) })}
                    />
                    <button onClick={handleSave}>Guardar</button>
                </div>
            )}
        </div>
    );
};

export default StudentPage;