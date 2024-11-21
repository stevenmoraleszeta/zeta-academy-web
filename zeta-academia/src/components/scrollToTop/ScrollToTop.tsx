"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollToTop() {
    const pathname = usePathname();

    useEffect(() => {
        const pageContainer = document.querySelector("body");
        if (pageContainer) {
            pageContainer.scrollTo({
                top: 0,
                left: 0,
            });
        }
    }, [pathname]); // Se ejecuta cada vez que cambia la ruta

    return null;
}
