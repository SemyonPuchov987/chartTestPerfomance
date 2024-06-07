import LineChart from '../components/LineChart';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Chart</h1>
      <LineChart />
    </main>
  );
}
