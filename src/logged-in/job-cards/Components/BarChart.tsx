import React from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import "./Bar.scss"; // Assuming you have a separate CSS file for styling

const BarChart = ({ title, data, labels, backgroundColors }) => {
  const chartData = {
    labels: labels,
    datasets: [
      {
        label: "Job Cards",
        data: data,
        backgroundColor: backgroundColors,
        borderRadius: {
          topLeft: 10,
          topRight: 10,
          bottomLeft: 0,
          bottomRight: 0,
        },
        // borderSkipped: "bottom", // Only apply the border radius to the top corners
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false, // Hide the legend
      },
    },
    scales: {
      x: {
        grid: {
          display: false, // Remove the grid lines on the x-axis
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          display: false, // Remove the grid lines on the y-axis
        },
        ticks: {
          stepSize: 5, // Adjust this based on your range
        },
      },
    },
  };

  return (
    <div className="chart-container uk-card uk-card-default uk-card-body uk-border-radius">
      <div className="tittle">
        {" "}
        <h2 className="uk-text-bold">{title}</h2>
      </div>

      <Bar data={chartData} options={options} />
    </div>
  );
};

export default BarChart;
