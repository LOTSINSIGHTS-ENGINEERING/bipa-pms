import React, { useState } from "react";
import "uikit/dist/css/uikit.min.css";
import ReactPaginate from "react-paginate";
import { Doughnut } from "react-chartjs-2";
import "chart.js/auto"; // Ensure Chart.js is automatically registered
import "./assignUser.css"; // Import your custom styles

const AssignedUserJobCardStats = ({ userId, userName, jobCards }) => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;

  // Filter job cards for the assigned user
  const userJobCards = jobCards.filter(
    (jobCard) => jobCard.assignedTo === userId
  );

  // Calculate statistics for the assigned user's job cards
  const completedCount = userJobCards.filter(
    (jobCard) => jobCard.status === "Completed"
  ).length;

  const inProgressCount = userJobCards.filter(
    (jobCard) => jobCard.status === "In Progress"
  ).length;

  const overdueCount = userJobCards.filter(
    (jobCard) =>
      new Date(jobCard.dueDate) < new Date() && jobCard.status !== "Completed"
  ).length;

  // Pagination logic
  const pageCount = Math.ceil(userJobCards.length / itemsPerPage);
  const displayJobCards = userJobCards.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  // Get the length of userJobCards
  const totalJobcards = userJobCards.length;

  // Data for the doughnut chart
  const data = {
    labels: ["Completed", "In Progress", "Overdue"],
    datasets: [
      {
        data: [completedCount, inProgressCount, overdueCount],
        backgroundColor: ["#36a2eb", "#ffcd56", "#ff6384"],
        borderWidth: 0,
      },
    ],
  };

//   // Options for the doughnut chart
//   const options = {
//     rotation: -90, // Start at the top
//     circumference: 180, // Half circle
//     plugins: {
//       legend: {
//         display: true, // Show the legend
//         // position: "bottom",
//       },
//       tooltip: {
//         enabled: true, // Enable tooltips
//       },
//     },
//     cutout: "70%", // Adjust the size of the center cutout
//   };
const options = {
  plugins: {
    legend: {
      display: true,
      position: "bottom", // or 'top', 'left', 'right', 'chartArea', 'center'
      labels: {
        usePointStyle: true,
        boxWidth: 10,
      },
    },
    tooltip: {
      enabled: true,
    },
  },
  cutout: "70%",
} as const;


  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
  };

  return (
    <div className="uk-container uk-container-xlarge uk-margin left">
      <div className="uk-grid uk-grid-small uk-margin" data-uk-grid>
        <div className="uk-width-1-2">
          <div className="doughnut-chart-container">
            <Doughnut data={data} options={options} />
            <div className="chart-middle-text">
              Total
              <br />
              {totalJobcards}
            </div>
          </div>
          <div className="stats">
            <p>Total Job Cards: {totalJobcards}</p>
          </div>
        </div>

        <table className="custom-table" style={{ marginTop: "50px" }}>
          <thead>
            <tr>
              <th>Unique ID</th>
              <th>Task Description</th>
              <th>Status</th>
              <th>Date Issued</th>
              <th>Due Date</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            {displayJobCards.map((jobCard) => (
              <tr key={jobCard.id}>
                <td>{jobCard.uniqueId}</td>
                <td>{jobCard.taskDescription}</td>
                <td>{jobCard.status}</td>
                <td>{new Date(jobCard.dateIssued).toLocaleDateString()}</td>
                <td>{new Date(jobCard.dueDate).toLocaleDateString()}</td>
                <td>{jobCard.rating || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ReactPaginate
        pageCount={pageCount}
        onPageChange={handlePageClick}
        containerClassName={"pagination"}
        activeClassName={"active"}
      />
    </div>
  );
};

export default AssignedUserJobCardStats;
