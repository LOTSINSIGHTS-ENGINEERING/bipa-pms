import React from "react";
import "./RatingsOverview.scss";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

// Registering required components for Chart.js
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

interface RatingDataItem {
  category: string;
  score: number;
}

interface RatingsOverviewProps {
  data: RatingDataItem[];
}

const RatingsOverview: React.FC<RatingsOverviewProps> = ({ data }) => {
  const colors = [
    "#006e6e", // More vivid dark teal
    "#FEBE30",
    "#E1EFFA",
    "#ffb600", // More vivid dark yellow
    "#6a00a3", // More vivid dark purple
    "#c76a1e", // More vivid dark orange
  ];

  const chartData = {
    labels: data.map((item) => item.category),
    datasets: [
      {
        // Removing the label here
        data: data.map((item) => item.score),
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
        display: false, // Hide the legend completely
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw as number;
            // Return only the value (remove label part)
            return `${value.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: "#e5e5e5",
        },
      },
      y: {
        ticks: {
          color: "#333",
        },
        grid: {
          color: "#e5e5e5",
        },
      },
    },
  };

  return (
    <div className="chart-wrapper">
      <h2>Ratings Overview</h2>
      <div className="chart-container">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default RatingsOverview;
