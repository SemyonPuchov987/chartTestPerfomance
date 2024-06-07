'use client';

import dynamic from 'next/dynamic';
import styles from './page.module.css';

const DynamicLineChart = dynamic(() => import('../components/LineChart'), {
  ssr: false, 
});

export default function Home() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Chart</h1>
      <DynamicLineChart />
    </main>
  );
}
