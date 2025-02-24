import React from "react";
import "./Department.css";
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
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

interface DataItem {
  department: string;
  averageScore: number;
}

interface AverageScoresByDepartmentProps {
  data: DataItem[];
}

const AverageScoresByDepartment: React.FC<AverageScoresByDepartmentProps> = ({
  data,
}) => {
  // Fully dark colors for the bars
  const colors = [
    "#004d4d", // Dark teal
    "#b30047", // Dark pink
    "#002e6d", // Dark blue
    "#9e6a00", // Dark yellow
    "#3d007d", // Dark purple
    "#8c4d0d", // Dark orange
  ];

  const borderColor = colors.map((color) => color);

  const chartData = {
    labels: data.map((item) => item.department),
    datasets: [
      {
        // label: "Average Score",
        data: data.map((item) => item.averageScore),
        backgroundColor: colors.slice(0, data.length),
        borderColor: borderColor.slice(0, data.length),
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
        ticks: {
          color: "#333",
        },
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
      <h2>Average Scores by Department</h2>
      <div className="chart-container">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default AverageScoresByDepartment;
