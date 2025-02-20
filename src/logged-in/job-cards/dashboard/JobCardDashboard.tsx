import React, { useEffect, useState } from "react";
import "./JobCardDashboard.scss";
import JobCardStats from "../Components/Stats-card/JobCardStats";
import JobCardSectionChart from "../Components/section-charts/JobCardSectionChart";
import JobCardProgress from "../Components/jobcard-progress/JobCardProgress";
import JobCardLineChart from "../Components/jobcard-Line-chart/JobCardLineChart";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../../shared/functions/Context";
import useBackButton from "../../../shared/hooks/useBack";
import useTitle from "../../../shared/hooks/useTitle";
import NewJobCardReports from "./NewJobcardsReports";
import DashboardCard from "../Components/dashboard-card/DashboardCard";
import Toolbar from "../../shared/components/toolbar/Toolbar";
import Tabs from "../Components/tabs-new/JobCardTab";

const JobCardDashboard = () => {
  const navigate = useNavigate();
  const { api, store } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<string>("dashboard-tab"); // Manage selected tab state

  const tabs = [
    { id: "dashboard-tab", name: "Dashboard" },
    { id: "reports-tab", name: "Reports" },
  ];
  const [lineChartData, setLineChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Pending",
        data: [],
        borderColor: "#ffc107",
        fill: false,
        tension: 0.4,
      },
      {
        label: "Assigned",
        data: [],
        borderColor: "#007bff",
        fill: false,
        tension: 0.4,
      },
      {
        label: "Completed",
        data: [],
        borderColor: "#28a745",
        fill: false,
        tension: 0.4,
      },
    ],
  });

  useTitle("Dashboard");
  useBackButton();

  const totalJobcards = store.jobcard.jobcard.all.length;
  const pendingJobcards = store.jobcard.jobcard.all.filter(
    (job) => job.asJson.status === "Not Started"
  );
  const totalPendingJobcards = pendingJobcards.length;

  const completedJobcards = store.jobcard.jobcard.all.filter(
    (job) => job.asJson.status === "Completed"
  );
  const totalCompletedJobcards = completedJobcards.length;

  const AssignedJobcards = store.jobcard.jobcard.all.filter(
    (job) => job.asJson.status === "Assigned"
  );
  const totalAssignedJobcards = AssignedJobcards.length;

  // Declare the data directly in the dashboard
  const stats = {
    total: totalJobcards,
    pending: totalPendingJobcards,
    assigned: totalAssignedJobcards,
    completed: totalCompletedJobcards,
  };

  const sections = store.jobcard.section.all.map((section) => section.asJson);
  const jobcards = store.jobcard.jobcard.all.map((jobcard) => jobcard.asJson);

  const sectionData = {
    sections: sections.map((section) => section.name),
    jobCardCount: sections.map((section) => {
      return store.jobcard.jobcard.all.filter(
        (jobCard) => jobCard.asJson.section === section.id
      ).length;
    }),
  };

  const progressData = {
    pending: totalPendingJobcards,
    assigned: totalAssignedJobcards,
    completed: totalCompletedJobcards,
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await api.jobcard.jobcard.getAll();
        await api.jobcard.section.getAll();
        await api.jobcard.division.getAll();
        await api.user.getAll();

        // Example of updating line chart data dynamically
        const newLabels = [
          ...lineChartData.labels,
          `Week ${lineChartData.labels.length + 1}`,
        ];
        const newPendingData = [
          ...lineChartData.datasets[0].data,
          totalPendingJobcards,
        ];
        const newAssignedData = [
          ...lineChartData.datasets[1].data,
          totalAssignedJobcards,
        ];
        const newCompletedData = [
          ...lineChartData.datasets[2].data,
          totalCompletedJobcards,
        ];

        // Update state with new data
        setLineChartData({
          labels: newLabels,
          datasets: [
            { ...lineChartData.datasets[0], data: newPendingData },
            { ...lineChartData.datasets[1], data: newAssignedData },
            { ...lineChartData.datasets[2], data: newCompletedData },
          ],
        });

        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    };
    loadData();
  }, [
    api.jobcard,
    api.user,
    totalPendingJobcards,
    totalAssignedJobcards,
    totalCompletedJobcards,
  ]); // Dependencies to trigger the effect

  return (
    <div className="dashboard-container">
      <Toolbar
        leftControls={
          <Tabs
            tabs={tabs}
            selectedTab={selectedTab}
            setSelectedTab={setSelectedTab}
          />
        }
        rightControls={<></>}
      />

      {selectedTab === "dashboard-tab" && (
        <>
          <div
            className="uk-grid-small uk-grid-match uk-child-width-expand@s uk-child-width-expand@m uk-margin"
            data-uk-grid
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "20px",
              paddingRight: "20px",
              paddingLeft: "20px", // Added left padding
            }}
          >
            
            <DashboardCard
              variant="primary"
              icon="📄"
              label="Total Job Cards"
              value={stats.total}
              tooltip="Total job cards"
            />
            <DashboardCard
              variant="warning"
              icon="⏳"
              label="Pending Job Cards"
              value={stats.pending}
              tooltip="Pending job cards"
            />
            <DashboardCard
              variant="success"
              icon="🛠️"
              label="Assigned Job Cards"
              value={stats.assigned}
              tooltip="Assigned job cards"
            />
            <DashboardCard
              variant="success"
              icon="✅"
              label="Completed Job Cards"
              value={stats.completed}
              tooltip="Completed job cards"
            />
          </div>

          {/* Grid for job card statistics */}

          {/* Additional Dashboard Components */}
          <div className="additional-components">
            <div className="component-item">
              <JobCardSectionChart data={sectionData} />
            </div>
            <div className="component-item">
              <JobCardProgress jobCards={jobcards} sections={sections} />
            </div>
            <div className="component-item">
              <h3 className="chart-title">Job Card Aging Trend</h3>

              <JobCardLineChart data={lineChartData} />
            </div>
          </div>
        </>
      )}

      {selectedTab === "reports-tab" && <NewJobCardReports />}
    </div>
  );
};

export default JobCardDashboard;
