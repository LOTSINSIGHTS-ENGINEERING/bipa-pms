import React, { useState } from "react";
import { faExternalLinkAlt, faSearch, faStar, faStarHalf } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconButton } from "@mui/material";
import { useAppContext } from "../../../shared/functions/Context";
import "./UnallocatedJobCardTable.css"; // Import your custom CSS file

import RatingStars from "../Components/Rating";
import { formatDate, formatTime} from "../../shared/utils/utils";


const JobCardTableOnCreate = ({
  jobCards,
  handleEdit,
  onView,
  defaultPage = 1,
  defaultItemsPerPage = 5,
  showActions = true,
  showRatings = true, // Add a new prop to conditionally show/hide the Actions column
  timeSinceIssuanceArray = [], // Provide a default empty array
}) => {
  const [currentPage, setCurrentPage] = useState(defaultPage);
  const [itemsPerPage] = useState(defaultItemsPerPage);
  const [searchTerm, setSearchTerm] = useState("");

  // Calculate pagination indices
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const { api, store } = useAppContext();

  // Function to get display name from assignedToId
  const getDisplayName = (assignedToId) => {
    const user = store.user.all.find(
      (user) => user.asJson.uid === assignedToId
    );
    return user ? user.asJson.displayName : "Unknown";
  };

  const getDivisionName = (divisionId) => {
    const division = store.jobcard.division.all.find(
      (unit) => unit.asJson.id === divisionId
    );
    return division ? division.asJson.name : "Unknown";
  };

  const getSectionName = (secId) => {
    const section = store.jobcard.section.all.find(
      (section) => section.asJson.id === secId
    );
    return section ? section.asJson.name : "Unknown";
  };

  const filteredJobCards = jobCards.filter((jobCard) => {
    return (
      jobCard.uniqueId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formatDate(jobCard.dateIssued)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      formatTime(jobCard.dateIssued)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      jobCard.urgency.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getDivisionName(jobCard.division)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      getSectionName(jobCard.section)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      getDisplayName(jobCard.assignedTo)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      jobCard.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const sortedJobCards = [...filteredJobCards].sort((a, b) => {
    // Convert dateIssued strings to Date objects for comparison
    const dateA = new Date(a.dateIssued).getTime();
    const dateB = new Date(b.dateIssued).getTime();

    // Compare the dates for sorting: most recent first
    return dateB - dateA;
  });

  // Function to handle page change
  const handlePageChange = (action) => {
    if (action === "prev" && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else if (action === "next" && endIndex < jobCards.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const fixedRowCount = 7; // Define a fixed number of rows
  const displayedJobCards = sortedJobCards.slice(startIndex, endIndex);
  const emptyRowsCount = fixedRowCount - displayedJobCards.length;

  return (
    <div
      className="people-tab-content ">
      <div className="top-bar">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by Job Card No, Date, Assigned To, etc."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="custom-input"
          />
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
        </div>
      </div>
      <div className="table-wrapper">
        {" "}
        <table className="custom-table">
          <thead>
            <tr>
              <th className="header-cell">Job Card No</th>
              <th className="header-cell">Date logged</th>
              <th className="header-cell">Time logged</th>
              <th className="header-cell">Urgency</th>
              <th className="header-cell">Section</th>
              <th className="header-cell">Division</th>
              <th className="header-cell">Assigned To</th>
              <th className="header-cell">Status</th>
              {showRatings && <th className="header-cell">Customer Rating</th>}
              {showActions && <th className="header-cell">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {displayedJobCards.map((jobCard) => (
              <tr key={jobCard.id}>
                <td>{jobCard.uniqueId}</td>
                <td>{formatDate(jobCard.dateIssued)}</td>
                <td>{formatTime(jobCard.dateIssued)}</td>
                <td>{jobCard.urgency}</td>
                <td>{getDivisionName(jobCard.division)}</td>
                <td>{getSectionName(jobCard.section)}</td>
                <td>{getDisplayName(jobCard.assignedTo)}</td>
                <td>{jobCard.status}</td>
                {showRatings && (
                  <td>
                    <RatingStars rating={jobCard.clientRating} />
                  </td>
                )}
                {showActions && (
                  <td>
                    <IconButton
                      aria-label="Rate Team"
                      data-uk-tooltip="Rate Client"
                      onClick={() => onView(jobCard)}
                      style={{
                        color: "black",
                        padding: "8px",
                        fontSize: "1rem",
                      }}>
                      <FontAwesomeIcon icon={faExternalLinkAlt} />
                    </IconButton>
                  </td>
                )}
              </tr>
            ))}
            {Array.from({ length: emptyRowsCount }).map((_, index) => (
              <tr key={`empty-${index}`}>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                {showRatings && <td>&nbsp;</td>}
                {showActions && <td>&nbsp;</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
     
      {/* Pagination */}
      <div className="pagination">
        <button
          className="pagination-button"
          onClick={() => handlePageChange("prev")}
          disabled={currentPage === 1}>
          Prev
        </button>
        <button
          className="pagination-button"
          onClick={() => handlePageChange("next")}
          disabled={endIndex >= jobCards.length}>
          Next
        </button>
      </div>
    </div>
  );
};

export default JobCardTableOnCreate;
