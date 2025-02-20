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

  // Initialize default values for the statistics
  let userJobCards = [];
  let completedCount = 0;
  let inProgressCount = 0;
  let overdueCount = 0;

  if (userId) {
    // Filter job cards for the assigned user
    userJobCards = jobCards.filter((jobCard) => jobCard.assignedTo === userId);

    // Calculate statistics for the assigned user's job cards
    completedCount = userJobCards.filter(
      (jobCard) => jobCard.status === "Completed"
    ).length;

    inProgressCount = userJobCards.filter(
      (jobCard) => jobCard.status === "In Progress"
    ).length;

    overdueCount = userJobCards.filter(
      (jobCard) =>
        new Date(jobCard.dueDate) < new Date() && jobCard.status !== "Completed"
    ).length;
  }

  // Pagination logic

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
        data: totalJobcards
          ? [completedCount, inProgressCount, overdueCount]
          : [4, 3, 4],
        backgroundColor: ["#36a2eb", "#ffcd56", "#ff6384"],
        borderWidth: 0,
      },
    ],
  };

  // Options for the doughnut chart
  const options = {
    rotation: -90, // Start at the top
    circumference: 180, // Half circle
    plugins: {
      legend: {
        display: true, // Show the legend
        labels: {
          usePointStyle: true, // Use point style for circular labels
        },
      },
      tooltip: {
        enabled: true, // Enable tooltips
      },
    },
    cutout: "80%", // Adjust the size of the center cutout
  };

  // Calculate pagination indices
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const handlePageChange = (action) => {
    if (action === "prev" && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else if (action === "next" && endIndex < displayJobCards.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="uk-container uk-container-xlarge uk-margin-left">
      <div className="uk-grid uk-grid-small uk-margin" data-uk-grid>
        <div className="uk-width-1-1 uk-flex uk-flex-center">
          <div className="doughnut-chart-container small-chart">
            <Doughnut data={data} options={options} />
            <div className="chart-middle-text">
              Total
              <br />
              {totalJobcards}
            </div>
          </div>
        </div>
      </div>

      <div className="uk-width-1-1">
        <div className="uk-width-1-1">
          <table
            className="custom-table small-table"
            style={{ marginTop: "50px" }}>
            <thead>
              <tr>
                <th >Unique ID</th>
                <th>Task Description</th>
                <th >Status</th>
                <th >Date Issued</th>
                <th >Due Date</th>
                <th >Rating</th>
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
      </div>

      {/* Pagination */}
      <div className="pagination uk-flex uk-flex-center">
        <button
          className="pagination-button"
          onClick={() => handlePageChange("prev")}
          disabled={currentPage === 1}>
          Prev
        </button>
        <button
          className="pagination-button"
          onClick={() => handlePageChange("next")}
          disabled={endIndex >= displayJobCards.length}>
          Next
        </button>
      </div>
    </div>
  );
};

export default AssignedUserJobCardStats;
