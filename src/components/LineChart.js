'use client';

import { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import zoomPlugin from 'chartjs-plugin-zoom';
import 'chartjs-adapter-date-fns';
import styles from './LineChart.module.css';

Chart.register(zoomPlugin);

const LineChart = () => {
  const [data, setData] = useState(null);
  const [noiseLevels, setNoiseLevels] = useState(null);
  const [selectedFile, setSelectedFile] = useState('100k.csv'); // Default file
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const workerRef = useRef(null);

  useEffect(() => {
    workerRef.current = new Worker(new URL('../workers/worker.js', import.meta.url));

    workerRef.current.onmessage = (event) => {
      const { data, action, noiseLevels } = event.data;

      if (action === 'parsed') {
        setData(data);
        setNoiseLevels(noiseLevels); // Save results level of noise
        setLoading(false);
      }
    };

    fetchCSVData(selectedFile);

    return () => workerRef.current.terminate();
  }, [selectedFile]);

  const fetchCSVData = async (file) => {
    setLoading(true);
    const response = await fetch(`/${file}`);
    const textData = await response.text();
    workerRef.current.postMessage({ action: 'parse', data: textData });
  };

  useEffect(() => {
    if (data) {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
      createChart(data);
    }
  }, [data]);

  const createChart = (data) => {
    const ctx = canvasRef.current.getContext('2d');

    const labels = data.map(record => new Date(record['DATE&TIME']));
    const lafmax = data.map(record => parseFloat(record['LAFMAX']));
    const lafmin = data.map(record => parseFloat(record['LAFMIN']));
    const lae = data.map(record => parseFloat(record['LAE']));
    const laeq = data.map(record => parseFloat(record['LAEQ']));

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'LAFMAX',
            data: lafmax,
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
            fill: false,
            pointRadius: 0,
            tension: 0
          },
          {
            label: 'LAFMIN',
            data: lafmin,
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
            fill: false,
            pointRadius: 0,
            tension: 0
          },
          {
            label: 'LAE',
            data: lae,
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            fill: false,
            pointRadius: 0,
            tension: 0
          },
          {
            label: 'LAEQ',
            data: laeq,
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1,
            fill: false,
            pointRadius: 0,
            tension: 0
          }
        ]
      },
      options: {
        responsive: true,
        animation: false,
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'hour',
              stepSize: 1,
            },
            title: {
              display: true,
              text: 'Date & Time'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Value'
            }
          }
        },
        elements: {
          line: {
            tension: 0
          },
          point: {
            radius: 0,
            hitRadius: 5
          }
        },
        plugins: {
          decimation: {
            enabled: true,
            algorithm: 'lttb', // LTTB algorithm for decimation
          },
          zoom: {
            pan: {
              enabled: true,
              mode: 'xy'
            },
            zoom: {
              wheel: {
                enabled: true
              },
              pinch: {
                enabled: true
              },
              mode: 'xy'
            }
          }
        }
      }
    });
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.value);
  };

  return (
    <div>
      <canvas ref={canvasRef} width={1200} height={500}></canvas>
      <button className={styles.button} onClick={() => chartRef.current.resetZoom()}>Reset Zoom</button>
      {noiseLevels && (
        <div>
          <p>Mean LAFMAX: {noiseLevels.mean}</p>
          <p>Standard Deviation: {noiseLevels.stdDev}</p>
        </div>
      )}
      <div className={styles.chartNav}> 
        <div>
          <label htmlFor="file-select">Select data file:</label>
          <select id="file-select" onChange={handleFileChange} value={selectedFile} className={styles.select}>
            <option value="100k.csv">100k</option>
            <option value="200k.csv">200k</option>
            <option value="300k.csv">300k</option>
            <option value="500k.csv">500k</option>
            <option value="700k.csv">700k</option>
            <option value="1kk.csv">1kk</option>
            <option value="2kk.csv">2kk</option>
          </select>
        </div>
        {loading && <p className={styles.loading}>Loading data...</p>}
      </div>
    </div>
  );
};

export default LineChart;
