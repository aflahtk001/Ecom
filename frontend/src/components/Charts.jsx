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
const last6Months = [];
for (let i = 5; i >= 0; i--) {
  const d = new Date();
  d.setMonth(d.getMonth() - i);
  last6Months.push(months[d.getMonth()]);
}

// Smart rupee tick formatter — shows ₹Xk only when value is large enough
const formatRupee = (v) => {
  if (v === 0) return '₹0';
  const abs = Math.abs(v);
  if (abs >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  if (abs >= 1000)   return `₹${(v / 1000).toFixed(1)}k`;
  return `₹${v.toFixed(0)}`;
};

// --- Shopkeeper Charts ---

export const SalesBarChart = ({ chartData }) => {
  const data = {
    labels: last6Months,
    datasets: [{
      label: 'Sales (₹)',
      data: chartData || [0, 0, 0, 0, 0, 0],
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
        beginAtZero: true,
        suggestedMax: 5,
        grid: { color: 'rgba(0,0,0,0.04)' },
        ticks: { 
          callback: formatRupee,
          precision: 0 
        },
      },
      x: { grid: { display: false } },
    },
  };
  return <Bar data={data} options={options} />;
};

export const RevenueLineChart = ({ chartData }) => {
  const data = {
    labels: last6Months,
    datasets: [{
      label: 'Revenue (₹)',
      data: chartData || [0, 0, 0, 0, 0, 0],
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
        beginAtZero: true,
        suggestedMax: 5,
        grid: { color: 'rgba(0,0,0,0.04)' },
        ticks: { 
          callback: formatRupee,
          precision: 0
        },
      },
      x: { grid: { display: false } },
    },
  };
  return <Line data={data} options={options} />;
};

export const TopProductsDoughnut = ({ chartData }) => {
  const data = {
    labels: chartData?.labels || ['No Data'],
    datasets: [{
      data: chartData?.data || [1],
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

export const PlatformRevenueLineChart = ({ chartData }) => {
  const data = {
    labels: last6Months,
    datasets: [
      {
        label: 'User Orders (₹)',
        data: chartData?.userOrders || [0, 0, 0, 0, 0, 0],
        fill: true,
        borderColor: 'rgba(22, 163, 74, 1)',
        backgroundColor: 'rgba(22, 163, 74, 0.08)',
        tension: 0.4,
        pointBackgroundColor: 'rgba(22, 163, 74, 1)',
        pointRadius: 4,
      },
      {
        label: 'Shopkeeper Revenue (₹)',
        data: chartData?.shopkeeperRevenue || [0, 0, 0, 0, 0, 0],
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
        beginAtZero: true,
        suggestedMax: 100,
        grid: { color: 'rgba(0,0,0,0.04)' },
        ticks: { 
          callback: formatRupee,
          precision: 0
        },
      },
      x: { grid: { display: false } },
    },
  };
  return <Line data={data} options={options} />;
};

export const StoreGrowthBarChart = ({ chartData }) => {
  const data = {
    labels: last6Months,
    datasets: [{
      label: 'New Stores Registered',
      data: chartData || [0, 0, 0, 0, 0, 0],
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
      y: { 
        beginAtZero: true,
        suggestedMax: 5,
        grid: { color: 'rgba(0,0,0,0.04)' }, 
        ticks: { stepSize: 1, precision: 0 } 
      },
      x: { grid: { display: false } },
    },
  };
  return <Bar data={data} options={options} />;
};

export const UserRoleDoughnut = ({ chartData }) => {
  const data = {
    labels: ['Rural Users', 'Shopkeepers', 'Admins'],
    datasets: [{
      data: chartData || [0, 0, 0],
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
