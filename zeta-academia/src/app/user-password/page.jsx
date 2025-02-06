// src/app/login/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./user.module.css";
import { AlertComponent, AlertButton } from "@/components/alert/alert";

function UserAndPassword() {
  const { loginWithEmailAndPassword } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isAlertOpen, setIsAlertOpen] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsAlertOpen(false);
    try {
      await loginWithEmailAndPassword(email, password);
    } catch (err) {
      let errorMessage = checkError(err.code, err.message);
      setError(errorMessage);
      setIsAlertOpen(true);
    }
  };

  const checkError = (errorType, defaultMessage) => {
    let errorMessage;
    switch (errorType) {
      case "auth/invalid-credential":
        errorMessage = "Las credenciales proporcionadas no son válidas. Por favor, verifica tu correo electrónico y contraseña.";
        break;
      case "auth/user-not-found":
        errorMessage = "No se encontró una cuenta con este correo electrónico.";
        break;
      case "auth/wrong-password":
        errorMessage = "La contraseña es incorrecta. Por favor, intenta de nuevo.";
        break;
      default:
        errorMessage = defaultMessage || "Ocurrió un error al iniciar sesión. Por favor, intenta de nuevo.";
        break;
    }
    return errorMessage;
  };

  return (
    <section>
      <>
        <div className={styles.loginMainContainer}>
          <div className={styles.loginContainer}>
            <div className={styles.imgContainer}>
              <Image
                width={500}
                height={500}
                alt="zetaLogo"
                src={
                  "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2FZetaLogoCp.PNG?alt=media&token=4ab20b3d-09e0-403c-851a-154d51af90b6"
                }
                className={styles.zetaLogo}
              ></Image>
            </div>
            <div className={styles.textContainer}>
              <p className={styles.loginText}>
                Inicia sesión o crea tu cuenta para acceder a más
                funcionalidades.
              </p>
            </div>
            <form onSubmit={handleSubmit} className={styles.formContainer}>
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                required
              />
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                required
              />
              <p className={styles.forgetPassword}>
                <a href="https://wa.link/9vy9v9" className={styles.link}>
                  ¿Olvidaste tu contraseña?
                </a>
              </p>



              <button type="submit" className={styles.submitBtn}>
                Iniciar Sesión
              </button>

              <p className={styles.smallText}>
                ¿No tienes una cuenta?{" "}
                <a href="/create-user" className={styles.link}>
                  Regístrate aquí
                </a>
              </p>
              <a href="/login" className={styles.link}>
                Volver
              </a>
            </form>

            {/* Mensaje de error */}
            {error && <p className={styles.errorText}>{error}</p>}
          </div>
        </div>
      </>
      {isAlertOpen && (
        <AlertComponent
          title="Error"
          description={error}
        >
          <AlertButton text="Aceptar" funct={() => setIsAlertOpen(false)} />
        </AlertComponent>
      )}
    </section>
  );
}

export default UserAndPassword;
