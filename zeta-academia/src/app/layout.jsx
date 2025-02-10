import "./globals.css";
import Navbar from "../components/navbar/Navbar";
import FooterZ from "@/components/footer/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { Montserrat } from "next/font/google";
import ScrollToTop from "@/components/scrollToTop/ScrollToTop";
import FixedBtn from "@/components/fixedBtn/fixedBtn";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";

const montserrat = Montserrat({
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata = {
  title: "ZETA Academia",
  description: "ZETA Plataforma Educativa",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/faviconWeb.png" />

        <meta property="og:title" content="ZETA Academia" />
        <meta property="og:description" content="ZETA Plataforma Educativa" />
        <meta property="og:image" content="https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2FZetaLogo.png?alt=media&token=d8e33971-ceb0-4d9e-a617-2f026fe4467c" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content="https://zetaacademia.com" />
        <meta property="og:type" content="website" />
      </head>
      <body className={`app ${montserrat.className}`}>
        <AuthProvider>
          <ScrollToTop />
          <SpeedInsights />
          <div className="page-container">
            <Navbar />
            <FixedBtn />
            <main className="content">{children}</main>
            <FooterZ />
          </div>
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  );
}
