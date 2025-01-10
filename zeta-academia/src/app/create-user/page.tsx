"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./create.module.css";

function createUser() {
  const { registerWithEmailAndPassword } = useAuth(); // Método para registrar usuario
  const router = useRouter();

  // Estados de los inputs
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState<File | null>();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setProfilePicture(e.target.files[0]);
    }
  };

  // Manejador del submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (password !== confirmPassword) {
        setError("Las contraseñas no coinciden");
        setIsSubmitting(false);
        return;
    }

    try {
        await registerWithEmailAndPassword(email, password, name, profilePicture); // Registrar en Firebase con foto
        router.push("/completeInfoPage");
    } catch (err: any) {
        setError(err.message || "Error al registrarse");
    } finally {
        setIsSubmitting(false);
    }
};

  return (
    <section>
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
            />
          </div>
          <div className={styles.textContainer}>
            <p className={styles.loginText}>
              ¡Crea tu cuenta para acceder a más funcionalidades!
            </p>
          </div>
          <form onSubmit={handleSubmit} className={styles.formContainer}>
            <input
              type="text"
              placeholder="Nombre completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
              required
            />
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
            <input
              type="password"
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={styles.input}
              required
            />
           
            {error && <p className={styles.errorText}>{error}</p>}
            <button type="submit" disabled={isSubmitting} className={styles.submitButton}>
              {isSubmitting ? "Registrando..." : "Crear cuenta"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default createUser;
