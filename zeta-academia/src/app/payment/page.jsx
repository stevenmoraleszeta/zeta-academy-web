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
  // constantes para settear el titulo y descripcion
  const [paymentTitle, setPaymentTitle] = useState("");
  const [paymentDetails, setPaymentDetails] = useState("");
  const [customAmount, setCustomAmount] = useState("");

  // Para pagos personalizados
  const [customPayment, setCustomPayment] = useState({
    title: "",
    description: "",
    amount: "",
  });
  const [errors, setErrors] = useState([]);

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

  // Cargar detalles del curso
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
        }
      } catch (error) {
        console.error("Error al cargar detalles del curso:", error);
      }
    };

    fetchCourseDetails();
  }, [courseId]);

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
          await updateDoc(userRef, { enrolledCourses: [courseId] });
        }

        router.push(`/cursos-en-linea/${courseId}`);
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

  const validateAndCreateOrder = async () => {
    const newErrors = [];
  
    // Validar campos personalizados si no hay courseId
    /*if (!courseId) {
      if (!customPayment.title.trim()) newErrors.push("El título es obligatorio.");
      if (!customPayment.description.trim())
        newErrors.push("La descripción es obligatoria.");
      if (
        !customPayment.amount.trim() ||
        isNaN(customPayment.amount) ||
        Number(customPayment.amount) <= 0
      ) {
        newErrors.push("El monto debe ser un número mayor a 0.");
      }
      setErrors(newErrors);
  
      // Si hay errores, termina aquí
      if (newErrors.length > 0) {
        console.log("Errores de validación:", newErrors);
        return null;
      }
    }*/
  
    // Crear orden
    try {
      const amount = courseId
        ? course.discountedPrice
        : Number(customPayment.amount);
  
      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
  
      if (!response.ok) throw new Error("Error al crear la orden");
  
      const data = await response.json();
      return data.id; // Retorna el ID de la orden
    } catch (error) {
      console.error("Error al crear la orden:", error);
      return null;
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
  } else if (course && course.discountedPrice <= 0) {
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
  } else if (!courseId && !course) {
    return (
      <div className={styles.paymentContainer}>
        <h1 className={styles.paymentTitle}>Pago Personalizado</h1>
        <p className={styles.paymentDetails}>Centro de Pago Personalizado</p>
        <div className={styles.paymentBox}>
          {/* Campo para Título del Pago */}
          <div>
            <label htmlFor="paymentTitle" className={styles.paymentDetails}>
              Título del Pago:
            </label>
            <input
              id="paymentTitle"
              className={`${styles.paymentInput}`}
              value={paymentTitle}
              onChange={(e) => setPaymentTitle(e.target.value)}
              onFocus={() => {
                if (!paymentTitle.trim()) setPaymentTitle("");
              }}
              placeholder="Servicio, curso, clases, software, etc."
            />
          </div>

          {/* Campo para Descripción del Pago */}
          <div>
            <label htmlFor="paymentDetails" className={styles.paymentDetails}>
              Descripción del Pago:
            </label>
            <input
              id="paymentDetails"
              className={`${styles.paymentInput}`}
              value={paymentDetails}
              onChange={(e) => setPaymentDetails(e.target.value)}
              onFocus={() => {
                if (!paymentDetails.trim()) setPaymentDetails("");
              }}
              placeholder="Escribe una descripción breve del pago..."
            />
          </div>

          {/* Campo para el Monto Personalizado */}
          <div>
            <label htmlFor="customAmount" className={styles.paymentDetails}>
              Monto del Pago (USD):
            </label>
            <input
              id="customAmount"
              type="number"
              className={`${styles.paymentInput}`}
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              onFocus={() => {
                if (customAmount === "0") setCustomAmount("");
              }}
              placeholder="Ejemplo: 25.00"
            />
          </div>

          {/* Botón de PayPal */}
          <div className={styles.paypalButton}>
            <PayPalScriptProvider
              options={{
                "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
                currency: "USD",
              }}
            >
              <PayPalButtons
                createOrder={validateAndCreateOrder}
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
        </div>
      </div>
    );
  } else {
    return (
      <div className={styles.paymentContainer}>
        <div className={styles.paymentBox}>
          {errors.length > 0 && (
            <ul className={styles.errorList}>
              {errors.map((error, index) => (
                <li key={index} className={styles.errorItem}>
                  {error}
                </li>
              ))}
            </ul>
          )}

          {showModal && (
            <div className={styles.modalBackdrop}>
              <div className={styles.modalContent}>
                <h2 className={styles.modalTitle}>Iniciar sesión requerido</h2>
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

          {!showModal &&
            paymentStatus === null &&
            (course ? (
              <>
                <h1 className={styles.paymentTitle}>{course.title}</h1>
                <p className={styles.paymentDetails}>{course.description}</p>
                <p className={styles.paymentAmount}>
                  Monto a pagar: ${course.discountedPrice?.toFixed(2)}
                </p>
                <div className={styles.paypalButton}>
                  <PayPalScriptProvider
                    options={{
                      "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
                      currency: "USD",
                    }}
                  >
                    <PayPalButtons
                      createOrder={validateAndCreateOrder}
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
            ) : (
              <p>Cargando detalles del curso...</p>
            ))}

          {paymentStatus === "success" && (
            <div className={styles.paymentSuccess}>
              <h2>¡Pago realizado exitosamente!</h2>
            </div>
          )}

          {paymentStatus === "error" && (
            <div className={styles.paymentError}>
              <h2>Hubo un error al realizar el pago</h2>
              <button onClick={retryPayment} className={styles.retryButton}>
                Volver a Intentarlo
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
};

export default PaymentPage;
