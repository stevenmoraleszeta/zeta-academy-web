"use client";

import React, { useState } from "react";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import styles from "./page.module.css";

const PaymentPage = ({ searchParams }) => {
    const amount = parseFloat(searchParams.amount || "0"); // Valor predeterminado
    const title = searchParams.title || "Pago";
    const details = searchParams.details || "Detalles del pago";

    const [paymentStatus, setPaymentStatus] = useState(null); // Estado del pago: null, "success", "error"

    const handlePaymentSuccess = (details) => {
        console.log("Pago exitoso:", details);
        setPaymentStatus("success");
    };

    const handlePaymentError = (error) => {
        console.error("Error al procesar el pago:", error);
        setPaymentStatus("error");
    };

    const retryPayment = () => {
        setPaymentStatus(null); // Reinicia el estado para volver a intentar
    };

    const createOrder = async () => {
        try {
            const response = await fetch("/api/create-order", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ amount }),
            });

            if (!response.ok) {
                throw new Error("Error al crear la orden");
            }

            const data = await response.json();
            return data.id; // Devuelve el ID de la orden creada
        } catch (error) {
            console.error("Error al crear la orden:", error.message);
            throw error;
        }
    };

    const whatsappNumber = "+50661304830"; // Número de WhatsApp para contacto

    if (amount <= 0) {
        // Mostrar mensaje de pago inválido si el monto no es válido
        return (
            <div className={styles.paymentContainer}>
                <div className={styles.paymentBox}>
                    <h1 className={styles.paymentTitle}>Pago inválido</h1>
                    <p className={styles.paymentDetails}>
                        El monto ingresado no es válido. Por favor, intente nuevamente.
                    </p>
                    <button
                        onClick={() => (window.location.href = "/")} // Redirige al menú principal
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
                {paymentStatus === null && (
                    <>
                        <h1 className={styles.paymentTitle}>{title}</h1>
                        <p className={styles.paymentDetails}>{details}</p>
                        <p className={styles.paymentAmount}>
                            Monto a pagar: ${amount.toFixed(2)}
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
                        <p>¿Tiene alguna consulta?</p>
                        <a
                            href={`https://wa.me/${whatsappNumber.replace("+", "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.contactButton}
                        >
                            Contactar por WhatsApp
                        </a>
                    </div>
                )}

                {paymentStatus === "error" && (
                    <div className={styles.paymentError}>
                        <h2>Hubo un error al realizar el pago</h2>
                        <p>¿Tiene alguna consulta?</p>
                        <a
                            href={`https://wa.me/${whatsappNumber.replace("+", "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.contactButton}
                        >
                            Contactar por WhatsApp
                        </a>
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
