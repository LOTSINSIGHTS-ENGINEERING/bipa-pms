import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import MonthFilter from "./MonthFilter";
import "chart.js/auto";
import "./Bar.scss"; // Assuming you have a separate CSS file for styling

const BarChart = () => {
  const [data, setData] = useState({
    total: 100,
    pending: 30,
    completed: 60,
    overdue: 10,
  });
  const [selectedMonth, setSelectedMonth] = useState("01");

  useEffect(() => {
  
    setData({
      total: Math.floor(Math.random() * 100),
      pending: Math.floor(Math.random() * 50),
      completed: Math.floor(Math.random() * 80),
      overdue: Math.floor(Math.random() * 20),
    });
  }, [selectedMonth]);

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
  };

  const chartData = {
    labels: ["Total Job Cards", "Pending", "Completed", "Overdue"],
    datasets: [
      {
        label: "Job Cards",
        data: [data.total, data.pending, data.completed, data.overdue],
        backgroundColor: [
          "#007bff", // Blue for Total Job Cards
          "#ffc107", // Yellow for Pending
          "#28a745", // Green for Completed
          "#dc3545", // Red for Overdue
        ],
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
      },
    },
  };

  return (
    <div className="chart-container uk-card uk-card-default uk-card-body uk-border-radius">
      <h2>Job Card Status</h2>
      <div className="filter-container">
        <MonthFilter
          selectedMonth={selectedMonth}
          onMonthChange={handleMonthChange}
        />
      </div>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default BarChart;
