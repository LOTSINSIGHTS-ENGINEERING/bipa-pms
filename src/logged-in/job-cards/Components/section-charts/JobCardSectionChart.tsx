import React, { useState } from "react";
import { Bar } from "react-chartjs-2";
import "./JobCardSectionChart.scss"; // Make sure to import the SCSS file

const JobCardSectionChart = ({ data }) => {
  const [selectedSection, setSelectedSection] = useState("All");

  // Filter the data based on the selected section
  const filteredData =
    selectedSection === "All"
      ? data.jobCardCount
      : data.sections.map((section, index) =>
          section === selectedSection ? data.jobCardCount[index] : 0
        );

        const chartData = {
          labels: data.sections,
          datasets: [
            {
              label: "Job Cards",
              data: filteredData,
              backgroundColor: [
                "#4f4f4f", // Dark grey
                "#7e8c8d", // Soft blue
                "#6c9e6f", // Muted green
                "#dcdcdc", // Light grey
                "#c1a1a1", // Soft red
              ],
            },
          ],
        };
        

  return (
    <div>
      <h3 className="chart-title">Job Cards by Section</h3>
  
      <div className="filter-section">
        <label htmlFor="sectionFilter">Filter by Section:</label>
        <select
          id="sectionFilter"
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
        >
          <option value="All">All</option>
          {data.sections.map((section, index) => (
            <option key={index} value={section}>
              {section}
            </option>
          ))}
        </select>
      </div>
  
      <Bar data={chartData} options={{ responsive: true }} />
    </div>
  );
  
};

export default JobCardSectionChart;
