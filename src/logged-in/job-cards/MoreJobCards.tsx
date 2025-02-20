import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../shared/functions/Context";
import { useEffect, useState } from "react";
import useTitle from "../../shared/hooks/useTitle";

import { IJobCard } from "../../shared/models/job-card-model/Jobcard";
import MODAL_NAMES from "../dialogs/ModalName";
import showModalFromId from "../../shared/functions/ModalShow";
import { LoadingEllipsis } from "../../shared/components/loading/Loading";
import ErrorBoundary from "../../shared/components/error-boundary/ErrorBoundary";
import JobCardGridTabs from "./dashboard/JobCardGridTabs";

import useBackButton from "../../shared/hooks/useBack";
import JobCardTable from "./grids/AllocatedJobCardTable ";
import Dropdown from "../../shared/components/dropdown/Dropdown";
import Toolbar from "../shared/components/toolbar/Toolbar";
import JobCardTabs from "./allocate-jobcard/JobCardTabs";
import {
  faCommentDots,
  faFileExcel,
  faFilePdf,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ViewMoreJobCardTabs from "./dashboard/ViewMoreJobCardTabs";

const MoreJobCards = observer(() => {
  const navigate = useNavigate();
  const { api, store } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [selectedTab, setselectedTab] = useState("strategy-tab");
  useTitle("View All Job Cards");
  useBackButton();

  const JobCards = store.jobcard.jobcard.all
    .map((job) => job.asJson)
    .filter((job) => !job.isAllocated);
  //stats
  const totalJobcards = store.jobcard.jobcard.all.length;

  const completed = store.jobcard.jobcard.all
    .map((job) => job.asJson)
    .filter((job) => job.status === "Completed");
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
  const allJobCards = store.jobcard.jobcard.all;

  const all = store.jobcard.jobcard.all.map((job) => job.asJson);
  // Initialize an array to store time since issuance for each job card
  const timeSinceIssuanceArray: { jobCardId: string; timeDiff: number }[] = [];

  // Loop through each job card
  allJobCards.forEach((jobCard) => {
    // Convert dateIssued to a Date object
    const dateIssued = new Date(jobCard.asJson.dateIssued);
    // Get the current date
    const now = new Date();

    // Calculate the time difference in milliseconds
    const timeDiff = now.getTime() - dateIssued.getTime(); // Use getTime() to get the time in milliseconds

    // Store time difference for the current job card
    timeSinceIssuanceArray.push({ jobCardId: jobCard.asJson.id, timeDiff });
  });

  // Helper function to convert milliseconds to decimal hours
  function millisecondsToDecimalHours(ms: number): number {
    return ms / (1000 * 60 * 60); // Convert milliseconds to hours
  }

  // Helper function to convert milliseconds to weeks
  function millisecondsToWeeks(ms: number): number {
    return ms / (1000 * 60 * 60 * 24 * 7); // Convert milliseconds to weeks
  }

  // Helper function to convert milliseconds to months
  function millisecondsToMonths(ms: number): number {
    return ms / (1000 * 60 * 60 * 24 * 30.44); // Average days in a month = 365.25 / 12
  }

  // Example usage
  timeSinceIssuanceArray.forEach(({ jobCardId, timeDiff }) => {
    const decimalHours = millisecondsToDecimalHours(timeDiff);
    const weeks = millisecondsToWeeks(timeDiff);
    const months = millisecondsToMonths(timeDiff);
    console.log(
      `Job Card ID: ${jobCardId}, Time Difference: ${decimalHours.toFixed(
        2
      )} hours, ${weeks.toFixed(2)} weeks, ${months.toFixed(2)} months`
    );
  });
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
  //donut code
  const backgroundColors = {
    pending: "rgb(255, 99, 132)", // Red
    completed: "rgb(54, 162, 235)", // Blue
    total: "rgb(255, 205, 86)", // Yellow
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

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await api.jobcard.jobcard.getAll();

        setLoading(false);
      } catch (error) {}
    };
    loadData();
  }, [api.jobcard]);

  if (loading) return <LoadingEllipsis />;

  function onCreateJobCard(): void {
    throw new Error("Function not implemented.");
  }

  function handleExportPDF(): void {
    throw new Error("Function not implemented.");
  }

  function handleExportExcel(): void {
    throw new Error("Function not implemented.");
  }

  function handleFeedback(): void {
    throw new Error("Function not implemented.");
  }

  function handleBack(): void {
    throw new Error("Function not implemented.");
  }

  return (
    <ErrorBoundary>
      <div className="uk-container uk-container-xlarge">
        <ErrorBoundary>
          <Toolbar
            leftControls={
              <ViewMoreJobCardTabs
                selectedTab={selectedTab}
                setselectedTab={setselectedTab}
              />
            }
            rightControls={
              <ErrorBoundary>
                <button
                  className="btn btn-primary uk-margin-right"
                  type="button"
                  disabled={loading}
                  onClick={handleBack}>
                  Back
                  {loading && <div data-uk-spinner="ratio: .5"></div>}
                </button>
              </ErrorBoundary>
            }
          />
        </ErrorBoundary>

        <ErrorBoundary>{loading && <LoadingEllipsis />}</ErrorBoundary>
        <ErrorBoundary>
          {!loading && selectedTab === "strategy-tab" && (
            <>
              {" "}
              <JobCardTable
                jobCards={all}
                handleEdit={onViewCreated}
                onView={onViewCreated}
                defaultPage={1} // Specify the default page number
                defaultItemsPerPage={10} // Specify the default items per page
                timeSinceIssuanceArray={timeSinceIssuanceArray}
                // onViewMoreClick={onViewMore}
              />
            </>
          )}
          {!loading && selectedTab === "department-tab" && (
            <JobCardTable
              jobCards={allocatedJobCards}
              handleEdit={onViewCreated}
              onView={onViewAllocated}
              defaultPage={1} // Specify the default page number
              defaultItemsPerPage={5} // Specify the default items per page
              timeSinceIssuanceArray={timeSinceIssuanceArray}
              //   onViewMoreClick={onViewMore}
            />
          )}
          {!loading && selectedTab === "people-tab" && (
            <JobCardTable
              jobCards={completed}
              handleEdit={onViewCreated}
              onView={onViewAllocated}
              defaultPage={1} // Specify the default page number
              defaultItemsPerPage={5} // Specify the default items per page
              timeSinceIssuanceArray={timeSinceIssuanceArray}
              //   onViewMoreClick={onViewMore}
            />
          )}
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  );
});

export default MoreJobCards;
