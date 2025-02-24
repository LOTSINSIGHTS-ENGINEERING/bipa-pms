import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Tab } from '../tabs/Tabs';
import NewRequests from './NewRequests';
import ArchieveRequests from './ArchieveRequests';

const Requests = observer(() => {
  const [activeTab, setActiveTab] = useState('new');

  const handleTab = (label: string) => {
    setActiveTab(label);
  };

  return (
    <div>
      <Tab label={'New'} isActive={activeTab === 'new'} onClick={() => handleTab('new')} />
      <Tab label={'Archive'} isActive={activeTab === 'archive'} onClick={() => handleTab('archive')} />
      <div className="tab-content">
        {activeTab === 'new' && <NewRequests />} 
        {activeTab === 'archive' && <ArchieveRequests />} 
      </div>
    </div>
  );
});

export default Requests;
