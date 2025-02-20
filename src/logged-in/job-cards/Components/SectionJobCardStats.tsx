import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto"; // Import Chart.js
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faClock,
  faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";

const SectionJobCardStats = ({ sections, jobCards }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    // Filter sections that have job cards
    const sectionsWithJobCards = sections.filter((section) =>
      jobCards.some((jobCard) => jobCard.section === section.id)
    );

    const sectionLabels = sectionsWithJobCards.map((section) => section.name);
    const totalJobCardsData = sectionsWithJobCards.map((section) => {
      const sectionJobCards = jobCards.filter(
        (jobCard) => jobCard.section === section.id
      );
      return sectionJobCards.length;
    });
    const completedCountData = sectionsWithJobCards.map((section) => {
      const sectionJobCards = jobCards.filter(
        (jobCard) => jobCard.section === section.id
      );
      return sectionJobCards.filter((jobCard) => jobCard.status === "Completed")
        .length;
    });
    const inProgressCountData = sectionsWithJobCards.map((section) => {
      const sectionJobCards = jobCards.filter(
        (jobCard) => jobCard.section === section.id
      );
      return sectionJobCards.filter(
        (jobCard) => jobCard.status === "In Progress"
      ).length;
    });
    const overdueCountData = sectionsWithJobCards.map((section) => {
      const sectionJobCards = jobCards.filter(
        (jobCard) => jobCard.section === section.id
      );
      return sectionJobCards.filter(
        (jobCard) =>
          new Date(jobCard.dueDate) < new Date() &&
          jobCard.status !== "Completed"
      ).length;
    });

    // Create the chart
    const chart = new Chart(chartRef.current, {
      type: "bar", // Change the type to "bar"
      data: {
        labels: sectionLabels,
        datasets: [
          {
            label: "Total Job Cards",
            data: totalJobCardsData,
            backgroundColor: "rgba(54, 162, 235, 0.6)",
          },
          {
            label: "Completed",
            data: completedCountData,
            backgroundColor: "rgba(75, 192, 192, 0.6)",
          },
          {
            label: "In Progress",
            data: inProgressCountData,
            backgroundColor: "rgba(255, 206, 86, 0.6)",
          },
          {
            label: "Overdue",
            data: overdueCountData,
            backgroundColor: "rgba(255, 99, 132, 0.6)",
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "Section Job Card Stats",
          },
        },
      },
    });

    // Cleanup function to destroy the chart when the component unmounts
    return () => {
      chart.destroy();
    };
  }, [sections, jobCards]);

  return (
     <div
      className="uk-container uk-container-xlarge uk-margin-top uk-card-default uk-card-body">  <div
      className="uk-container uk-container-xlarge  uk-card-body"
      style={{ width: "1500px" }}>
      <canvas ref={chartRef}></canvas>
    </div></div>
  
  );
};

export default SectionJobCardStats;
