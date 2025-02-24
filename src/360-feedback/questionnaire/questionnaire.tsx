import { observer } from "mobx-react-lite";
import { Tab } from "../tabs/Tabs";
import { useState } from "react";
import { QuestionnaireTab } from "./components/QuestionnaireTabs";

import ValuesView from "./views/ValuesView";
import LeadershipView from "./views/LeadershipView";
import Templates from "./components/CustomisedTemplates";
import ErrorBoundary from "../../shared/components/error-boundary/ErrorBoundary";

const Questionnaire = observer(() => {
  const [activeTab, setActiveTab] = useState("values");
  const handleTab = (label: string) => {
    setActiveTab(label);
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
          label="Templates"
          isActive={activeTab === "templates"}
          onClick={() => handleTab("templates")}
        />
      </ErrorBoundary>
      <ErrorBoundary>
        {activeTab === "values" && <ValuesView />}
        {activeTab === "leadership" && <LeadershipView />}
        {activeTab === "templates" && <Templates />}
      </ErrorBoundary>
    </>
  );
});
export default Questionnaire;
