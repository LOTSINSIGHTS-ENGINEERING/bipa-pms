import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Tab } from "./tabs/Tabs";
import { Dashboard360 } from "./dashboard/Dashboard";
import Requests from "./requests/requests";
import CreateTemplate from "./create-questionare-template/CreateTemplate";
import RequestRating from "./create-questionare-template/RequestRating";
import RateeView from "./create-questionare-template/RateeView";
import FlaggedRequests from "./flagged-requests/FlaggedRequests";
import Resubmissions from "./requests/Resubmissions";
import ValuesView from "./questionnaire/views/ValuesView";
import LeadershipView from "./questionnaire/views/LeadershipView";
import Templates from "./questionnaire/components/CustomisedTemplates";
import LowRated from "./Reports360/LowRated";
import AllReports from "./Reports360/AllReports";
import Department from "./Reports360/Department";
import Dimension from "./Reports360/Dimension";
import TopRated from "./Reports360/TopRated";
import AdminDashboard from "./dashboard/AdminDashboard";


const MainAdmin = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const tabFromUrl = queryParams.get("tab");

  const [activeTab, setActiveTab] = useState<string>(() => {
    return tabFromUrl || localStorage.getItem("activeTab") || "dashboard";
  });

  const handleTab = (label: string) => {
    setActiveTab(label);
    localStorage.setItem("activeTab", label);

    const newQueryParams = new URLSearchParams(location.search);
    newQueryParams.set("tab", label);
    navigate(`${location.pathname}?${newQueryParams.toString()}`);
  };

  useEffect(() => {
    const tab = queryParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [location.search]);

  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  return (
    <div style={{ backgroundColor: "white", borderRadius: "10px", boxShadow: "none" }}>
      <div style={{ marginBottom: "1rem" }}>
        {/* Admin Tabs */}
        <Tab
          label="Dashboard"
          isActive={activeTab === "dashboard"}
          onClick={() => handleTab("dashboard")}
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
            { label: "Templates", onClick: () => handleTab("surveys-templates") },
          ]}
        />
        <Tab
          label="Requests"
          isActive={activeTab === "requests"}
          onClick={() => handleTab("requests")}
        />
        <Tab
          label="Reports"
          isActive={activeTab.startsWith("reports")}
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
            { label: "Low Rated", onClick: () => handleTab("reports-low-rated") },
            { label: "Top Rated", onClick: () => handleTab("reports-top-rated") },
            { label: "Department", onClick: () => handleTab("reports-department") },
            { label: "Dimension", onClick: () => handleTab("reports-dimension") },
            { label: "All Reports", onClick: () => handleTab("reports-all-reports") },
          ]}
        />
        <Tab
          label="Flagged Requests"
          isActive={activeTab === "flagged-requests"}
          onClick={() => handleTab("flagged-requests")}
        />
      </div>
      <div>
        {/* Admin Tab Content */}
        {activeTab === "dashboard" && <AdminDashboard/>}
        {activeTab === "surveys-values" && <ValuesView />}
        {activeTab === "surveys-leadership" && <LeadershipView />}
        {activeTab === "surveys-templates" && <Templates />}
        {activeTab === "requests" && <Requests />}
        {activeTab === "reports-low-rated" && <LowRated />}
        {activeTab === "reports-top-rated" && <TopRated />} 
        {activeTab === "reports-department" && <Department />} 
        {activeTab === "reports-dimension" && <Dimension />} 
        {activeTab === "reports-all-reports" && <AllReports />} 
        {activeTab === "template" && <CreateTemplate />}
        {activeTab === "RequestRating" && <RequestRating />}
        {activeTab === "RateeView" && <RateeView />}
        {activeTab === "flagged-requests" && <FlaggedRequests />}
      </div>
    </div>
  );
};

export default MainAdmin;
