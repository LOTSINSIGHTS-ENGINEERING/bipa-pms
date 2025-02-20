import React, { useState } from "react";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconButton, TextField } from "@mui/material";
import { OpenInNew } from "@mui/icons-material";

import "./TeamMemberJobCardTable.css"; // Import your custom CSS file
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { useAppContext } from "../../../../shared/functions/Context";

const DivisionJobCardTable = ({
  section,
  handleEdit,
  onView,
  defaultPage = 1,
  defaultItemsPerPage = 5,
}) => {
  const [currentPage, setCurrentPage] = useState(defaultPage);
  const [itemsPerPage] = useState(defaultItemsPerPage);
  const [searchTerm, setSearchTerm] = useState("");

  // Calculate pagination indices
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Filter and sort sections based on search and other criteria
  const filteredSections = section.filter((section) =>
    section.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedSection = [...filteredSections].sort((a, b) => {
    // Assuming `dateIssued` for sorting; adjust as needed
    const dateA = new Date(a.dateIssued).getTime();
    const dateB = new Date(b.dateIssued).getTime();
    return dateB - dateA;
  });

  // Handle pagination
  const handlePageChange = (action) => {
    if (action === "prev" && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else if (action === "next" && endIndex < section.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const fixedRowCount = 8;
  const displayedJobCards = sortedSection.slice(startIndex, endIndex);
  const emptyRowsCount = fixedRowCount - displayedJobCards.length;

  return (
    <div className="people-tab-content">
      {/* Search */}
      <div className="top-bar">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by Division Name, Owner, etc."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="custom-input"
          />
        </div>
      </div>
      {/* Table */}
      <div className="table-wrapper">
        <table className="custom-table">
          <thead>
            <tr>
              <th className="header-cell">Name</th>
              <th className="header-cell">Owner</th>
              <th className="header-cell">Description</th>
              <th className="header-cell">Active</th>
              <th className="header-cell">Options</th>
            </tr>
          </thead>
          <tbody>
            {displayedJobCards.map((section) => (
              <tr key={section.id}>
                <td>{section.name}</td>
                <td>{section.divisionOwner}</td>
                <td>{section.description}</td>
                <td>{section.isActive ? "Yes" : "No"}</td>
                <td>
                  <IconButton
                    aria-label="edit"
                    data-uk-tooltip="Edit"
                    onClick={() => handleEdit(section)}
                    style={{
                      color: "black",
                      padding: "8px",
                      fontSize: "1rem",
                    }}
                  >
                    <span uk-icon="pencil"></span>
                  </IconButton>
                </td>
              </tr>
            ))}
            {Array.from({ length: emptyRowsCount }).map((_, index) => (
              <tr key={`empty-${index}`}>
                <td colSpan={5}>&nbsp;</td>
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
          disabled={currentPage === 1}
        >
          Prev
        </button>
        <button
          className="pagination-button"
          onClick={() => handlePageChange("next")}
          disabled={endIndex >= section.length}
        >
          Next
        </button>
      </div>
    </div>
  );
};


export default DivisionJobCardTable;
