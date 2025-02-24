import React from "react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
} from "chart.js";

// Registering required components for Chart.js
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

interface ReviewStatusData {
  status: string;
  count: number;
}

interface ReviewStatusDistributionProps {
  data: ReviewStatusData[];
}

const ReviewStatusDistribution: React.FC<ReviewStatusDistributionProps> = ({
  data,
}) => {
  const colors = [
    "#003d3d", // Dark teal
    "#c81040", // Dark pink
    "#003a70", // Dark blue
    "#b38800", // Dark yellow
    "#3f0272", // Dark purple
    "#b45c0d", // Dark orange
  ];

  const chartData = {
    labels: data.map((item) => item.status),
    datasets: [
      {
        data: data.map((item) => item.count),
        backgroundColor: colors.slice(0, data.length),
        borderColor: colors.slice(0, data.length),
        borderWidth: 1,
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
    cutout: "50%", // Creates the donut effect
    elements: {
      arc: {
        borderWidth: 1,
      },
    },
  };

  return (
    <div className="chart-wrapper">
      <h2>Review Status Distribution</h2>
      <div className="chart-container">
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
};

export default ReviewStatusDistribution;
