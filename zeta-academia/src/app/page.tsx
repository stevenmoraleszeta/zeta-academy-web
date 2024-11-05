import Image from "next/image";
import { MainPage } from "./pages/page"
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <MainPage></MainPage>
      </main>
    </div>
  );
}