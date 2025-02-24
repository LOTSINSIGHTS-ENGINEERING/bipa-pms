import { observer } from "mobx-react-lite";
import { useState } from "react";
import { QuestionnaireTab } from "./components/QuestionnaireTabs";
import ErrorBoundary from "../../../shared/components/error-boundary/ErrorBoundary";
import ValueQuestionnaireView from "./ValueQuestionnaire";
import LeadershipQuestionnaireView from "./LeadershipQuestionnaire";
const CombinedQuestionnaire = observer(() => {
  const [activeTab, setActiveTab] = useState("values");
  const handleTab = (label: string) => {
    setActiveTab(label);
  };
  return (
    <div
      className="value-page uk-card uk-card-default uk-card-body uk-card-small uk-margin-bottom"
      style={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        padding: "1rem",
        width: "80%",
        margin: "auto",
      }}
    >
      <ErrorBoundary>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
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
        </div>
      </ErrorBoundary>
      <ErrorBoundary>
        {activeTab === "values" && <ValueQuestionnaireView />}
        {activeTab === "leadership" && <LeadershipQuestionnaireView />}
      </ErrorBoundary>
    </div>
  );
});
export default CombinedQuestionnaire;
