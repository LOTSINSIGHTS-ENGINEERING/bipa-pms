import { ChangeEvent } from "react";
import "./JobCardManagementTabs.scss";

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
      <label className="tab" htmlFor={id}>
        {name}
      </label>
      <input
        type="radio"
        id={id}
        name="tabs"
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

const JobCardManagemntTabs = (props: IProps) => {
  const { selectedTab, setSelectedTab } = props;

  const handleTabChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setSelectedTab(event.target.id);
  };

  return (
    <div className="transaction-tabs">
      <div className="tabs">
        <Tab
          id="client-tab"
          name="Client Accounts"
          selectedTab={selectedTab}
          handleTabChange={handleTabChange}
          index={1}
        />
        <Tab
          id="sections-tab"
          name="Sections"
          selectedTab={selectedTab}
          handleTabChange={handleTabChange}
          index={2}
        />
        <Tab
          id="team-members-tab"
          name="Team Members"
          selectedTab={selectedTab}
          handleTabChange={handleTabChange}
          index={3}
        />
        <Tab
          id="division-tab"
          name="Division"
          selectedTab={selectedTab}
          handleTabChange={handleTabChange}
          index={4}
        />
        
       
        <span className="glider"></span>
      </div>
    </div>
  );
};

export default JobCardManagemntTabs;
