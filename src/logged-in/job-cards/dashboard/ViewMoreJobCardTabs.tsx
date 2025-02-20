import React from "react";

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
      <a href="void(0)">{name}</a>
    </li>
  );
};

interface IProps {
  selectedTab: string;
  setselectedTab: React.Dispatch<React.SetStateAction<string>>;
}
const ViewMoreJobCardTabs = (props: IProps) => {
  const { selectedTab, setselectedTab } = props;

  const activeTab = (tab: string) => {
    return tab === selectedTab ? "uk-active" : "";
  };

  const onClickTab = (tab: string) => {
    setselectedTab(tab);
  };

  return (
    <div className="settings-filters uk-margin">
      <ul className="kit-tabs" data-uk-tab>
        <TabItem
          label="strategy-tab"
          name="All Job Cards"
          activeTab={activeTab}
          onClickTab={onClickTab}
        />
        {/* <TabItem
          label="department-tab"
          name="Charts and reports"
          activeTab={activeTab}
          onClickTab={onClickTab}
        /> */}
      </ul>
    </div>
  );
};

export default ViewMoreJobCardTabs;
