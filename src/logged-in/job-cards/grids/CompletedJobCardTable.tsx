import React, { useEffect, useState } from "react";
import {
  faBell,
  faCheck,
  faComment,
  faCopy,
  faExternalLinkAlt,
  faStar,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconButton } from "@mui/material";
import { useAppContext } from "../../../shared/functions/Context";
import { OpenInNew } from "@mui/icons-material";
import Rating from "../Components/Rating";

// import Rating from "../Components/Rating";
import "./UnallocatedJobCardTable.css"; // Import your custom CSS file
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import RatingStars from "../Components/Rating";
import { formatDate, formatTime, } from "../../shared/utils/utils";

const CompletedJobCardTable = ({
  jobCards,

  onView,
  onRating,
  defaultPage = 1,
  defaultItemsPerPage = 5,
  timeSinceIssuanceArray = [],
  ratings,
  handleRatingChange,
  comment,
  setComment,
  commentIndex,
  setCommentIndex,
  handleCommentChange,
  handleCommentSubmit,
  handleCancel,
  onDuplicate,
}) => {
  const [currentPage, setCurrentPage] = useState(defaultPage);
  const [itemsPerPage] = useState(defaultItemsPerPage);

  // Calculate pagination indices
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const { api, store } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
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
      jobCard.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getDisplayName(jobCard.artesian).toLowerCase()
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
   const fixedRowCount = 8; // Define a fixed number of rows
   const displayedJobCards = sortedJobCards.slice(startIndex, endIndex);
   const emptyRowsCount = fixedRowCount - displayedJobCards.length;

  return (
    <div className="people-tab-content ">
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
          {/* Table headers */}
          <thead>
            <tr>
              <th className="header-cell">Job Card No</th>
              <th className="header-cell">Date logged</th>
              <th className="header-cell">Time logged</th>
              <th className="header-cell">Due Date</th>
              <th className="header-cell">Time Due</th>
              <th className="header-cell">Assigned To</th>
              <th className="header-cell">Artisan/Foreman</th>
              <th className="header-cell">Rating</th>
              <th className="header-cell">Status</th>
              <th className="header-cell">Comment</th>
              <th className="header-cell">Actions</th>
            </tr>
          </thead>
          {/* Table body */}
          <tbody>
            {sortedJobCards
              .slice(startIndex, endIndex)
              .map((jobCard, index) => (
                <tr key={jobCard.id}>
                  <td>{jobCard.uniqueId}</td>
                  <td>{formatDate(jobCard.dateIssued)}</td>
                  <td>{formatTime(jobCard.dateIssued)}</td>
                  <td>{formatDate(jobCard.dueDate)}</td>
                  <td>{formatTime(jobCard.dueDate)}</td>
                  <td>{getDisplayName(jobCard.assignedTo)}</td>
                  <td>{getDisplayName(jobCard.artesian)}</td>
                  <td>
                    <RatingStars rating={jobCard.teamRating} />
                  </td>
                  <td>{jobCard.status}</td>
                  <td>
                    {commentIndex === jobCard.id ? (
                      <div>
                        <textarea
                          value={comment}
                          onChange={(e) => handleCommentChange(e)}
                          placeholder="Enter your comment..."
                        />
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-start",
                          }}>
                          <IconButton
                            onClick={() => handleCommentSubmit(jobCard.id)}
                            style={{ padding: "4px", fontSize: "0.8rem" }}>
                            <FontAwesomeIcon icon={faCheck} />
                          </IconButton>
                          <IconButton
                            onClick={() => handleCancel(jobCard.id)}
                            style={{ padding: "4px", fontSize: "0.8rem" }}>
                            <FontAwesomeIcon icon={faTimes} />
                          </IconButton>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center" }}>
                        {jobCard.comment && (
                          <span style={{ marginRight: "8px" }}>
                            {jobCard.comment}
                          </span>
                        )}
                        <IconButton
                          aria-label="comment"
                          data-uk-tooltip="Add comment"
                          onClick={() => setCommentIndex(jobCard.id)}
                          style={{
                            color: "black",
                            padding: "8px",
                            fontSize: "1rem",
                          }}>
                          <FontAwesomeIcon icon={faComment} />
                        </IconButton>
                      </div>
                    )}
                  </td>
                  <td>
                    <IconButton
                      aria-label="view"
                      onClick={() => onView(jobCard)}
                      style={{
                        color: "black",
                        padding: "8px",
                        fontSize: "1rem",
                      }}>
                      <FontAwesomeIcon icon={faExternalLinkAlt} />
                    </IconButton>
                    <IconButton
                      aria-label="duplicate"
                      data-uk-tooltip="Duplicate Job Card"
                      onClick={() => onDuplicate(jobCard)}
                      style={{
                        color: "black",
                        padding: "8px",
                        fontSize: "1rem",
                      }}>
                      <FontAwesomeIcon icon={faCopy} />
                    </IconButton>
                    <IconButton
                      aria-label="Rate Team"
                      data-uk-tooltip="Rate Team"
                      onClick={() => onRating(jobCard)}
                      style={{
                        color: "black",
                        padding: "8px",
                        fontSize: "1rem",
                      }}>
                      <FontAwesomeIcon icon={faStar} />
                    </IconButton>
                  </td>
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
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
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

export default CompletedJobCardTable;
