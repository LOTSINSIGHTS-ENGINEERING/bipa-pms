import React, { ChangeEvent } from "react";
import "./Tabs copy.scss";

interface TabProps {
  index: number;
  id: string;
  name: string;
  selectedTab: string;
  handleTabChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

const Tab: React.FC<TabProps> = ({
  id,
  index,
  name,
  selectedTab,
  handleTabChange,
}) => {
  return (
    <>
      <label
        className={`deleted-tab ${selectedTab === id ? "active" : ""}`}
        htmlFor={id}>
        {name}
      </label>
      <input
        type="radio"
        id={id}
        name="deleted-tab"
        checked={selectedTab === id}
        onChange={handleTabChange}
      />
    </>
  );
};

interface IProps {
  selectedTab: string;
  setSelectedTab: React.Dispatch<React.SetStateAction<string>>;
}

const JobCardTabs: React.FC<IProps> = ({ selectedTab, setSelectedTab }) => {
  const handleTabChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setSelectedTab(event.target.id);
  };

  return (
    <div className="deleted-transactions-tabs">
      <div className="deleted-tabs">
        <Tab
          id="created-tab"
          name="New Job Cards"
          selectedTab={selectedTab}
          handleTabChange={handleTabChange}
          index={1}
        />
        <Tab
          id="allocated-tab"
          name="Allocated Job Cards"
          selectedTab={selectedTab}
          handleTabChange={handleTabChange}
          index={2}
        />
        <span className="deleted-glider"></span>
      </div>
    </div>
  );
};

export default JobCardTabs;
