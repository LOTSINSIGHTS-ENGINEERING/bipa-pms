import { observer } from "mobx-react-lite";
import { CircularProgressbar } from "react-circular-progressbar";
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
import DonutChart from "../charts/DonutChart";
import JobCardGridTabs from "./JobCardGridTabs";
import SectionJobCardStats from "../Components/SectionJobCardStats";
import AssignedUserJobCardStats from "../Components/AssignedUserJobCardStats";

import BarChart from "../Components/BarChart";
import CostChart from "../Components/CostChart";
import SparklineChart from "../Components/SparklineChart";
import MonthFilter from "../Components/MonthFilter";
import "./Dashboard.css"; // Assuming you have a separate CSS file for styling
import UserStats from "../Components/UserStats";
import SingleSelect from "./Select";
import { IOption } from "../../../shared/components/single-select/SingleSelect";
import Toolbar from "../../shared/components/toolbar/Toolbar";
import DashboardTabs from "./DashboardTabs";

const JobCardDashboard = observer(() => {
  const navigate = useNavigate();
  const { api, store } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(5);
  const [selectedTab, setselectedTab] = useState("dashboard");
  useTitle("Dashboard");
  useBackButton();

  const me = store.auth.meJson;

  // const section=store.jobcard.section.all
  //  const division = store.jobcard.division.all;
  //  const jobcards = store.jobcard.jobcard.all;
  const totalJobcards = store.jobcard.jobcard.all.length;

  // const completed = store.jobcard.jobcard.all
  //   .map((job) => job.asJson)
  //   .filter((job) => job.status === "Completed");
  // //stats
  const createdJobCards = store.jobcard.jobcard.all
    .map((job) => job.asJson)
    .filter((job) => job.isAllocated !== true);
  //stats
  const allocatedJobCards = store.jobcard.jobcard.all
    .map((job) => job.asJson)
    .filter((job) => job.isAllocated && job.status !== "Completed");
  //stats
  //filter using
  const pendingJobcards = store.jobcard.jobcard.all.filter((job) => {
    return job.asJson.status === "Not Started";
  });
  const totalPendingJobcards = pendingJobcards.length;

  const completedJobcards = store.jobcard.jobcard.all.filter((job) => {
    return job.asJson.status === "Completed";
  });
  const totalCompletedJobcards = completedJobcards.length;

  // Assuming allJobCards is an array of job cards
  const allJobCards = store.jobcard.jobcard.all.map(
    (jobCard) => jobCard.asJson
  );
  const sections = store.jobcard.section.all.map((section) => section.asJson);

  const onViewMore = () => {
    navigate(`/c/job-cards/create`);
  };
  const onViewCreated = (selectedJobCard: IJobCard) => {
    console.log("selected job card", selectedJobCard);
    store.jobcard.jobcard.select(selectedJobCard);

    showModalFromId(MODAL_NAMES.EXECUTION.ALLOCATEJOBCARD_MODAL);
  };
  const onViewAllocated = (selectedJobCard: IJobCard) => {
    console.log("selected job card", selectedJobCard);
    store.jobcard.jobcard.select(selectedJobCard);

    showModalFromId(MODAL_NAMES.EXECUTION.VIEWALLOCATEDJOBCARD_MODAL);
  };

  const users = store.user.all.map((u) => u.asJson);

  const userOptions: IOption[] = useMemo(
    () =>
      users.map((bu) => {
        return {
          label: bu.displayName || "",
          value: bu.uid,
        };
      }),
    [users]
  );

  // const userOptions: IOption[] = useMemo(
  //   () =>
  //     users.map((bu) => {
  //       return {
  //         label: bu.asJson.displayName || "",
  //         value: bu.asJson.uid,
  //       };
  //     }),
  //   [users]
  // );
  //donut code
  const backgroundColors = {
    pending: "rgb(255, 99, 132)", // Red
    completed: "rgb(54, 162, 235)", // Blue
    total: "rgb(255, 205, 86)", // Yellow
  };
  const [selectedUserId, setSelectedUserId] = useState(null);
    const [selectedUserId1, setSelectedUserId1] = useState(null);
       const [selectedUserId2, setSelectedUserId2] = useState(null);
  const [selectedUser, setSelectedUser] = useState("");
   const [selectedUser1, setSelectedUser1] = useState("");
      const [selectedUser2, setSelectedUser2] = useState("");

  // Function to handle user selection
  const handleUserSelect = (userId) => {
    setSelectedUserId(userId);
    const selectedName = store.user.getById(userId).asJson.displayName;
    setSelectedUser(selectedName);
  };
   const handleUserSelect1 = (userId) => {
     setSelectedUserId1(userId);
     const selectedName = store.user.getById(userId).asJson.displayName;
     setSelectedUser1(selectedName);
   };
     const handleUserSelect2 = (userId) => {
       setSelectedUserId2(userId);
       const selectedName = store.user.getById(userId).asJson.displayName;
       setSelectedUser2(selectedName);
     };
  const data = {
    labels: ["Pending", "Completed", "Total"],
    datasets: [
      {
        label: "My First Dataset",
        data: [totalPendingJobcards, totalCompletedJobcards, totalJobcards],
        backgroundColor: [
          backgroundColors.pending,
          backgroundColors.completed,
          backgroundColors.total,
        ],
        hoverOffset: 4,
      },
    ],
    datalabels: {
      color: "#fff", // Adjust the color as needed
      formatter: (value, context) => {
        return context.chart.data.labels[context.dataIndex];
      },
    },
  };
  // new code



  const section = store.jobcard.section.all;
  const jobcards = store.jobcard.jobcard.all;


  
 const sewageSection = section.find(
   (section) => section.asJson.name === "Sewage"
 );
  const waterSection = section.find(
    (section) => section.asJson.name === "Water"
  );

  const cleanersSection = section.find(
    (section) => section.asJson.name === "Cleaners"
  );

  
  const filterJobCardsBySection = (sectionId) => {

    const currentSectionJobCards = jobcards.filter(
      (j) => j.asJson.section === sectionId
    );

    console.log("filtered jobcards in here ", currentSectionJobCards);
    
 
    // Count the completed, pending, and overdue job cards
    const pending = currentSectionJobCards.filter(
      (jobCard) => jobCard.asJson.status === "Not Started"
    ).length;

    const completed = currentSectionJobCards.filter(
      (jobCard) => jobCard.asJson.status === "Completed"
    ).length;

    const overdue = currentSectionJobCards.filter((jobCard) => {
      const jobDate = new Date(jobCard.asJson.dueDate);
      return jobCard.asJson.status !== "Completed" && jobDate < new Date();
    }).length;

    const total = currentSectionJobCards.length;
    // Calculate the total cost of the filtered job cards
    const totalCost = currentSectionJobCards.reduce(
      (sum, jobCard) => sum + jobCard.asJson.jobcardCost,
      0
    );

    return { total, pending, completed, overdue, totalCost };
  };

  const jobCardData = waterSection?.asJson.id
    ? filterJobCardsBySection(waterSection?.asJson.id)
    : { total: 0, pending: 0, completed: 0, overdue: 0, totalCost: 0 };

  const jobCardData1 = sewageSection?.asJson.id
    ? filterJobCardsBySection(sewageSection?.asJson.id)
    : { total: 0, pending: 0, completed: 0, overdue: 0, totalCost: 0 };

  const jobCardData2 = cleanersSection?.asJson.id
    ? filterJobCardsBySection(cleanersSection?.asJson.id)
    : { total: 0, pending: 0, completed: 0, overdue: 0, totalCost: 0 };



  const getSectionName = (secId) => {
    const section = store.jobcard.section.all.find(
      (section) => section.asJson.id === secId
    );
    return section ? section.asJson.name : "Unknown";
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
      } catch (error) {}
    };
    loadData();
  }, [api.jobcard, api.user]);

  if (loading) return <LoadingEllipsis />;

  return (
    <ErrorBoundary>
      <div className="uk-container uk-container-xlarge">
        <Toolbar
          rightControls={<ErrorBoundary></ErrorBoundary>}
          leftControls={
            <ErrorBoundary>
              <div style={{ marginTop: "20px" }}>
                {" "}
                <DashboardTabs
                  selectedTab={selectedTab}
                  setSelectedTab={setselectedTab}
                />
              </div>
            </ErrorBoundary>
          }
        />

        {!loading && selectedTab === "dashboard" && (
          <>
            <div
              className="uk-grid-small uk-grid-match uk-position-relative"
              data-uk-grid>
              <div className="uk-width-1-1"> </div>
              <div className="uk-width-1-3@m">
                <div className="department-job-cards">
                  <h3 className="uk-text-bold" style={{ color: " #3c4ea0" }}>
                    Water
                  </h3>
                  <h3 className="uk-text-bold" style={{ color: "grey" }}>
                    JOB CARD STATUS
                  </h3>

                  <BarChart
                    title={getSectionName(waterSection?.asJson.id)}
                    data={[
                      jobCardData.total,
                      jobCardData.pending,
                      jobCardData.completed,
                      jobCardData.overdue,
                    ]}
                    labels={[
                      "Total Job Cards",
                      "Pending",
                      "Completed",
                      "Overdue",
                    ]}
                    backgroundColors={[
                      "#007bff", // Blue for Total Job Cards
                      "#ffc107", // Yellow for Pending
                      "#28a745", // Green for Completed
                      "#dc3545", // Red for Overdue
                    ]}
                  />
                  <h3 className="uk-text-bold">Cost</h3>
                  <CostChart totalCost={jobCardData.totalCost} />
                </div>
              </div>
              {/* Vertical Line Divider */}
              <div className="vertical-line uk-visible@m"></div>
              <div className="uk-width-1-3@m">
                <div className="">
                  <h3 className="uk-text-bold" style={{ color: " #3c4ea0" }}>
                    Sewage
                  </h3>
                  <div style={{ height: "50px" }}></div>
                  <BarChart
                    title={getSectionName(sewageSection?.asJson.id)}
                    data={[
                      jobCardData1.total,
                      jobCardData1.pending,
                      jobCardData1.completed,
                      jobCardData1.overdue,
                    ]}
                    labels={[
                      "Total Job Cards",
                      "Pending",
                      "Completed",
                      "Overdue",
                    ]}
                    backgroundColors={[
                      "#007bff", // Blue for Total Job Cards
                      "#ffc107", // Yellow for Pending
                      "#28a745", // Green for Completed
                      "#dc3545", // Red for Overdue
                    ]}
                  />
                  <h3 className="uk-text-bold">Cost</h3>
                  <CostChart totalCost={jobCardData1.totalCost} />
                </div>
                {/* Vertical Line Divider */}
              </div>
              <div className="vertical-line1 uk-visible@m"></div>
              <div className="uk-width-1-3@m">
                <div className="">
                  <h3 className="uk-text-bold" style={{ color: " #3c4ea0" }}>
                    Cleaners
                  </h3>
                  <div style={{ height: "50px" }}></div>
                  <BarChart
                    title={getSectionName(cleanersSection?.asJson.id)}
                    data={[
                      jobCardData2.total,
                      jobCardData2.pending,
                      jobCardData2.completed,
                      jobCardData2.overdue,
                    ]}
                    labels={[
                      "Total Job Cards",
                      "Pending",
                      "Completed",
                      "Overdue",
                    ]}
                    backgroundColors={[
                      "#007bff", // Blue for Total Job Cards
                      "#ffc107", // Yellow for Pending
                      "#28a745", // Green for Completed
                      "#dc3545", // Red for Overdue
                    ]}
                  />
                  <h3 className="uk-text-bold">Cost</h3>
                  <CostChart totalCost={jobCardData2.totalCost} />
                </div>
              </div>{" "}
              <div className="uk-width-1-3@m">
                <div className="">
                  <SparklineChart
                    sectionId={waterSection?.asJson.id}
                    jobcards={jobcards}
                  />
                </div>
              </div>
              <div className="uk-width-1-3@m">
                <div className="">
                  <SparklineChart
                    sectionId={sewageSection?.asJson.id}
                    jobcards={jobcards}
                  />
                </div>
              </div>
              <div className="uk-width-1-3@m">
                <div className="">
                  <SparklineChart
                    sectionId={cleanersSection?.asJson.id}
                    jobcards={jobcards}
                  />
                </div>
              </div>
            </div>
          </>
        )}
        {!loading && selectedTab === "reports" && (
          <>
            <>
              <div
                className="uk-grid-small uk-grid-match uk-position-relative"
                data-uk-grid>
                <div className="uk-width-1-3@m">
                  <div>
                    <div>
                      <label className="uk-form-label" htmlFor="division">
                        Select User to see Performance
                      </label>
                      {/* Place the SingleSelect component here */}
                      <SingleSelect
                        options={userOptions}
                        onChange={handleUserSelect}
                        placeholder="Assign "
                        value={selectedUserId}
                        label="Select User to see Performance under Water Section"
                        // required
                      />
                    </div>
                    <div className="uk-width-1-3@m">
                      <AssignedUserJobCardStats
                        userId={selectedUserId}
                        userName={selectedUser}
                        jobCards={allJobCards}
                      />
                    </div>
                  </div>
                </div>

                {/* Vertical Line Divider */}
                <div className="vertical-line uk-visible@m"></div>

                <div className="uk-width-1-3@m">
                  <div>
                    <div>
                      <label className="uk-form-label" htmlFor="division">
                        Select User to see Performance
                      </label>
                      {/* Place the SingleSelect component here */}
                      <SingleSelect
                        options={userOptions}
                        onChange={handleUserSelect1}
                        placeholder="Assign "
                        value={selectedUserId1}
                        label="Select User to see Performance under Water Section"
                        // required
                      />
                    </div>
                    <div className="uk-width 1-1">
                      <AssignedUserJobCardStats
                        userId={selectedUserId1}
                        userName={selectedUser1}
                        jobCards={allJobCards}
                      />
                    </div>
                  </div>
                </div>

                {/* Vertical Line Divider */}
                <div className="vertical-line uk-visible@m"></div>

                <div className="uk-width-1-3@m">
                  <div>
                    <div>
                      <label className="uk-form-label" htmlFor="division">
                        Select User to see Performance
                      </label>
                      {/* Place the SingleSelect component here */}
                      <SingleSelect
                        options={userOptions}
                        onChange={handleUserSelect2}
                        placeholder="Assign "
                        value={selectedUserId2}
                        label="Select User to see Performance under Water Section"
                        // required
                      />
                    </div>
                    <div className="uk-width 1-1">
                      <AssignedUserJobCardStats
                        userId={selectedUserId2}
                        userName={selectedUser2}
                        jobCards={allJobCards}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          </>
        )}

        {/* <div className="uk-width 1-3">
          <SectionJobCardStats sections={sections} jobCards={allJobCards} />
        </div> */}

        <ErrorBoundary>{loading && <LoadingEllipsis />}</ErrorBoundary>
        <div className="uk-margin-top uk-width-1-2@"> </div>
      </div>
    </ErrorBoundary>
  );
});

export default JobCardDashboard;
