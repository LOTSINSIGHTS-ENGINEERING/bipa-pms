import React from 'react';

const JobCardStats = ({ title, value }) => {
  return (
    <div className="stat-card">
      <h4>{title}</h4>
      <p>{value}</p>
    </div>
  );
};

export default JobCardStats;
