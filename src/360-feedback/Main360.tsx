import { useEffect, useState } from "react";
import { Tab } from "./tabs/Tabs";
import { Dashboard360 } from "./dashboard/Dashboard";
import UserTemplatesView from "./questionnaire/views/UserTemplatesView";
import UserLeadershipView from "./questionnaire/views/UserLeadershipView";
import UserValuesView from "./questionnaire/views/UserValueView";
import UserRequests from "./requests/UserRequests";
import Resubmissions from "./requests/Resubmissions";
import RatingsOverview from "./ratings/RatingsOverview";
import Reports from "./ratings/Reports";
import { useAppContext } from "../../shared/functions/Context";
import { UserDashboard } from "./dashboard/UsersDashboard";

export const Main360 = () => {
  const [activeTab, setActiveTab] = useState<string>(() => {
    return localStorage.getItem("activeTab") || "dashboard";
  });

  const handleTab = (label: string) => {
    setActiveTab(label);
    localStorage.setItem("activeTab", label);
  };

  const { store } = useAppContext();
  const me = store.auth.meJson;

  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  console.log("Active Tab:", activeTab);
  console.log("User Role:", me?.role);

  return (
    <div className="" style={{ backgroundColor: "white", borderRadius: "10px", boxShadow: "none" }}>
      <div style={{ marginBottom: "1rem" }}>
        <Tab
          label="Dashboard"
          isActive={activeTab === "dashboard"}
          onClick={() => handleTab("dashboard")}
        />
        <Tab
          label="My Ratings"
          isActive={activeTab === "ratings"}
          onClick={() => {}}
          icon={
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              height="1em"
              width="1em"
            >
              <path d="M16.293 9.293L12 13.586 7.707 9.293l-1.414 1.414L12 16.414l5.707-5.707z" />
            </svg>
          }
          dropdownItems={[
            { label: "Analysis", onClick: () => handleTab("Ratings-analysis") },
            { label: "Reports", onClick: () => handleTab("Ratings-reports") },
          ]}
        />
        <Tab
          label="Surveys"
          isActive={activeTab.startsWith("surveys")}
          onClick={() => {}}
          icon={
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              height="1em"
              width="1em"
            >
              <path d="M16.293 9.293L12 13.586 7.707 9.293l-1.414 1.414L12 16.414l5.707-5.707z" />
            </svg>
          }
          dropdownItems={[
            { label: "Values", onClick: () => handleTab("surveys-values") },
            { label: "Leadership", onClick: () => handleTab("surveys-leadership") },
            { label: "Professional Competencies", onClick: () => handleTab("surveys-requests") },
            { label: "Resubmissions", onClick: () => handleTab("surveys-resubmissions") },
          ]}
        />
        <Tab
          label="Requests"
          isActive={activeTab === "requests"}
          onClick={() => handleTab("requests")}
        />
      </div>
      <div>
        {/* User Tab Content */}
        {activeTab === "dashboard" && <UserDashboard />}
        {activeTab === "surveys-values" && <UserValuesView />}
        {activeTab === "surveys-leadership" && <UserLeadershipView />}
        {activeTab === "surveys-requests" && <UserRequests />}
        {activeTab === "surveys-resubmissions" && <Resubmissions />}
        {activeTab === "Ratings-analysis" && <RatingsOverview />}
        {activeTab === "Ratings-reports" && <Reports />}
        {activeTab === "requests" && <UserTemplatesView />}
      </div>
    </div>
  );
};

export default Main360;
