import { observer } from "mobx-react-lite";
import { useAppContext } from "../../../shared/functions/Context";
import { useEffect, useState } from "react";
import showModalFromId from "../../../shared/functions/ModalShow";
import MODAL_NAMES from "../../dialogs/ModalName";
import useTitle from "../../../shared/hooks/useTitle";
import { LoadingEllipsis } from "../../../shared/components/loading/Loading";
import useBackButton from "../../../shared/hooks/useBack";
import ErrorBoundary from "../../../shared/components/error-boundary/ErrorBoundary";
import Toolbar from "../../shared/components/toolbar/Toolbar";
import Dropdown from "../../../shared/components/dropdown/Dropdown";
import Modal from "../../../shared/components/Modal";
import JobCardManagemntTabs from "./JobCardManagemntTabs";
import ClientAccountModal from "./dialogs/ClientAccountModal";
import SectionModal from "./dialogs/SectionModal";
import DivisionModal from "./dialogs/DivisionModal";
import TeamMemberJobCardTable from "./grids/TeamMemberJobCardTable";
import {
  ITeamMember,
  defaultTeamMember,
} from "../../../shared/models/job-card-model/TeamMember";
import SectionJobCardTable from "./grids/SectionJobCardTable";
import DivisionJobCardTable from "./grids/DivisionJobCardTable";
import BlueButton from "../create-jobcard/Button";
import { ISection } from "../../../shared/models/job-card-model/Section";
import {
  IClient,
  defaultClient,
} from "../../../shared/models/job-card-model/Client";
import MemberModal from "./dialogs/MemberModal";
import { IDivision } from "../../../shared/models/job-card-model/Division";
import { Alert, AlertColor, Stack } from "@mui/material";
import Tabs from "../Components/tabs-new/JobCardTab";

interface AlertState {
  type: AlertColor;
  message: string;
}
const JobCardManagement = observer(() => {
  const { api, store } = useAppContext();
  // const [selectedTab, setselectedTab] = useState("client-tab");
  const [selectedTab, setSelectedTab] = useState("client-tab");

  const [loading, setLoading] = useState(false);
  const scorecard = store.scorecard.active;

  useTitle("Job Card Management");
  useBackButton();

  const handleNewUser = () => {
    showModalFromId(MODAL_NAMES.ADMIN.USER_MODAL);
  };
  const handleNewMember = () => {
    showModalFromId(MODAL_NAMES.ADMIN.TEAM_MEMBER_MODAL);
  };

  const handleNewDepartment = () => {
    store.department.clearSelected(); // clear selected department
    showModalFromId(MODAL_NAMES.ADMIN.DEPARTMENT_MODAL); // show modal
  };

  const handleNewBusinessUnit = () => {
    store.businessUnit.clearSelected(); // clear selected business unit
    showModalFromId(MODAL_NAMES.ADMIN.BUSINESS_UNIT_MODAL); // show modal
  };
  const onViewCreatedClient = (selectedClient: IClient) => {
    console.log("selected job card", selectedClient);
    store.jobcard.client.select(selectedClient);

    showModalFromId(MODAL_NAMES.ADMIN.USER_MODAL);
  };
  const onViewTeamMember = (selectedTeamMember: ITeamMember) => {
    console.log("selected job card", selectedTeamMember);
    store.jobcard.teamMember.select(selectedTeamMember);

    showModalFromId(MODAL_NAMES.ADMIN.TEAM_MEMBER_MODAL);
  };
  const onViewDivision = (selectedDivision: IDivision) => {
    console.log("selected job card", selectedDivision);
    store.jobcard.division.select(selectedDivision);

    showModalFromId(MODAL_NAMES.ADMIN.BUSINESS_UNIT_MODAL);
  };

  const activeTeamMembers = store.jobcard.teamMember.all
    .filter((member) => member.asJson.status !== "Archived")
    .map((member) => member.asJson);

  const sectionList = store.jobcard.section.all.map(
    (section) => section.asJson
  );
  const devisionList = store.jobcard.division.all.map(
    (section) => section.asJson
  );

  const activeClients = store.jobcard.client.all
    .filter((client) => client.asJson.status !== "Archived")
    .map((client) => client.asJson);

  useEffect(() => {
    // load data from db
    const loadAll = async () => {
      setLoading(true); // start loading
      try {
        await api.user.getAll();
        await api.department.getAll();
        await api.jobcard.section.getAll();
        await api.jobcard.division.getAll();
        await api.jobcard.client.getAll();
        await api.jobcard.teamMember.getAll();
      } catch (error) {
        // console.log("Error: ", error);
      }
      setLoading(false); // stop loading
    };
    loadAll();
  }, [
    api.businessUnit,
    api.department,
    api.user,
    api.jobcard.division,
    api.jobcard.section,
    api.jobcard.client,
    api.jobcard.teamMember,
  ]);

  // new handling function

  const handleEditSection = (section: ISection) => {
    store.jobcard.section.select(section); // set selected department
    showModalFromId(MODAL_NAMES.ADMIN.DEPARTMENT_MODAL); // show modal
  };

  const handleDeleteSection = async (section: ISection) => {
    if (!window.confirm("Remove department?")) return; // TODO: confirmation dialog
    api.jobcard.section.delete(section); // remove department
  };

  const handleEditTeamMember = (teamMember: ITeamMember) => {
    store.jobcard.teamMember.select(teamMember); // set selected user
    showModalFromId(MODAL_NAMES.ADMIN.TEAM_MEMBER_MODAL); // show modal
  };
  const [alert, setAlert] = useState<AlertState | null>(null);

  const handleArchiveMember = async (teamMember: ITeamMember) => {
    try {
      // Your logic to archive the team member
      const currentTeamMember = store.jobcard.teamMember.select(teamMember);
      if (store.jobcard.teamMember.selected) {
        const selectedTeamMember = store.jobcard.teamMember.selected;
        if (selectedTeamMember) {
          const updatedTeamMember: IClient = {
            ...selectedTeamMember,
            status: "Archived",
          };
          await api.jobcard.teamMember.update(updatedTeamMember);

          // Show success alert
          setAlert({
            type: "success",
            message: `Archived member: ${selectedTeamMember.name}`,
          });
        }
      }
    } catch (error) {
      // Show error alert
      setAlert({
        type: "error",
        message: `Error archiving member: ${error.message}`,
      });
    }
  };

  const handleArchiveClient = async (client) => {
    try {
      // Your logic to archive the team member
      const currentClient = store.jobcard.client.select(client);
      if (store.jobcard.client.selected) {
        const selectedClient = store.jobcard.client.selected;
        if (selectedClient) {
          const updatedClient: IClient = {
            ...selectedClient,
            status: "Archived",
          };
          await api.jobcard.client.update(updatedClient);

          // Show success alert
          setAlert({
            type: "success",
            message: `Archived client: ${client.name}`,
          });
        }
      }
    } catch (error) {
      // Show error alert
      setAlert({
        type: "error",
        message: `Error archiving client: ${error.message}`,
      });
    }
  };
  return (
    <ErrorBoundary>
      <div className="admin-settings uk-section uk-section-small">
        <div className="uk-container uk-container-xlarge">
          <div className="sticky-top">
            <ErrorBoundary>
              <Toolbar
                leftControls={
                  <Tabs
                    tabs={[
                      { id: "team-members-tab", name: "Team Members" },
                      { id: "sections-tab", name: "Sections" },
                      { id: "client-tab", name: "Clients" },
                      { id: "division-tab", name: "Divisions" },
                    ]}
                    selectedTab={selectedTab}
                    setSelectedTab={setSelectedTab}
                  />
                }
                rightControls={
                  <div className="uk-inline">
                    <button
                      style={{
                        backgroundColor: "black",
                        color: "white",
                        border: "none",
                        padding: "8px 16px",
                        borderRadius: "4px",
                        fontSize: "0.9rem",
                        cursor: "pointer",
                      }}
                    >
                      <span data-uk-icon="icon: plus-circle; ratio:.8"></span>{" "}
                      Add
                    </button>

                    <Dropdown pos="bottom-right">
                      <li>
                        <button
                          className="kit-dropdown-btn"
                          onClick={handleNewMember}
                        >
                          <span data-uk-icon="icon: plus; ratio:.8"></span>
                          Team Member
                        </button>
                      </li>
                      <li>
                        <button
                          className="kit-dropdown-btn"
                          onClick={handleNewUser}
                        >
                          <span data-uk-icon="icon: plus; ratio:.8"></span>
                          Client Account
                        </button>
                      </li>

                      <li>
                        <button
                          className="kit-dropdown-btn"
                          onClick={handleNewDepartment}
                        >
                          <span data-uk-icon="icon: plus; ratio:.8"></span>
                          Section
                        </button>
                      </li>
                      <li>
                        <button
                          className="kit-dropdown-btn"
                          onClick={handleNewBusinessUnit}
                        >
                          <span data-uk-icon="icon: plus; ratio:.8"></span>
                          Division
                        </button>
                      </li>
                    </Dropdown>
                  </div>
                }
              />
            </ErrorBoundary>
          </div>

          <ErrorBoundary>
            {!loading && (
              <div className="uk-margin">
                {selectedTab === "team-members-tab" && (
                  <>
                    {" "}
                    <TeamMemberJobCardTable
                      teamMembers={activeTeamMembers}
                      handleEdit={handleEditTeamMember}
                      handleArchive={handleArchiveMember}
                      defaultPage={1} // Specify the default page number
                      defaultItemsPerPage={5} // Specify the default items per page
                    />
                    <Stack sx={{ width: "100%" }} spacing={2}>
                      {alert && (
                        <Alert severity={alert.type}>{alert.message}</Alert>
                      )}
                    </Stack>
                  </>
                )}
                {selectedTab === "sections-tab" && (
                  <SectionJobCardTable
                    section={sectionList}
                    handleEdit={handleEditSection}
                    onView={handleDeleteSection}
                    defaultPage={1} // Specify the default page number
                    defaultItemsPerPage={5} // Specify the default items per page
                  />
                )}
                {selectedTab === "client-tab" && (
                  <>
                    {" "}
                    <TeamMemberJobCardTable
                      teamMembers={activeClients}
                      handleEdit={onViewCreatedClient}
                      handleArchive={handleArchiveClient}
                      defaultPage={1} // Specify the default page number
                      defaultItemsPerPage={5} // Specify the default items per page
                    />
                    <Stack sx={{ width: "100%" }} spacing={2}>
                      {alert && (
                        <Alert severity={alert.type}>{alert.message}</Alert>
                      )}
                    </Stack>
                  </>
                )}
                {selectedTab === "division-tab" && (
                  <DivisionJobCardTable
                    section={devisionList}
                    handleEdit={onViewDivision}
                    onView={onViewDivision}
                    defaultPage={1} // Specify the default page number
                    defaultItemsPerPage={5} // Specify the default items per page
                  />
                )}
              </div>
            )}
          </ErrorBoundary>

          {/* Loading */}
          <ErrorBoundary>{loading && <LoadingEllipsis />}</ErrorBoundary>
        </div>
      </div>

      {/* Modals */}
      <ErrorBoundary>
        <Modal modalId={MODAL_NAMES.ADMIN.USER_MODAL}>
          <ClientAccountModal />
        </Modal>
        {/* <Modal modalId={MODAL_NAMES.ADMIN.JOBCARD_USER_MODAL}>
          <JobCardModal/>
        </Modal> */}

        <Modal modalId={MODAL_NAMES.ADMIN.DEPARTMENT_MODAL}>
          <SectionModal />
        </Modal>
        <Modal modalId={MODAL_NAMES.ADMIN.TEAM_MEMBER_MODAL}>
          <MemberModal />
        </Modal>
        <Modal modalId={MODAL_NAMES.ADMIN.BUSINESS_UNIT_MODAL}>
          <DivisionModal />
        </Modal>
      </ErrorBoundary>
    </ErrorBoundary>
  );
});
export default JobCardManagement;
