import { Box, Typography } from '@mui/material';
import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface User {
  uid: string;
  displayName: string;
  jobTitle: string;
  department?: string;
}

interface RatingAssignment {
  asJson: {
    isActive: boolean;
    feedbackAssignments: { [key: string]: string[] };
  };
}

interface AppStore {
  ratingAssignments: {
    all: RatingAssignment[];
  };
}

interface NumberOfRatersChartProps {
  users: User[];
  assignments: { [key: string]: string[] };
  store: AppStore;
  signedInUserId: string;
  filterByName?: string;
  filterByDepartment?: string;
  filterByRatingStatus?: 'rated' | 'unrated';
}

const NumberOfRatersChart: React.FC<NumberOfRatersChartProps> = ({
  users,
  assignments,
  store,
  signedInUserId,
  filterByName = "",
  filterByDepartment = "",
  filterByRatingStatus,
}) => {

  const calculateRatingCounts = (assignments: { [key: string]: string[] }) => {
    const userId = signedInUserId;
    const alreadyRatedUserIds = assignments[userId] || [];

    const matches = store.ratingAssignments.all
      .filter((assignment) => assignment.asJson.isActive)
      .flatMap((assignment) => assignment.asJson.feedbackAssignments[userId] || []);

    const actualUsers = users
      .filter((user) => matches.includes(user.uid))
      .filter((user) => !alreadyRatedUserIds.includes(user.uid));

    return {
      alreadyRatedCount: alreadyRatedUserIds.length,
      totalToRateCount: actualUsers.length + alreadyRatedUserIds.length,
    };
  };

  const { alreadyRatedCount, totalToRateCount } = calculateRatingCounts(assignments);

  const overallProgress = totalToRateCount > 0
    ? (alreadyRatedCount / totalToRateCount) * 100
    : 0;

  return (
    <Box className="chart-wrapper">
      <Typography variant="h4" gutterBottom>
        Rating Progress for Signed-In User
      </Typography>
      <Box display="flex" justifyContent="center" alignItems="center" height="200px">
        <CircularProgressbar
          value={overallProgress}
          text={`${alreadyRatedCount} / ${totalToRateCount}`}
          styles={buildStyles({
            pathColor: "#004d4d", // Dark teal
            textColor: "#333",
            trailColor: "#f0f0f0",
            backgroundColor: "#fff",
          })}
        />
      </Box>
    </Box>
  );
};

export default NumberOfRatersChart;








