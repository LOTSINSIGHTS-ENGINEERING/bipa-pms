import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Tab } from '../tabs/Tabs';
import LowRated from './LowRated';
import TopRated from './TopRated';
import Department from './Department';
import Dimension from './Dimension';
import AllReports from './AllReports';
import { useLocation, useNavigate } from 'react-router-dom';

const Reports = observer(() => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tabFromUrl = queryParams.get("tab");
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => {
    if(tabFromUrl === "top-rated"){
      return "top rated" 
    }else if(tabFromUrl === "low-rated"){
      return "low rated" 
    }
    else{
      return "low rated"
    }
  });
  const handleTab = (label: string) => {
    setActiveTab(label);
    const newQueryParams = new URLSearchParams(location.search);
    newQueryParams.delete("tab");
    navigate(`${location.pathname}?${newQueryParams.toString()}`);
  };

  return (
    <div>
      <Tab label={'Low Rated'} isActive={activeTab === 'low rated'} onClick={() => handleTab('low rated')} />
      <Tab label={'Top Rated'} isActive={activeTab === 'top rated'} onClick={() => handleTab('top rated')} />
      <Tab label={'Department'} isActive={activeTab === 'department'} onClick={() => handleTab('department')} />
      <Tab label={'Dimension'} isActive={activeTab === 'dimension'} onClick={() => handleTab('dimension')} />
      <Tab label={'All Reports'} isActive={activeTab === 'all reports'} onClick={() => handleTab('all reports')} />

      <div className="tab-content">
        {activeTab === 'low rated' && <LowRated />}
        {activeTab === 'top rated' && <TopRated />} 
        {activeTab === 'department' && <Department />}
        {activeTab === 'dimension' && <Dimension />}
        {activeTab === 'all reports' && <AllReports />}
      </div>
    </div>
  );
});
export default Reports;
