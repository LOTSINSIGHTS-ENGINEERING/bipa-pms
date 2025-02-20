import React, { useState } from "react";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconButton, TextField } from "@mui/material";
import { OpenInNew } from "@mui/icons-material";

import "./TeamMemberJobCardTable.css"; // Import your custom CSS file
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { useAppContext } from "../../../../shared/functions/Context";

const SectionJobCardTable = ({
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
  const { api, store } = useAppContext();

  // Function to get display name from assignedToId

  console.log("team member in table", section);

  const filteredSections = section.filter((section) => {
    return section.name?.toLowerCase().includes(searchTerm.toLowerCase());
  });
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
  const sortedSection = [...filteredSections].sort((a, b) => {
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
    } else if (action === "next" && endIndex < section.length) {
      setCurrentPage(currentPage + 1);
    }
  };
  const fixedRowCount = 8; // Define a fixed number of rows
  const displayedJobCards = sortedSection.slice(startIndex, endIndex);
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
              <th className="header-cell">Division</th>
              <th className="header-cell">Options</th>
            </tr>
          </thead>
          {/* Table body */}
          <tbody>
            {sortedSection.slice(startIndex, endIndex).map((section) => (
              <tr key={section.id}>
                <td>{section.name}</td>
                <td>{getDivisionName(section.division)}</td>

                <td>
                  <IconButton
                    aria-label="view"
                    data-uk-tooltip="Delete"
                    onClick={() => onView(section)}
                    style={{
                      color: "black",
                      padding: "8px",
                      fontSize: "1rem",
                    }}>
                    <span uk-icon="trash"></span>
                  </IconButton>
                  <IconButton
                    aria-label="view"
                    data-uk-tooltip="Edit"
                    onClick={() => handleEdit(section)}
                    style={{
                      color: "black",
                      padding: "8px",
                      fontSize: "1rem",
                    }}>
                    <span uk-icon="pencil"></span>
                  </IconButton>
                </td>
              </tr>
            ))}
            {Array.from({ length: emptyRowsCount }).map((_, index) => (
              <tr key={`empty-${index}`}>
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
          disabled={endIndex >= section.length}>
          Next
        </button>
      </div>
    </div>
  );
};


export default SectionJobCardTable;
