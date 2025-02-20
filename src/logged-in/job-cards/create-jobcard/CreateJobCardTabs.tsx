import React, { ChangeEvent } from "react";
import "./Tabs copy.scss"; // Import the updated SCSS

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

const CreateJobCardTabs: React.FC<IProps> = ({
  selectedTab,
  setSelectedTab,
}) => {
  const handleTabChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setSelectedTab(event.target.id);
  };

  return (
    <div className="deleted-transactions-tabs">
      <div className="deleted-tabs">
        <Tab
          id="recently-created"
          name="Recently Created"
          selectedTab={selectedTab}
          handleTabChange={handleTabChange}
          index={1}
        />
        <Tab
          id="customer-rating"
          name="Customer Rating"
          selectedTab={selectedTab}
          handleTabChange={handleTabChange}
          index={2}
        />
        <span className="deleted-glider"></span>
      </div>
    </div>
  );
};

export default CreateJobCardTabs;
