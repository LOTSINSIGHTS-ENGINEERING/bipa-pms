import React from 'react';
import './user-details.scss';

interface UserDetailsProps {
  selectedUser: any | null; // Change the type of selectedUser to allow null
  selectedUserInitials: string;
}

const UserDetailsContainer: React.FC<UserDetailsProps> = ({ selectedUser, selectedUserInitials }) => {
  // Render nothing if selectedUser is null or undefined
  if (!selectedUser) {
    return null;
  }

  return (
    <div className="user-details-container">
      <div className="user-details">
        <div className="initial-circle">
          <span>{selectedUserInitials}</span>
        </div>
        <div className="user-info">
          <p className="user-name">{selectedUser?.asJson?.displayName}</p>
          <p className="user-job-title">{selectedUser?.asJson?.jobTitle}</p>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsContainer;