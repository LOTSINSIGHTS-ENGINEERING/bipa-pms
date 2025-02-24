// DoughnutChart.tsx
import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface DoughnutChartProps {
  data: { name: string; value: number }[];
  colors: string[];
  label: string;
}

const DoughnutChart: React.FC<DoughnutChartProps> = ({ data, colors, label }) => {
  const chartData = {
    labels: data.map(item => item.name),
    datasets: [{
      label,
      data: data.map(item => item.value),
      backgroundColor: colors,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: ${value}`;
          },
        },
      },
    },
    elements: {
      arc: {
        borderWidth: 0,
      },
    },
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Doughnut data={chartData} options={options} />
    </div>
  );
};

export default DoughnutChart;
