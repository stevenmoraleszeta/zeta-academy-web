"use client";

import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// Importa todos los estilos oscuros que deseas usar
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";

const styles = {
    vscDarkPlus: vscDarkPlus,
};

const CodeBlock = ({ code, language = "python", theme = "vscDarkPlus" }) => {
    const selectedStyle = styles[theme] || vscDarkPlus; // Selecciona un tema por defecto si no se especifica

    if (!code) return null;

    return (
        <div style={{ margin: "1em 0" }}>
            <SyntaxHighlighter 
                language={language} 
                style={selectedStyle} 
                codeTagProps={{ style: { fontSize: "1.3em" } }}
            >
                {code}
            </SyntaxHighlighter>
        </div>
    );
};

export default CodeBlock;
