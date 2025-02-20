import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../../shared/functions/Context";
import { useEffect, useState } from "react";
import useTitle from "../../../shared/hooks/useTitle";
import useBackButton from "../../../shared/hooks/useBack";
import showModalFromId from "../../../shared/functions/ModalShow";
import MODAL_NAMES from "../../dialogs/ModalName";
import { LoadingEllipsis } from "../../../shared/components/loading/Loading";
import ErrorBoundary from "../../../shared/components/error-boundary/ErrorBoundary";
import Modal from "../../../shared/components/Modal";
import JobCardTabs from "./JobCardTabs";
import Toolbar from "../../shared/components/toolbar/Toolbar";

import CreateJobCardModal from "../dialogs/CreateJobCardModal";
import AllocateJobCardModal from "../dialogs/AllocateJobCardModal";

import {
  IJobCard,

} from "../../../shared/models/job-card-model/Jobcard";


import ViewAllocatedJobCardModal from "../dialogs/ViewAllocatedJobCardModal ";
import AllocatedJobCardTable from "../grids/AllocatedJobCardTable ";
import UnallocatedJobCardTable from "../grids/UnallocatedJobCardTable";
import CompletedJobCardTable from "../grids/CompletedJobCardTable";
import UpdatedJobCardModal from "../dialogs/UpdateJobCardModal";

import AddTeamRatingModal from "../dialogs/AddTeamRatingModal";
import Tabs from "../Components/tabs-new/JobCardTab";


const AllocateJobCardMain = observer(() => {
  const { api, store } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<string>("JobCards");
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  // const [material, setMaterial] = useState<IMaterial>({ ...defaultMaterial });

  const handleTabChange = (index) => {
    setActiveTab(index);
  };

  //code for job card data
  const completed = store.jobcard.jobcard.all
    .map((job) => job.asJson)
    .filter((job) => job.status === "Completed");
  //stats

  const createdJobCards = store.jobcard.jobcard.all
    .map((job) => job.asJson)
    .filter((job) => job.isAllocated !== true && job.status !== "Deleted");
  //stats
  const allocatedJobCards = store.jobcard.jobcard.all
    .map((job) => job.asJson)
    .filter((job) => job.isAllocated && job.status === "In Progress");

  const deletedJobCards = store.jobcard.jobcard.all
    .map((job) => job.asJson)
    .filter((job) => job.status === "Deleted");

  const onCreateJobCard = () => {
    showModalFromId(MODAL_NAMES.EXECUTION.CREATEJOBCARD_MODAL);
  };

 // Define the tabs and sub-tabs
 const mainTabs = [
  { id: "created-tab", name: "Created" },
  { id: "allocated-tab", name: "Allocated" },
 
];

const subTabs = [
  { id: "in progress-tab", name: "In Progress" },
  { id: "completed-tab", name: "Completed" },
  { id: "deleted-tab", name: "Deleted" },
];
  const [selectedTab, setSelectedTab] = useState("created-tab");
  const [selectedSubTab, setSelectedSubTab] = useState("in progress-tab");
  useTitle("Allocated Job Cards");
  useBackButton();
  const [isOpen, setIsOpen] = useState(false);

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

  // if (loading) return <LoadingEllipsis />;

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

  const onHandleRating = (selectedJobCard: IJobCard) => {
    console.log("selected job card", selectedJobCard);
    if (selectedJobCard) {store.jobcard.jobcard.select(selectedJobCard);}

    showModalFromId(MODAL_NAMES.EXECUTION.TEAM_RATING_MODAL);
  };
  const generateUniqueId = (existingUniqueIds, baseId) => {
    if (!existingUniqueIds.includes(baseId)) {
      return baseId;
    }

    let suffixCounter = 1;
    let nextUniqueId = `${baseId}.${suffixCounter.toString().padStart(2, "0")}`;
    while (existingUniqueIds.includes(nextUniqueId)) {
      suffixCounter++;
      nextUniqueId = `${baseId}.${suffixCounter.toString().padStart(2, "0")}`;
    }

    return nextUniqueId;
  };

  const onDuplicate = async (selectedJobCard) => {
    console.log("Selected job card for duplication", selectedJobCard);

    const materialList = store.jobcard.material.all;
    const currentMaterialList = materialList.filter(
      (material) => material.asJson.jId === selectedJobCard.id
    );

    const existingUid = store.jobcard.jobcard.all;
    const existingUniqueIds = existingUid.map(
      (employee) => employee.asJson.uniqueId
    );

    // Prompt the user for confirmation
    const confirmDuplicate = window.confirm(
      "Are you sure you want to duplicate this job card?"
    );

    if (!confirmDuplicate) {
      return;
    }

    // Check if the job card has been duplicated 3 times
    if (selectedJobCard.isDuplicatedCount >= 3) {
      alert(
        "You cannot duplicate a job card more than 3 times. Please create a new one."
      );
      return;
    }

    const oldJobCard = {
      ...selectedJobCard,
      isDuplicated: true,
      isDuplicatedCount: (selectedJobCard.isDuplicatedCount || 0) + 1,
    };

    const baseId = selectedJobCard.uniqueId;
    const newUniqueId = generateUniqueId(existingUniqueIds, baseId);

    const duplicatedJobCard = {
      ...selectedJobCard,
      dateIssued: Date.now(),
      status: "In Progress",
      uniqueId: newUniqueId,
    };

    try {
      // Update the old job card
      await api.jobcard.jobcard.update(oldJobCard);

      // Create the duplicated job card and get its new ID
      await api.jobcard.jobcard.create(duplicatedJobCard);
      const newJobCardId = duplicatedJobCard.id; // Assuming the created job card's ID is returned

      // Create materials for the duplicated job card
      for (const material of currentMaterialList) {
        const newMaterial = {
          ...material.asJson,
          jId: newJobCardId,
        };
        await api.jobcard.material.create(newMaterial, newJobCardId);
      }

      alert("Job card duplicated successfully.");
    } catch (error) {
      console.error("Error duplicating job card or materials:", error);
      alert(
        "There was an error duplicating the job card or materials. Please try again."
      );
    }
  };

  // const onDuplicate = async (selectedJobCard) => {
  //   console.log("selected job card for duplication", selectedJobCard);

  //   // Assuming allJobCards is an array of job cards
  //   const materialList = store.jobcard.material.all;
  //   const currentMaterialList = materialList.filter(
  //     (material) => material.asJson.jId === selectedJobCard.id
  //   );

  //   const oldJobCard = {
  //     ...selectedJobCard,
  //     isDuplicated: true,
  //     isDuplicatedCount: (selectedJobCard.isDuplicatedCount || 0) + 1,
  //     // status: "In Progress",
  //   };

  //   const duplicatedJobCard = {
  //     ...selectedJobCard,

  //     status: "In Progress",
  //   };

  //   if (oldJobCard.isDuplicatedCount > 3) {
  //     alert(
  //       "You can not duplicate a job card more than 3 times. Please create a new one."
  //     );
  //   } else {
  //     try {
  //       // Update the old job card
  //       await api.jobcard.jobcard.update(oldJobCard);

  //       // Create the duplicated job card and get its new ID
  //        await api.jobcard.jobcard.create(
  //         duplicatedJobCard
  //       );
  //       const newJobCardId = duplicatedJobCard.id // Assuming the created job card's ID is returned

  //       // Create materials for the duplicated job card
  //       for (const material of currentMaterialList) {
  //         const newMaterial = {
  //           ...material.asJson, // Use the JSON representation of the material
  //           jId: newJobCardId, // Set the new job card ID
  //         };
  //         await api.jobcard.material.create(newMaterial, newJobCardId);
  //       }

  //       alert("Job card duplicated successfully.");
  //     } catch (error) {
  //       console.error("Error duplicating job card or materials:", error);
  //       alert(
  //         "There was an error duplicating the job card or materials. Please try again."
  //       );
  //     }
  //   }
  // };

  //code for time since created

  //rating code
  const [ratings, setRatings] = useState({});

  const handleRatingChange = async (jobCardId, newRating) => {
    console.log("rating", newRating);
    if (jobCardId && newRating) {
      const currentJobCard = store.jobcard.jobcard.getById(jobCardId).asJson;

      const updatedJobCard = {
        ...currentJobCard,
        rating: newRating,
      };

      await api.jobcard.jobcard.update(updatedJobCard);
    }
  };

  const [comment, setComment] = useState("");
  const [commentIndex, setCommentIndex] = useState(null);

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };
  const handleCancel = (e) => {
    setComment("");
    setCommentIndex(null);
  };

  const handleCommentSubmit = async (jobCardId: string) => {
    console.log(
      "Comment submitted for Job Card ID:",
      jobCardId,
      "Comment:",
      comment
    );
    if (jobCardId && comment) {
      const currentJobCard = store.jobcard.jobcard.getById(jobCardId).asJson;

      const updatedJobCard = {
        ...currentJobCard,
        comment: comment,
      };

      await api.jobcard.jobcard.update(updatedJobCard);
    }
    setComment("");
    setCommentIndex(null);
  };

  return (
    <ErrorBoundary>
      <div className="reports uk-section">
        <div className="uk-container uk-container-xlarge background white">
          <ErrorBoundary>
            <Toolbar
              rightControls={
                <Tabs
                tabs={mainTabs}
                selectedTab={selectedTab}
                setSelectedTab={setSelectedTab}
              />
              }
            />
          </ErrorBoundary>
          <ErrorBoundary>{loading && <LoadingEllipsis />}</ErrorBoundary>
          <ErrorBoundary>
            {!loading && selectedTab === "created-tab" && (
              <>
                <div className="uk-width-1-1">
                  {" "}
                  <h4 className="uk-text-bold">Unallocated Queue</h4>
                </div>{" "}
                <UnallocatedJobCardTable
                  jobCards={createdJobCards}
                  handleEdit={onViewCreated}
                  onView={onViewCreated}
                  defaultPage={1} // Specify the default page number
                  defaultItemsPerPage={5} // Specify the default items per page
                  // timeSinceIssuanceArray={timeSinceIssuanceArray}
                />
              </>
            )}
            {!loading && selectedTab === "allocated-tab" && (
              <>
                <div className="uk-width-1-1">
                  <h4 className="uk-text-bold">Allocated Queue</h4>
                </div>{" "}
                <Toolbar
                  rightControls={<ErrorBoundary></ErrorBoundary>}
                  leftControls={
                    <ErrorBoundary>
                       <Tabs
                      tabs={subTabs}
                      selectedTab={selectedSubTab}
                      setSelectedTab={setSelectedSubTab}
                    />
                    </ErrorBoundary>
                  }
                />
                {!loading && selectedSubTab === "in progress-tab" && (
                  <AllocatedJobCardTable
                    jobCards={allocatedJobCards}
                    handleEdit={onViewCreated}
                    onView={onViewAllocated}
                    defaultPage={1} // Specify the default page number
                    defaultItemsPerPage={5} // Specify the default items per page
                    // timeSinceIssuanceArray={timeSinceIssuanceArray}
                  />
                )}
                {!loading && selectedSubTab === "completed-tab" && (
                  <CompletedJobCardTable
                    jobCards={completed}
                    onView={onViewAllocated}
                    onRating={onHandleRating}
                    defaultPage={1}
                    defaultItemsPerPage={5}
                    // timeSinceIssuanceArray={timeSinceIssuanceArray}
                    ratings={ratings}
                    handleRatingChange={handleRatingChange}
                    comment={comment}
                    setComment={setComment}
                    commentIndex={commentIndex}
                    setCommentIndex={setCommentIndex}
                    handleCommentChange={handleCommentChange}
                    handleCommentSubmit={handleCommentSubmit}
                    handleCancel={handleCancel}
                    onDuplicate={onDuplicate}
                  />
                )}
                {!loading && selectedSubTab === "deleted-tab" && (
                  <AllocatedJobCardTable
                    jobCards={deletedJobCards}
                    handleEdit={onViewCreated}
                    onView={onViewAllocated}
                    defaultPage={1} // Specify the default page number
                    defaultItemsPerPage={5} // Specify the default items per page
                    // timeSinceIssuanceArray={timeSinceIssuanceArray}
                  />
                )}
              </>
            )}
            {!loading && selectedTab === "people-tab" && <CreateJobCardModal />}
            {!loading && selectedTab === "execution-tab" && (
              <AllocateJobCardModal />
            )}
          </ErrorBoundary>
        </div>
      </div>
      <Modal modalId={MODAL_NAMES.EXECUTION.CREATEJOBCARD_MODAL}>
        <CreateJobCardModal />
      </Modal>
      <Modal modalId={MODAL_NAMES.EXECUTION.ALLOCATEJOBCARD_MODAL}>
        <AllocateJobCardModal />
      </Modal>
      <Modal modalId={MODAL_NAMES.EXECUTION.EDITJOBCARD_MODAL}>
        <UpdatedJobCardModal />
      </Modal>
      <Modal modalId={MODAL_NAMES.EXECUTION.VIEWALLOCATEDJOBCARD_MODAL}>
        <ViewAllocatedJobCardModal />
      </Modal>
      <Modal modalId={MODAL_NAMES.EXECUTION.TEAM_RATING_MODAL}>
        <AddTeamRatingModal />
      </Modal>
    </ErrorBoundary>
  );
});

export default AllocateJobCardMain;
