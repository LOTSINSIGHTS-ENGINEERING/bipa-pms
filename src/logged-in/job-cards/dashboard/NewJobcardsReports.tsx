import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../../shared/functions/Context";
import { useEffect, useMemo, useState } from "react";
import useBackButton from "../../../shared/hooks/useBack";
import useTitle from "../../../shared/hooks/useTitle";
import { IJobCard } from "../../../shared/models/job-card-model/Jobcard";
import showModalFromId from "../../../shared/functions/ModalShow";
import MODAL_NAMES from "../../dialogs/ModalName";
import { LoadingEllipsis } from "../../../shared/components/loading/Loading";
import ErrorBoundary from "../../../shared/components/error-boundary/ErrorBoundary";
import JobCardGridTabs from "./JobCardGridTabs";
import SectionJobCardStats from "../Components/SectionJobCardStats";
import AssignedUserJobCardStats from "../Components/AssignedUserJobCardStats";
import MonthFilter from "../Components/MonthFilter";
import "./Reports.scss";
import UserStats from "../Components/UserStats";
import SingleSelect from "./Select";
import { IOption } from "../../../shared/components/single-select/SingleSelect";
import Toolbar from "../../shared/components/toolbar/Toolbar";
import DashboardTabs from "./DashboardTabs";
import pdfMake from "pdfmake/build/pdfmake";
import { TDocumentDefinitions } from "pdfmake/interfaces";
import JobCardChart from "./JobCardChart"; // Import chart component
import { getBase64ImageFromURL } from "../../../shared/functions/scorecard-pdf/ImageLoader";
import ButtonSecondary from "../create-jobcard/ButtonSecondary";

const NewJobCardReports = observer(() => {
  const navigate = useNavigate();
  const { api, store } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("reports");
  const [selectedFilter, setSelectedFilter] = useState("");
  const [selectedFilterId, setSelectedFilterId] = useState(null);

  useTitle("Reports");
  useBackButton();

  const me = store.auth.meJson;
  const allJobCards = store.jobcard.jobcard.all.map(
    (jobCard) => jobCard.asJson
  );
  const users = store.user.all.map((u) => u.asJson);
  const userOptions: IOption[] = useMemo(
    () =>
      users.map((bu) => ({
        label: bu.displayName || "",
        value: bu.uid,
      })),
    [users]
  );
  const sections = store.jobcard.section.all.map((section) => section.asJson);
  const Divisions = store.jobcard.division.all.map(
    (division) => division.asJson
  );
  const sectionOptions = useMemo(
    () =>
      sections.map((section) => ({
        label: section.name,
        value: section.id,
      })),
    [sections]
  );

  const handleFilterChange = (filterType: string) => {
    setSelectedFilter(filterType);
    setSelectedFilterId(null);
  };
  const handleFilterSelect = (id: any) => {
    setSelectedFilterId(id);
  };

  const getSectionName = (sectionId: any) => {
    const section = sections.find((section) => section.id === sectionId);
    return section ? section.name : "Unknown Section";
  };

  const getDivisionName = (divisionId: any) => {
    const division = Divisions.find((division) => division.id === divisionId);
    return division ? division.name : "Unknown Division";
  };

  const getUserName = (userId: any) => {
    const user = users.find((u) => u.uid === userId);
    return user ? user.displayName : "Unknown User";
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await api.jobcard.jobcard.getAll();
        await api.jobcard.section.getAll();
        await api.jobcard.division.getAll();
        await api.user.getAll();
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    };
    loadData();
  }, [api.jobcard, api.user]);

  const generatePDF = async () => {
    const now = Date.now();
    const logo = await getBase64ImageFromURL(
      `${process.env.PUBLIC_URL}/logo512.png`
    );

    try {
      const documentDefinition: TDocumentDefinitions = {
        pageOrientation: "landscape",
        content: [
          {
            text: "Job Card Performance Report",
            style: "header",
            alignment: "center",
          },
          {
            image: `${logo}`,
            fit: [100, 100],
            margin: [0, -40, 0, 10], // Adjust margin to add space below the logo
            alignment: "left",
          },
          {
            table: {
              headerRows: 1,
              widths: [
                "auto",
                "auto",
                "auto",
                "auto",
                "auto",
                "auto",
                "auto",
                "auto",
              ],
              body: [
                [
                  { text: "Job Card ID", style: "tableHeader" },
                  { text: "Job Card Type", style: "tableHeader" },
                  { text: "Status", style: "tableHeader" },
                  { text: "Assigned To", style: "tableHeader" },
                  { text: "Due Date", style: "tableHeader" },
                  { text: "Cost", style: "tableHeader" },
                  { text: "Section", style: "tableHeader" },
                  { text: "Division", style: "tableHeader" },
                ],
                ...allJobCards
                  .filter((jobCard) => {
                    const filterByUser =
                      !selectedFilterId ||
                      jobCard.assignedTo === selectedFilterId;
                    const filterBySection =
                      !selectedFilterId || jobCard.section === selectedFilterId;
                    return selectedFilter === "User"
                      ? filterByUser
                      : filterBySection;
                  })
                  .map((jobCard) => [
                    jobCard.uniqueId,
                    jobCard.jobcardType,
                    jobCard.status,
                    getUserName(jobCard.assignedTo),
                    new Date(jobCard.dueDate).toLocaleDateString(),
                    jobCard.jobcardCost,
                    getSectionName(jobCard.section),
                    getDivisionName(jobCard.division),
                  ]),
              ],
            },
            layout: {
              fillColor: (rowIndex) => (rowIndex === 0 ? "#007BFF" : null), // Blue header row
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5,
              paddingLeft: () => 5,
              paddingRight: () => 5,
              paddingTop: () => 5,
              paddingBottom: () => 5,
            },
          },
        ],
        styles: {
          header: {
            fontSize: 18,
            bold: true,
            margin: [0, 0, 0, 20],
          },
          tableHeader: {
            color: "#FFFFFF",
            bold: true,
            fontSize: 12,
            alignment: "center",
          },
          tableBody: {
            fontSize: 10,
          },
        },
      };

      pdfMake
        .createPdf(documentDefinition)
        .download(`Performance_Report_${new Date(now).toISOString()}.pdf`);
    } catch (error) {
      console.error("Error generating PDF: ", error);
    }
  };

  const generateCSV = () => {
    const headers = [
      "Job Card ID",
      "Job Card Type",
      "Status",
      "Assigned To",
      "Due Date",
      "Cost",
      "Section",
      "Division",
    ];

    const rows = allJobCards
      .filter((jobCard) => {
        const filterByUser =
          !selectedFilterId || jobCard.assignedTo === selectedFilterId;
        const filterBySection =
          !selectedFilterId || jobCard.section === selectedFilterId;
        return selectedFilter === "User" ? filterByUser : filterBySection;
      })
      .map((jobCard) => [
        jobCard.uniqueId,
        jobCard.jobcardType,
        jobCard.status,
        getUserName(jobCard.assignedTo),
        new Date(jobCard.dueDate).toLocaleDateString(),
        jobCard.jobcardCost,
        getSectionName(jobCard.section),
        getDivisionName(jobCard.division),
      ]);

    // Create CSV string
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Trigger CSV download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Performance_Report_${new Date().toISOString()}.csv`;
    link.click();
  };

  // Chart data
  const filteredJobCards = allJobCards.filter((jobCard) => {
    const filterByUser =
      !selectedFilterId || jobCard.assignedTo === selectedFilterId;
    const filterBySection =
      !selectedFilterId || jobCard.section === selectedFilterId;
    return selectedFilter === "User" ? filterByUser : filterBySection;
  });

  const jobCardCountBySection = {
    labels: Array.from(
      new Set(filteredJobCards.map((jc) => getSectionName(jc.section)))
    ),
    values: Array.from(new Set(filteredJobCards.map((jc) => jc.section))).map(
      (section) =>
        filteredJobCards.filter((jc) => jc.section === section).length
    ),
  };

  const jobCardCountByStatus = {
    labels: Array.from(new Set(filteredJobCards.map((jc) => jc.status))),
    values: Array.from(new Set(filteredJobCards.map((jc) => jc.status))).map(
      (status) => filteredJobCards.filter((jc) => jc.status === status).length
    ),
  };

  if (loading) return <LoadingEllipsis />;

  return (
    <ErrorBoundary>
      <div className="dashboard-container">
        <h2 className="dashboard-title">Job Card Performance Reports</h2>

        <div className="select-filters-container">
          <div className="filter-item">
            <label className="uk-form-label" htmlFor="user">
              Select User to see Performance
            </label>
            <SingleSelect
              options={[
                { label: "Select Filter Type", value: "" },
                { label: "By User", value: "User" },
                { label: "By Section", value: "Section" },
              ]}
              onChange={handleFilterChange}
              value={selectedFilter}
              placeholder={selectedFilter || "Select Filter Type"}
              label=""
            />
          </div>

          {selectedFilter && (
            <div className="filter-item">
              <label className="uk-form-label" htmlFor="filterValue">
                {selectedFilter === "User" ? "Select User" : "Select Section"}
              </label>
              <SingleSelect
                options={
                  selectedFilter === "User" ? userOptions : sectionOptions
                }
                onChange={handleFilterSelect}
                placeholder={`Select ${
                  selectedFilter === "User" ? "User" : "Section"
                }`}
                value={selectedFilterId}
                label=""
              />
            </div>
          )}
        </div>
        <div className="button-container">
          {/* <button onClick={generatePDF} className="generate-pdf-button">
                    Export as Pdf
                </button> */}
          <ButtonSecondary
            text="Export as PDF"
            type="button"
            onClick={generatePDF}
            buttonType="dark-theme" // Dark theme button
            disabled={loading}
          />
          <ButtonSecondary
            text=" Export as CSV"
            type="button"
            onClick={generateCSV}
            buttonType="dark-theme" // Dark theme button
            disabled={loading}
          />
          {/* <button onClick={generateCSV} className="generate-pdf-button">
                    Export as CSV
                </button> */}
        </div>

        <div className="uk-overflow-auto">
          <table className="uk-table uk-table-striped">
            <thead>
              <tr>
                <th>Job Card ID</th>
                <th>Job Card Type</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Due Date</th>
                <th>Cost</th>
                <th>Section</th>
                <th>Division</th>
              </tr>
            </thead>
            <tbody>
              {allJobCards
                .filter((jobCard) => {
                  const filterByUser =
                    !selectedFilterId ||
                    jobCard.assignedTo === selectedFilterId;
                  const filterBySection =
                    !selectedFilterId || jobCard.section === selectedFilterId;
                  return selectedFilter === "User"
                    ? filterByUser
                    : filterBySection;
                })
                .map((jobCard) => (
                  <tr key={jobCard.id}>
                    <td>{jobCard.uniqueId}</td>
                    <td>{jobCard.jobcardType}</td>
                    <td>{jobCard.status}</td>
                    <td>{getUserName(jobCard.assignedTo)}</td>
                    <td>{new Date(jobCard.dueDate).toLocaleDateString()}</td>
                    <td>{jobCard.jobcardCost}</td>
                    <td>{getSectionName(jobCard.section)}</td>
                    <td>{getDivisionName(jobCard.division)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="card-section">
          <div className="chart-card">
            <h3>Job Cards by Section</h3>
            <JobCardChart
              data={jobCardCountBySection}
              title="Job Cards by Section"
            />
          </div>
          <div className="chart-card">
            <h3>Job Cards by Status</h3>
            <JobCardChart
              data={jobCardCountByStatus}
              title="Job Cards by Status"
            />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
});

export default NewJobCardReports;
