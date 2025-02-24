import { useState } from "react";
import { Tab } from "./tabs/Tabs";
import { Dashboard360 } from "./dashboard/Dashboard";
import Questionnaire from "./questionnaire/questionnaire";
import UserExpQuestionnaire from "./questionnaire/UserExperienceQuestionnaire";
import { PrivateMessage } from "./communication/messages";

import { useAppContext } from "../../shared/functions/Context";
import Ratings from "./ratings/ratings";
import Home from "./home/Home";

export const Main360 = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const handleTab = (label: string) => {
    setActiveTab(label);
  };
  const { store, api } = useAppContext();
  const me = store.auth.meJson;

  return (
    <div
      className="strategic-map uk-card uk-card-default uk-card-body uk-card-small uk-margin-bottom"
      style={{ backgroundColor: "", borderRadius: "10px" }}
    >
      <div style={{ marginBottom: "1rem" }}>
        {me?.role === "Admin" && (
          <>
            <Tab
              label="Overview"
              isActive={activeTab === "overview"}
              onClick={() => handleTab("overview")}
            />
            <Tab
              label="Dashboard"
              isActive={activeTab === "dashboard"}
              onClick={() => handleTab("dashboard")}
            />
            {/* mikel design tabs */}

            <Tab
              label="Set Questions"
              isActive={activeTab === "set_questions"}
              onClick={() => handleTab("set_questions")}
            />
            <Tab
              label="Requests"
              isActive={activeTab === "requests"}
              onClick={() => handleTab("requests")}
            />
               <Tab
              label="Reports"
              isActive={activeTab === "reports"}
              onClick={() => handleTab("reports")}
            />
            <Tab
              label="Communication"
              isActive={activeTab === "communication"}
              onClick={() => handleTab("communication")}
            />
          </>
        )}
        {me?.role !== "Admin" && (
          <>
            <Tab
              label="Overview"
              isActive={activeTab === "overview"}
              onClick={() => handleTab("overview")}
            />
            <Tab
              label="Dashboard"
              isActive={activeTab === "dashboard"}
              onClick={() => handleTab("dashboard")}
            />
            {/* mikel design tabs */}

            <Tab
              label="Set Questions"
              isActive={activeTab === "set_questions"}
              onClick={() => handleTab("set_questions")}
            />
            <Tab
              label="Requests"
              isActive={activeTab === "requests"}
              onClick={() => handleTab("requests")}
            />
            <Tab
              label="Ratings"
              isActive={activeTab === "ratings"}
              onClick={() => handleTab("ratings")}
            />
            <Tab
              label="Communication"
              isActive={activeTab === "communication"}
              onClick={() => handleTab("communication")}
            />
          </>
        )}
      </div>
      <div className="strategic-map my-custom-class uk-card uk-card-default uk-card-body uk-card-small uk-margin-bottom">
        <div>
          {me?.role === "Admin" && (
            <>
              {activeTab === "dashboard" && <Dashboard360 />}
              {activeTab === "set_questions" && <Questionnaire />}
              {activeTab === "requests" && <>Requests</>}
              {activeTab === "reports" && <>Reports</>}
              {activeTab === "communication" && <PrivateMessage />}
              {activeTab === "overview" && <Home />}
            </>
          )}
          {me?.role !== "Admin" && (
            <>
              {activeTab === "overview" && <Home />}
              {activeTab === "dashboard" && <Dashboard360 />}
              {activeTab === "set_questions" && <UserExpQuestionnaire />}
              {activeTab === "ratings" && <Ratings />}
              {activeTab === "requests" && <>Requests</>}
              {activeTab === "communication" && <PrivateMessage />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
