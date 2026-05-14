import DT02_HostReputationChart from './components/charts/DT02_HostReputationChart';
import DT03_HostProfessionalismChart from './components/charts/DT03_HostProfessionalismChart';
import { fetchHostReputationData, fetchHostProfessionalismData } from './lib/data';
import styles from './page.module.css';

export default async function Home() {
  const reputationData = await fetchHostReputationData();
  const professionalismData = await fetchHostProfessionalismData();

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.chartSection}>
          <h2 className={styles.chartTitle}>Phân tích uy tín chủ nhà (Task 3)</h2>
          <p className={styles.chartDescription}>
            Phân tích mối quan hệ giữa số lượng bài đánh giá và điểm xếp hạng trung bình của chủ nhà
          </p>
          <DT02_HostReputationChart data={reputationData} />
        </section>

        <section className={styles.chartSection}>
          <h2 className={styles.chartTitle}>Phân tích mức độ chuyên nghiệp của chủ nhà (Task 4)</h2>
          <p className={styles.chartDescription}>
            Phân tích mối quan hệ giữa thời gian phản hồi của chủ nhà và số lượng tài sản họ quản lý
          </p>
          <DT03_HostProfessionalismChart data={professionalismData} />
        </section>
      </main>
    </div>
  );
}
