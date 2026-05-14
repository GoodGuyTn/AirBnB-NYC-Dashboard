import HostReputationChart from './components/HostReputationChart';
import HostProfessionalismChart from './components/HostProfessionalismChart';
import { fetchHostReputationData, fetchHostProfessionalismData } from './lib/data';
import styles from './page.module.css';

export default async function Home() {
  const reputationData = await fetchHostReputationData();
  const professionalismData = await fetchHostProfessionalismData();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>📊 Airbnb NYC Dashboard</h1>
        <p>Phân tích uy tín và mức độ chuyên nghiệp của chủ nhà</p>
      </header>

      <main className={styles.main}>
        <section className={styles.chartSection}>
          <HostReputationChart data={reputationData} />
        </section>

        <section className={styles.chartSection}>
          <HostProfessionalismChart data={professionalismData} />
        </section>
      </main>

      <footer className={styles.footer}>
        <p>Dữ liệu được cập nhật từ Airbnb NYC Dataset | © 2024</p>
      </footer>
    </div>
  );
}
