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
        <link rel="stylesheet" href="./favicon" />
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
