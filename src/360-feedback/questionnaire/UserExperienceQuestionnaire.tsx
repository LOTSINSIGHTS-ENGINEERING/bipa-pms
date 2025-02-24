import { observer } from "mobx-react-lite";
import { Tab } from "../tabs/Tabs";
import { useState } from "react";
import { QuestionnaireTab } from "./components/QuestionnaireTabs";
import ErrorBoundary from "../../../shared/components/error-boundary/ErrorBoundary";
import UserLeadershipView from "./views/UserLeadershipView";
import UserValuesView from "./views/UserValueView";
// import UserTemplatesView from "./views/UserTemplatesView";
import UserRequests from "../requests/UserRequests";
import { useLocation, useNavigate } from "react-router-dom";
import Resubmissions from "../requests/Resubmissions";

const UserExpQuestionnaire = observer(() => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tabFromUrl = queryParams.get("tab");
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => {
    return tabFromUrl === "surveys-competencies" ? "requests" : "values";
  });
  const handleTab = (label: string) => {
    setActiveTab(label);
    const newQueryParams = new URLSearchParams(location.search);
    newQueryParams.delete("tab");
    navigate(`${location.pathname}?${newQueryParams.toString()}`);
  };
  return (
    <>
      <ErrorBoundary>
        <QuestionnaireTab
          label="Values"
          isActive={activeTab === "values"}
          onClick={() => handleTab("values")}
        />
        <QuestionnaireTab
          label="Leadership"
          isActive={activeTab === "leadership"}
          onClick={() => handleTab("leadership")}
        />
        <QuestionnaireTab
          label="Professional Competencies"
          isActive={activeTab === "requests"}
          onClick={() => handleTab("requests")}
        />
        <QuestionnaireTab
          label="Resubmissions"
          isActive={activeTab === "resubmissions"}
          onClick={() => handleTab("resubmissions")}
        />
      </ErrorBoundary>
      <ErrorBoundary>
        {activeTab === "values" && <UserValuesView />}
        {activeTab === "leadership" && <UserLeadershipView />}
        {activeTab === "requests" && <UserRequests />}
        {activeTab === "resubmissions" && <Resubmissions />}
      </ErrorBoundary>
    </>
  );
});
export default UserExpQuestionnaire;
