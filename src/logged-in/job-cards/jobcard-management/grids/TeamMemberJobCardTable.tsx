import React, { useState } from "react";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconButton, TextField } from "@mui/material";

import ArchiveIcon from "@mui/icons-material/Archive";
import "./TeamMemberJobCardTable.css"; // Import your custom CSS file
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { useAppContext } from "../../../../shared/functions/Context";

const TeamMemberJobCardTable = ({
  teamMembers,
  handleEdit,
  handleArchive,
  defaultPage = 1,
  defaultItemsPerPage = 5,
}) => {
  const [currentPage, setCurrentPage] = useState(defaultPage);
  const [itemsPerPage] = useState(defaultItemsPerPage);
  const [searchTerm, setSearchTerm] = useState("");

  // Calculate pagination indices
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const { api, store } = useAppContext();

  // Function to get display name from assignedToId

  const filteredTeamMembers = teamMembers.filter((teamMembers) => {
    return teamMembers.name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const sortedTeamMembers = [...filteredTeamMembers].sort((a, b) => {
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
    } else if (action === "next" && endIndex < teamMembers.length) {
      setCurrentPage(currentPage + 1);
    }
  };
  const fixedRowCount = 8; // Define a fixed number of rows
  const displayedJobCards = sortedTeamMembers.slice(startIndex, endIndex);
  const emptyRowsCount = fixedRowCount - displayedJobCards.length;

  return (
    <div className="people-tab-content">
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
        <table className="custom-table">
          {/* Table headers */}
          <thead>
            <tr>
              <th className="header-cell">Name</th>
              <th className="header-cell">Email</th>
              <th className="header-cell">Mobile Number</th>
              <th className="header-cell">City</th>
              <th className="header-cell">Options</th>
            </tr>
          </thead>
          {/* Table body */}
          <tbody>
            {sortedTeamMembers.slice(startIndex, endIndex).map((teamMember) => (
              <tr key={teamMember.id}>
                <td>{teamMember.name}</td>
                <td>{teamMember.email}</td>
                <td>{teamMember.mobileNumber}</td>
                <td>{teamMember.city}</td>
                <td>
                  <IconButton
                    aria-label="view"
                    data-uk-tooltip="Edit"
                    onClick={() => handleEdit(teamMember)}
                    style={{
                      color: "black",
                      padding: "8px",
                      fontSize: "1rem",
                    }}>
                    <span uk-icon="pencil"></span>
                  </IconButton>
                  <IconButton
                    aria-label="archive"
                    data-uk-tooltip="Archive"
                    onClick={() => handleArchive(teamMember)}
                    style={{
                      color: "black",
                      padding: "8px",
                      fontSize: "1rem",
                    }}>
                    <ArchiveIcon />
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
          disabled={endIndex >= teamMembers.length}>
          Next
        </button>
      </div>
    </div>
  );
};


export default TeamMemberJobCardTable;
