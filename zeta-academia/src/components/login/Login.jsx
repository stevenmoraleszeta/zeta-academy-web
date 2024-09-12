import React from "react";
import { useAuth } from "../../context/AuthContext";

function Login() {
    const { loginWithGoogle, currentUser } = useAuth();

    return (
        <div>
            <h2>Iniciar Sesión</h2>
            {currentUser ? (
                <p>Bienvenido, {currentUser.displayName}</p>
            ) : (
                <button onClick={loginWithGoogle}>Ingresar con Google</button>
            )}
        </div>
    );
}

export default Login;
