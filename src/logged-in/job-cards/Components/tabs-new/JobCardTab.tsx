import React, { useState } from "react";
import "./Tab.scss"; // Import the SCSS styles

interface TabProps {
  id: string;
  name: string;
  selectedTab: string;
  handleTabChange: (id: string) => void;
}

const JobCardTab: React.FC<TabProps> = ({
  id,
  name,
  selectedTab,
  handleTabChange,
}) => {
  return (
    <div
      className={`tab ${selectedTab === id ? "active" : ""}`}
      onClick={() => handleTabChange(id)}
    >
      {name}
    </div>
  );
};

interface TabsProps {
  tabs: { id: string; name: string }[]; // Array of tab data
  selectedTab: string;
  setSelectedTab: React.Dispatch<React.SetStateAction<string>>;
}

const Tabs: React.FC<TabsProps> = ({ tabs, selectedTab, setSelectedTab }) => {
  const handleTabChange = (id: string) => {
    setSelectedTab(id);
  };

  return (
    <div className="tab-container">
      {tabs.map((tab) => (
        <JobCardTab
          key={tab.id}
          id={tab.id}
          name={tab.name}
          selectedTab={selectedTab}
          handleTabChange={handleTabChange}
        />
      ))}
    </div>
  );
};

export default Tabs;
