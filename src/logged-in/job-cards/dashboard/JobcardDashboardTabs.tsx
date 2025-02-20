import { observer } from "mobx-react-lite";
import React, { FC } from "react";
import { useAppContext } from "../../../shared/functions/Context";
import '../../project-management/styles/statistics.style.scss';


interface ITabItem {
  label: string;
  name: string;
  activeTab: (tab: string) => "" | "uk-active";
  onClickTab: (tab: string) => void;
}
const TabItem = (props: ITabItem) => {
  const { label, name, activeTab, onClickTab } = props;

  return (
    <li className={activeTab(label)} onClick={() => onClickTab(label)}>
      <a href="#">{name}</a>
    </li>
  );
};

interface IProps {
  selectedTab: string;
  setselectedTab: React.Dispatch<React.SetStateAction<string>>;
}
const JobCardsTabs: FC<IProps> = observer(({ selectedTab, setselectedTab }) => {

  const { store } = useAppContext();

  const activeTab = (tab: string) => {
    return tab === selectedTab ? "uk-active" : "";
  };

  const onClickTab = (tab: string) => {
    localStorage.setItem("jobcards-selected-tab", tab);
    setselectedTab(tab);
  };

  return (
    <div className="settings-filters">
      <ul className="kit-tabs" data-uk-tab>
        <TabItem
          label="dashboard-tab"
          name="Dashboard"
          activeTab={activeTab}
          onClickTab={onClickTab}
        />
        <TabItem
          label="reports-tab"
          name="Reports"
          activeTab={activeTab}
          onClickTab={onClickTab}
        />
      
      </ul>
    </div>
  );
});

export default JobCardsTabs;
