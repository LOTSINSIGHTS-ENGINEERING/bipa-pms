import { faPencilAlt, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconButton } from "@mui/material";
import React, { useState } from "react";
import "./UnallocatedJobCardTable.css"; // Import your custom CSS file

const MaterialTable = ({
  materialList,
  status = "",
  handleEdit,
  onDeleteMaterial,
  defaultPage = 1,
  defaultItemsPerPage = 5,
  showActions = true, // New prop to control showing/hiding the Actions column
  showPagination=true
}) => {
  const [currentPage, setCurrentPage] = useState(defaultPage);
  const [itemsPerPage] = useState(defaultItemsPerPage);

  // Calculate pagination indices
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Get the current page items
  const currentItems = materialList.slice(startIndex, endIndex);

  // Function to handle page change
  const handlePageChange = (action) => {
    if (action === "prev" && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else if (action === "next" && endIndex < materialList.length) {
      setCurrentPage(currentPage + 1);
    }
  };
    const fixedRowCount = 4; // Define a fixed number of rows
    const displayedJobCards = currentItems.slice(startIndex, endIndex);
    const emptyRowsCount = fixedRowCount - displayedJobCards.length;


  return (
    <>
      <div style={{ height: "300px", overflowY: "auto" }}>
        {/* Fixed height with vertical scrolling */}
        <table className="custom-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Name</th>
              <th>Unit Cost</th>
              <th>Quantity</th>
              {showActions && status !== "Completed" && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {currentItems.map((material, index) => (
              <tr key={material.id}>
                <td>{startIndex + index + 1}</td>
                <td>{material.name}</td>
                <td>N$ {material.unitCost}</td>
                <td>{material.quantity}</td>
                {showActions && status !== "Completed" && (
                  <td>
                    <IconButton
                      aria-label="edit"
                      onClick={() => handleEdit(material)}
                      style={{
                        color: "black",
                        padding: "8px",
                        fontSize: "1rem",
                      }}>
                      <FontAwesomeIcon icon={faPencilAlt} />
                    </IconButton>
                    <IconButton
                      aria-label="delete"
                      onClick={(e) => onDeleteMaterial(e, material.id)}
                      style={{
                        color: "black",
                        padding: "8px",
                        fontSize: "1rem",
                      }}>
                      <FontAwesomeIcon icon={faTrashAlt} />
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showPagination && (
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
            disabled={endIndex >= currentItems.length}>
            Next
          </button>
        </div>
      )}
    </>
  );
};

export default MaterialTable;
