import React, { useState } from 'react';
import { IJobCard, IStatus } from '../../../../shared/models/job-card-model/Jobcard';
import { ISection } from '../../../../shared/models/job-card-model/Section';
import "./JobCardProgress.scss"; // Make sure to import the SCSS file

interface JobCardProgressProps {
  jobCards: IJobCard[];  // Array of job cards
  sections: ISection[];   // Array of sections
}

const JobCardProgress: React.FC<JobCardProgressProps> = ({ jobCards, sections }) => {
  const [selectedSection, setSelectedSection] = useState<string>('All'); // "All" or section id

  // Filter job cards based on the selected section
  const filteredJobCards = selectedSection === 'All'
    ? jobCards
    : jobCards.filter(jobCard => jobCard.section === selectedSection);

  // Calculate job card statuses
  const getStatusCount = (status: IStatus) => {
    return filteredJobCards.filter(jobCard => jobCard.status === status).length;
  };

  const total = filteredJobCards.length;
  const notStarted = getStatusCount('Not Started');
  const inProgress = getStatusCount('In Progress');
  const completed = getStatusCount('Completed');
  const assigned = getStatusCount('Assigned');
  const deleted = getStatusCount('Deleted');
  const pending = getStatusCount('Pending');
  const cancelled = getStatusCount('Cancelled');

  // Avoid division by zero and calculate percentage only if total > 0
  const notStartedPercentage = total > 0 ? (notStarted / total) * 100 : 0;
  const inProgressPercentage = total > 0 ? (inProgress / total) * 100 : 0;
  const completedPercentage = total > 0 ? (completed / total) * 100 : 0;
  const assignedPercentage = total > 0 ? (assigned / total) * 100 : 0;
  const deletedPercentage = total > 0 ? (deleted / total) * 100 : 0;
  const pendingPercentage = total > 0 ? (pending / total) * 100 : 0;
  const cancelledPercentage = total > 0 ? (cancelled / total) * 100 : 0;

  return (
    <div>
      <h3 className="chart-title">Job Card Progress</h3>

      <div className="filter-section">
        <label htmlFor="sectionFilter">Filter by Section:</label>
        <select
          id="sectionFilter"
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
        >
          <option value="All">All</option>
          {sections.map((section) => (
            <option key={section.id} value={section.id}>
              {section.name}
            </option>
          ))}
        </select>
      </div>

      <div className="progress-bar">
        {notStarted > 0 && (
          <div className="progress-section not-started" style={{ width: `${notStartedPercentage}%` }}>
            <span className="progress-label">Not Started ({notStarted})</span>
          </div>
        )}
        {inProgress > 0 && (
          <div className="progress-section in-progress" style={{ width: `${inProgressPercentage}%` }}>
            <span className="progress-label">In Progress ({inProgress})</span>
          </div>
        )}
        {completed > 0 && (
          <div className="progress-section completed" style={{ width: `${completedPercentage}%` }}>
            <span className="progress-label">Completed ({completed})</span>
          </div>
        )}
        {assigned > 0 && (
          <div className="progress-section assigned" style={{ width: `${assignedPercentage}%` }}>
            <span className="progress-label">Assigned ({assigned})</span>
          </div>
        )}
        {deleted > 0 && (
          <div className="progress-section deleted" style={{ width: `${deletedPercentage}%` }}>
            <span className="progress-label">Deleted ({deleted})</span>
          </div>
        )}
        {pending > 0 && (
          <div className="progress-section pending" style={{ width: `${pendingPercentage}%` }}>
            <span className="progress-label">Pending ({pending})</span>
          </div>
        )}
        {cancelled > 0 && (
          <div className="progress-section cancelled" style={{ width: `${cancelledPercentage}%` }}>
            <span className="progress-label">Cancelled ({cancelled})</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobCardProgress;
