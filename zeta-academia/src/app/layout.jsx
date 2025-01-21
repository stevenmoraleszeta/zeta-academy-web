import "./globals.css";
import Navbar from "../components/navbar/Navbar";
import FooterZ from "@/components/footer/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { Montserrat } from "next/font/google";
import ScrollToTop from "@/components/scrollToTop/ScrollToTop";
import FixedBtn from "@/components/fixedBtn/fixedBtn";

const montserrat = Montserrat({
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata = {
  title: "ZETA",
  description: "ZETA Plataforma Educativa",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`app ${montserrat.className}`}>
        <AuthProvider>
          <ScrollToTop />
          <div className="page-container">
            <Navbar />
            <FixedBtn />
            <main className="content">{children}</main>
            <FooterZ />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
