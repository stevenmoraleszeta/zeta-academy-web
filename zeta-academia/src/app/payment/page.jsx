"use client";

import React, { useState, useEffect } from "react";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { useAuth } from "@/context/AuthContext";
import styles from "./page.module.css";

const PaymentPage = ({ searchParams }) => {
    const { currentUser } = useAuth();
    const router = useRouter();
    const courseId = searchParams.courseId || ""; // Obtenemos el courseId
    const [course, setCourse] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false);

    // Redirigir si no hay courseId
    useEffect(() => {
        if (!courseId) {
            console.error("courseId no encontrado. Redirigiendo a cursos en línea.");
            router.push("/cursos-en-linea");
        }
    }, [courseId, router]);

    // Verificar si el usuario está inscrito
    useEffect(() => {
        const checkEnrollment = async () => {
            if (!currentUser || !courseId) return;

            try {
                const userRef = doc(db, "users", currentUser.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    const enrolledCourses = userData.enrolledCourses || [];

                    if (enrolledCourses.includes(courseId)) {
                        setIsAlreadyEnrolled(true);
                    }
                }
            } catch (error) {
                console.error("Error verificando la inscripción:", error);
            }
        };

        checkEnrollment();
    }, [currentUser, courseId]);

    useEffect(() => {
        setShowModal(!currentUser);
    }, [currentUser]);

    // Cargar detalles del curso desde Firebase
    useEffect(() => {
        const fetchCourseDetails = async () => {
            if (!courseId) return;
            try {
                const courseRef = doc(db, "onlineCourses", courseId);
                const courseSnap = await getDoc(courseRef);

                if (courseSnap.exists()) {
                    setCourse(courseSnap.data());
                } else {
                    console.error("El curso no existe.");
                    router.push("/cursos-en-linea"); // Redirigir si el curso no existe
                }
            } catch (error) {
                console.error("Error al cargar los detalles del curso:", error);
                router.push("/cursos-en-linea"); // Redirigir en caso de error
            }
        };

        fetchCourseDetails();
    }, [courseId, router]);

    const handlePaymentSuccess = async (details) => {
        console.log("Pago exitoso:", details);
        setPaymentStatus("success");

        if (currentUser && courseId) {
            try {
                const userRef = doc(db, "users", currentUser.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    const enrolledCourses = userData.enrolledCourses || [];

                    if (!enrolledCourses.includes(courseId)) {
                        enrolledCourses.push(courseId);
                        await updateDoc(userRef, { enrolledCourses });
                    }
                } else {
                    // Si el usuario no tiene datos en Firestore, crear el documento
                    await updateDoc(userRef, { enrolledCourses: [courseId] });
                }
            } catch (error) {
                console.error("Error al inscribir al usuario:", error);
            }
        }
    };

    const handlePaymentError = (error) => {
        console.error("Error al procesar el pago:", error);
        setPaymentStatus("error");
    };

    const retryPayment = () => {
        setPaymentStatus(null);
    };

    const createOrder = async () => {
        if (!course) return null;
        try {
            const response = await fetch("/api/create-order", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ amount: course.discountedPrice }),
            });

            if (!response.ok) {
                throw new Error("Error al crear la orden");
            }

            const data = await response.json();
            return data.id;
        } catch (error) {
            console.error("Error al crear la orden:", error.message);
            throw error;
        }
    };

    if (isAlreadyEnrolled) {
        return (
            <div className={styles.modalBackdrop}>
                <div className={styles.modalContent}>
                    <h2>Ya estás inscrito en este curso</h2>
                    <p>Puedes acceder al contenido del curso directamente.</p>
                    <button
                        className={styles.modalButton}
                        onClick={() => router.push(`/cursos-en-linea`)}
                    >
                        Ir al curso
                    </button>
                </div>
            </div>
        );
    }

    if (!course) {
        return <div>Cargando detalles del curso...</div>;
    }

    if (course.discountedPrice <= 0) {
        return (
            <div className={styles.paymentContainer}>
                <div className={styles.paymentBox}>
                    <h1 className={styles.paymentTitle}>Pago inválido</h1>
                    <p className={styles.paymentDetails}>
                        El monto ingresado no es válido. Por favor, intente nuevamente.
                    </p>
                    <button
                        onClick={() => (window.location.href = "/")}
                        className={styles.retryButton}
                    >
                        Volver al Menú Principal
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.paymentContainer}>
            <div className={styles.paymentBox}>
                {showModal && (
                    <div className={styles.modalBackdrop}>
                        <div className={styles.modalContent}>
                            <h2 className={styles.modalTitle}>
                                Iniciar sesión requerido
                            </h2>
                            <p className={styles.modalDescription}>
                                Debe iniciar sesión antes de realizar cualquier pago.
                            </p>
                            <button
                                className={styles.modalButton}
                                onClick={() => (window.location.href = "/login")}
                            >
                                Iniciar sesión
                            </button>
                        </div>
                    </div>
                )}

                {!showModal && paymentStatus === null && (
                    <>
                        <h1 className={styles.paymentTitle}>{course.title}</h1>
                        <p className={styles.paymentDetails}>{course.description}</p>
                        <p className={styles.paymentAmount}>
                            Monto a pagar: ${course.discountedPrice.toFixed(2)}
                        </p>
                        <div className={styles.paypalButton}>
                            <PayPalScriptProvider
                                options={{
                                    "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
                                    currency: "USD",
                                }}
                            >
                                <PayPalButtons
                                    createOrder={createOrder}
                                    onApprove={(data, actions) =>
                                        actions.order
                                            .capture()
                                            .then(handlePaymentSuccess)
                                            .catch(handlePaymentError)
                                    }
                                    onError={handlePaymentError}
                                />
                            </PayPalScriptProvider>
                        </div>
                    </>
                )}

                {paymentStatus === "success" && (
                    <div className={styles.paymentSuccess}>
                        <h2>¡Pago realizado exitosamente!</h2>
                    </div>
                )}

                {paymentStatus === "error" && (
                    <div className={styles.paymentError}>
                        <h2>Hubo un error al realizar el pago</h2>
                        <button
                            onClick={retryPayment}
                            className={styles.retryButton}
                        >
                            Volver a Intentarlo
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentPage;
