import { observer } from "mobx-react-lite";
import "./ratings.scss";
import { useState } from "react";
import { Tab } from "../tabs/Tabs";
import RatingsOverview from "./RatingsOverview";
import Reports from "./Reports";

const Ratings = observer(() => {
  const [activeTab, setActiveTab] = useState("overview");
  const handleTab = (label: string) => {
    setActiveTab(label);
  };
  return (
    <div className="ratings-container uk-container uk-container-large">
      <Tab
        label="Analysis"
        isActive={activeTab === "overview"}
        onClick={() => handleTab("overview")}
      />
      <Tab
        label="Reports"
        isActive={activeTab === "reports"}
        onClick={() => handleTab("reports")}
      />
      {activeTab === "overview" && 
      <RatingsOverview/>}
      {activeTab === "reports" && <Reports />}
   </div>
  );
});
export default Ratings;
