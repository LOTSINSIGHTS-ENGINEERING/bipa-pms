import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import "./SparklineChart.scss"; // Assuming you have a separate CSS file for styling

const SparklineChart = ({ sectionId, jobcards }) => {
  const [filter, setFilter] = useState("weekly");
  const [filteredJobCards, setFilteredJobCards] = useState([]);

  console.log("filtered job cards in here ", filteredJobCards);

  // Function to filter job cards by section ID
  const filterJobCardsBySection = (sectionId, jobcards) => {
    const currentSectionJobCards = jobcards.filter(
      (j) => j.asJson.section === sectionId
    );

    console.log("filtered jobcards in here ", currentSectionJobCards);

    return currentSectionJobCards;
  };

  // Function to group job cards by week and sum their costs
  const groupJobCardsByWeek = (jobCards) => {
    const groupedData = [0, 0, 0, 0]; // Assume 4 weeks for simplicity
    jobCards.forEach((jobCard) => {
      const jobDate = new Date(jobCard.asJson.dueDate);
      const week = Math.floor(jobDate.getDate() / 7); // Rough estimate of the week number
      groupedData[week] += jobCard.asJson.jobcardCost;
    });
    return groupedData;
  };

  // Function to group job cards by month and sum their costs
  const groupJobCardsByMonth = (jobCards) => {
    const groupedData = Array(12).fill(0); // 12 months in a year
    jobCards.forEach((jobCard) => {
      const jobDate = new Date(jobCard.asJson.dueDate);
      const month = jobDate.getMonth(); // Get month index (0-11)
      groupedData[month] += jobCard.asJson.jobcardCost;
    });

    const currentMonth = new Date().getMonth();
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const labels = [
      monthNames[currentMonth],
      monthNames[(currentMonth + 1) % 12],
      monthNames[(currentMonth + 2) % 12],
      monthNames[(currentMonth + 3) % 12],
    ];

    return { data: groupedData.slice(currentMonth, currentMonth + 4), labels };
  };

  useEffect(() => {
    const result = filterJobCardsBySection(sectionId, jobcards);
    setFilteredJobCards(result);
  }, [sectionId, jobcards]);

  const weeklyData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "Cost",
        data: groupJobCardsByWeek(filteredJobCards),
        borderColor: "blue",
        borderWidth: 2,
        fill: false,
        pointRadius: 0, // Remove dots on points
        tension: 0.4, // Smooth lines
      },
    ],
  };

  const monthlyDataResult = groupJobCardsByMonth(filteredJobCards);
  const monthlyData = {
    labels: monthlyDataResult.labels,
    datasets: [
      {
        label: "Cost",
        data: monthlyDataResult.data,
        borderColor: "green",
        borderWidth: 2,
        fill: false,
        pointRadius: 0, // Remove dots on points
        tension: 0.4, // Smooth lines
      },
    ],
  };

  const data = filter === "weekly" ? weeklyData : monthlyData;

  const options = {
    scales: {
      x: {
        title: {
          display: true,
          text: filter === "weekly" ? "Weeks" : "Months",
        },
      },
      y: {
        title: {
          display: true,
          text: "Cost ($)",
        },
        ticks: {
          callback: function (value) {
            return `${value / 1000}k`;
          },
          stepSize: 5000,
          min: 0,
          max: 10000,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function (context) {
            return `$${context.raw}`;
          },
        },
      },
    },
  };

  return (
    <div className="sparkline-chart-container uk-card uk-card-default uk-card-body">
      <div className="filter">
        <button
          className={filter === "weekly" ? "active" : ""}
          onClick={() => setFilter("weekly")}>
          Weekly
        </button>
        <button
          className={filter === "monthly" ? "active" : ""}
          onClick={() => setFilter("monthly")}>
          Monthly
        </button>
      </div>
      <div className="sparkline-chart">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default SparklineChart;
