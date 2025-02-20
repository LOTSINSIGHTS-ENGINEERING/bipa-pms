import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';

// Register the necessary components
ChartJS.register(...registerables);

const JobCardLineChart = ({ data }) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const, // Ensure TypeScript recognizes this as a valid type
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Weeks',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Job Cards',
        },
        beginAtZero: true,
      },
    },
  };

  return <Line data={data} options={options} />;
};

export default JobCardLineChart;
