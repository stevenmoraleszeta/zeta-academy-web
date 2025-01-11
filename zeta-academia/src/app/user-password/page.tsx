// src/app/login/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./user.module.css";

function UserAndPassword() {
  const { loginWithEmailAndPassword } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await loginWithEmailAndPassword(email, password);
      router.push("/"); // Cambia la ruta a la del componente deseado
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
    }
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
    </section>
  );
}

export default UserAndPassword;
