"use client";

import React, { useState, useEffect, useRef } from "react";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { useRouter, useSearchParams } from "next/navigation";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { useAuth } from "@/context/AuthContext";
import styles from "./page.module.css";

const PaymentPage = () => {
  const { currentUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  const [course, setCourse] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false);
  // Para pagos personalizados
  const [customPayment, setCustomPayment] = useState({
    fullName: "",
    description: "",
    amount: "",
  });
  const [errors, setErrors] = useState([]);
  const customPaymentRef = useRef(customPayment);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [paymentReceipt, setPaymentReceipt] = useState(null);

  useEffect(() => {
    customPaymentRef.current = customPayment;
  }, [customPayment]);

  // Verificar si el usuario está inscrito
  useEffect(() => {
    const checkEnrollment = async () => {
      console.log("User: ", currentUser)
      console.log("CourseID: ", courseId)
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
          router.push('/payment')
          console.error("El curso no existe.");
        }
      } catch (error) {
        console.error("Error al cargar detalles del curso:", error);
      }
    };

    fetchCourseDetails();
  }, [courseId]);

  const handlePaymentSuccess = async (details) => {
    setPaymentStatus("success");

    try {
      // Guardar información del pago en la colección 'payments'
      const receiptNumber = `REC-${Date.now()}`;
      const paymentData = {
        fullName: customPaymentRef.current.fullName,
        description: customPaymentRef.current.description,
        amount: courseId ? course.discountedPrice : customPaymentRef.current.amount,
        courseId: courseId || null,
        userId: currentUser ? currentUser.uid : null,
        date: new Date().toISOString(),
        courseName: course.title,
        receiptNumber,
      };

      const paymentRef = doc(db, "payments", details.id);
      await updateDoc(paymentRef, paymentData);

      setPaymentReceipt(paymentData);

      if (currentUser && courseId) {
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
      }
    } catch (error) {
      console.error("Error al guardar la información del pago:", error);
    }
  };

  const handlePaymentError = (error) => {
    console.error("Error al procesar el pago:", error);
    setPaymentStatus("error");
  };

  const retryPayment = () => {
    setPaymentStatus(null);
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setCustomPayment((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const validateAndCreateOrder = async () => {
    const { fullName, description, amount } = customPaymentRef.current;


    const newErrors = [];
    if (!courseId) {
      if (!fullName) newErrors.push("El nombre completo es obligatorio.");
      if (!description) newErrors.push("La descripción es obligatoria.");
      if (!amount || isNaN(amount) || Number(amount) <= 0) {
        newErrors.push("El monto debe ser un número mayor a 0.");
      }
    }

    setErrors(newErrors);

    if (newErrors.length > 0) {
      alert("Errores de validación:\n" + newErrors.join("\n"));
      return null;
    }

    setIsEditing(false);

    try {
      const finalAmount = courseId
        ? course.discountedPrice
        : Number(amount);



      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: finalAmount }),
      });

      if (!response.ok) throw new Error("Error al crear la orden");

      const data = await response.json();

      // Record payment info in Firebase
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        await updateDoc(userRef, {
          payments: arrayUnion({
            fullName,
            description,
            amount: finalAmount,
            courseId: courseId || null,
            date: new Date().toISOString(),
          }),
        });
      }

      return data.id;
    } catch (error) {
      console.error("Error al crear la orden:", error);
      return null;
    }
  };

  const handleEditToggle = () => {
    setIsEditing(true);
    window.location.reload(); // Recargar la página
  };

  return (
    <div>
      {isAlreadyEnrolled ? (
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
      ) : course && course.discountedPrice <= 0 ? (
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
      ) : !courseId && !course ? (
        <div className={styles.paymentContainer}>
          <div className={styles.paymentBox}>
            <h1 className={styles.paymentTitle}>Centro de Pago Personalizado</h1>
            <p className={styles.paymentDetails}>Ingrese todos los datos para poder realizar un pago.</p>
            <div>
              <label htmlFor="fullName" className={styles.paymentDetails}>
                Nombre Completo:
              </label>
              <input
                type="text"
                id="fullName"
                className={styles.paymentInput}
                value={customPayment.fullName}
                onChange={handleInputChange}
                placeholder="Tu nombre completo"
                disabled={!isEditing}
              />
            </div>
            <div>
              <label htmlFor="description" className={styles.paymentDetails}>
                Descripción del Pago:
              </label>
              <input
                type="text"
                id="description"
                className={styles.paymentInput}
                value={customPayment.description}
                onChange={handleInputChange}
                placeholder="Escribe una descripción breve del pago..."
                disabled={!isEditing}
              />
            </div>
            <div>
              <label htmlFor="amount" className={styles.paymentDetails}>
                Monto del Pago (USD):
              </label>
              <input
                type="number"
                id="amount"
                className={styles.paymentInput}
                value={customPayment.amount}
                onChange={handleInputChange}
                placeholder="Ejemplo: 25.00"
                disabled={!isEditing}
              />
            </div>
            {!isEditing && (
              <button onClick={handleEditToggle} className={styles.editButton}>
                Modificar información
              </button>
            )}
            <p className={styles.paymentRecommendation}>
              Para su comodidad, recomendamos realizar el pago con tarjeta de crédito o débito. Esto le permitirá evitar el inicio de sesión con PayPal y completar su transacción de manera más rápida y sencilla.
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
          </div>
        </div>
      ) : (
        <div className={styles.paymentContainer}>
          <div className={styles.paymentBox}>
            {showErrorModal && (
              <div className={styles.modalBackdrop}>
                <div className={styles.modalContent}>
                  <h2 className={styles.modalTitle}>Errores de Validación</h2>
                  <ul className={styles.errorList}>
                    {errors.map((error, index) => (
                      <li key={index} className={styles.errorItem}>
                        {error}
                      </li>
                    ))}
                  </ul>
                  <button
                    className={styles.modalButton}
                    onClick={() => setShowErrorModal(false)}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
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
                    Monto a pagar (USD): ${course.discountedPrice?.toFixed(2)}
                  </p>
                  <p className={styles.paymentRecommendation}>
                    Para su comodidad, recomendamos realizar el pago con tarjeta de crédito o débito. Esto le permitirá evitar el inicio de sesión con PayPal y completar su transacción de manera más rápida y sencilla.
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
      )}
      {paymentReceipt && (
        <div className={styles.paymentReceipt}>
          <h2>¡Pago realizado exitosamente!</h2>
          <p>Nombre del curso: {paymentReceipt.courseName}</p>
          <p>Nombre del usuario: {paymentReceipt.fullName}</p>
          <p>Número de comprobante: {paymentReceipt.receiptNumber}</p>
          <p>¡Toma una captura de pantalla!</p>
        </div>
      )}

    </div>
  );
};

export default PaymentPage;
