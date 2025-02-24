import React from "react";
import "./NumberOfRatersChart.css";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from "chart.js";

// Registering required components for Chart.js
ChartJS.register(Title, Tooltip, Legend, ArcElement);

interface RatersDataItem {
  category: string;
  raters: number;
}

interface NumberOfRatersChartProps {
  data: RatersDataItem[];
}

const NumberOfRatersChart: React.FC<NumberOfRatersChartProps> = ({ data }) => {
  // Fully dark colors for the pie slices
  const colors = [
    "#004d4d", // Dark teal
    "#b30047", // Dark pink
    "#002e6d", // Dark blue
    "#9e6a00", // Dark yellow
    "#3d007d", // Dark purple
    "#8c4d0d", // Dark orange
  ];

  const chartData = {
    labels: data.map((item) => item.category),
    datasets: [
      {
        label: "Number of Raters",
        data: data.map((item) => item.raters),
        backgroundColor: colors.slice(0, data.length),
        borderColor: "#ffffff",
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "#333",
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || "";
            const value = context.raw as number;
            return `${label}: ${value}`;
          },
        },
      },
    },
  };

  return (
    <div className="chart-wrapper">
      <h2>Number of Raters</h2>
      <div className="chart-container">
        <Pie data={chartData} options={options} />
      </div>
    </div>
  );
};

export default NumberOfRatersChart;
