import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  ArcElement, Title, Tooltip, Legend, Filler
);

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const currentMonthIdx = new Date().getMonth();
const last6Months = months.slice(Math.max(0, currentMonthIdx - 5), currentMonthIdx + 1);

// --- Shopkeeper Charts ---

export const SalesBarChart = () => {
  const data = {
    labels: last6Months,
    datasets: [{
      label: 'Sales (₹)',
      data: [12000, 19500, 14000, 21000, 18500, 27000].slice(-last6Months.length),
      backgroundColor: 'rgba(22, 163, 74, 0.75)',
      borderColor: 'rgba(22, 163, 74, 1)',
      borderWidth: 2,
      borderRadius: 8,
    }],
  };
  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      y: {
        grid: { color: 'rgba(0,0,0,0.04)' },
        ticks: { callback: (v) => `₹${(v / 1000).toFixed(0)}k` },
      },
      x: { grid: { display: false } },
    },
  };
  return <Bar data={data} options={options} />;
};

export const RevenueLineChart = () => {
  const data = {
    labels: last6Months,
    datasets: [{
      label: 'Revenue (₹)',
      data: [8000, 14000, 9500, 16000, 13000, 22000].slice(-last6Months.length),
      fill: true,
      borderColor: 'rgba(99, 102, 241, 1)',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      tension: 0.4,
      pointBackgroundColor: 'rgba(99, 102, 241, 1)',
      pointRadius: 5,
    }],
  };
  const options = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        grid: { color: 'rgba(0,0,0,0.04)' },
        ticks: { callback: (v) => `₹${(v / 1000).toFixed(0)}k` },
      },
      x: { grid: { display: false } },
    },
  };
  return <Line data={data} options={options} />;
};

export const TopProductsDoughnut = () => {
  const data = {
    labels: ['Rice', 'Coconut Oil', 'Spices', 'Pulses', 'Snacks'],
    datasets: [{
      data: [35, 25, 18, 12, 10],
      backgroundColor: [
        'rgba(22, 163, 74, 0.85)',
        'rgba(99, 102, 241, 0.85)',
        'rgba(245, 158, 11, 0.85)',
        'rgba(239, 68, 68, 0.85)',
        'rgba(20, 184, 166, 0.85)',
      ],
      borderWidth: 2,
      borderColor: '#fff',
    }],
  };
  const options = {
    responsive: true,
    cutout: '65%',
    plugins: {
      legend: { position: 'bottom', labels: { padding: 16, font: { size: 12 } } },
    },
  };
  return <Doughnut data={data} options={options} />;
};

// --- Admin Charts ---

export const PlatformRevenueLineChart = () => {
  const data = {
    labels: last6Months,
    datasets: [
      {
        label: 'User Orders (₹)',
        data: [45000, 72000, 58000, 91000, 78000, 115000].slice(-last6Months.length),
        fill: true,
        borderColor: 'rgba(22, 163, 74, 1)',
        backgroundColor: 'rgba(22, 163, 74, 0.08)',
        tension: 0.4,
        pointBackgroundColor: 'rgba(22, 163, 74, 1)',
        pointRadius: 4,
      },
      {
        label: 'Shopkeeper Revenue (₹)',
        data: [32000, 54000, 41000, 67000, 59000, 88000].slice(-last6Months.length),
        fill: true,
        borderColor: 'rgba(99, 102, 241, 1)',
        backgroundColor: 'rgba(99, 102, 241, 0.08)',
        tension: 0.4,
        pointBackgroundColor: 'rgba(99, 102, 241, 1)',
        pointRadius: 4,
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { padding: 20, font: { size: 12 } } },
    },
    scales: {
      y: {
        grid: { color: 'rgba(0,0,0,0.04)' },
        ticks: { callback: (v) => `₹${(v / 1000).toFixed(0)}k` },
      },
      x: { grid: { display: false } },
    },
  };
  return <Line data={data} options={options} />;
};

export const StoreGrowthBarChart = () => {
  const data = {
    labels: last6Months,
    datasets: [{
      label: 'New Stores Registered',
      data: [4, 7, 3, 9, 6, 12].slice(-last6Months.length),
      backgroundColor: 'rgba(245, 158, 11, 0.8)',
      borderColor: 'rgba(245, 158, 11, 1)',
      borderWidth: 2,
      borderRadius: 8,
    }],
  };
  const options = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { stepSize: 2 } },
      x: { grid: { display: false } },
    },
  };
  return <Bar data={data} options={options} />;
};

export const UserRoleDoughnut = () => {
  const data = {
    labels: ['Rural Users', 'Shopkeepers', 'Admins'],
    datasets: [{
      data: [1240, 86, 4],
      backgroundColor: [
        'rgba(22, 163, 74, 0.85)',
        'rgba(99, 102, 241, 0.85)',
        'rgba(239, 68, 68, 0.85)',
      ],
      borderWidth: 2,
      borderColor: '#fff',
    }],
  };
  const options = {
    responsive: true,
    cutout: '65%',
    plugins: {
      legend: { position: 'bottom', labels: { padding: 16, font: { size: 12 } } },
    },
  };
  return <Doughnut data={data} options={options} />;
};
