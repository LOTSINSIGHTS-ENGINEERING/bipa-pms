import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import { Typography, Box, IconButton, Fade, Tooltip } from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";

import DoughnutChart from "../../dashboard/Charts/DoughnutChart";
import { useAppContext } from "../../../shared/functions/Context";

const UserRatingStatus = observer(() => {
  const { store } = useAppContext();
  const me = store.auth.me?.asJson;   

  if (!me) {
    return null;
  }

  const leadershipRatingsReceived = store.leadershipRating.all.filter(
    (rating) => rating.asJson.rateeId === me.uid
  ).length;

  const totalToRateCurrentUserLeadership = store.ratingAssignments.all
    .filter((assignment) => assignment.asJson.isActive)
    .map((assignment) => assignment.asJson.feedbackAssignments[me.uid])
    .flat().length;

  const valueRatingsReceived = store.valueRating.all.filter(
    (rating) => rating.asJson.rateeId === me.uid
  ).length;

  const totalToRateCurrentUserValue = store.ratingAssignments.all
    .filter((assignment) => assignment.asJson.isActive)
    .map((assignment) => assignment.asJson.feedbackAssignments[me.uid])
    .flat().length;

  const leadershipRatingsGiven = store.leadershipRating.all.filter(
    (rating) => rating.asJson.raterId === me.uid
  ).length;

  const totalToRateByCurrentUserLeadership = store.ratingAssignments.all
    .filter((assignment) => assignment.asJson.isActive)
    .map((assignment) => assignment.asJson.ratedUsersPerAssignmentLeadership[me.uid])
    .flat().length;

  const valueRatingsGiven = store.valueRating.all.filter(
    (rating) => rating.asJson.raterId === me.uid
  ).length;

  const totalToRateByCurrentUserValue = store.ratingAssignments.all
    .filter((assignment) => assignment.asJson.isActive)
    .map((assignment) => assignment.asJson.ratedUsersPerAssignmentValues[me.uid])
    .flat().length;

  // Data for Doughnut Charts
  const leadershipReceivedData = [
    { name: 'Rated', value: leadershipRatingsReceived },
    { name: 'Not Rated', value: totalToRateCurrentUserLeadership - leadershipRatingsReceived }
  ];

  const leadershipGivenData = [
    { name: 'Given', value: leadershipRatingsGiven },
    { name: 'Total', value: totalToRateByCurrentUserLeadership - leadershipRatingsGiven }
  ];

  const valueReceivedData = [
    { name: 'Rated', value: valueRatingsReceived },
    { name: 'Not Rated', value: totalToRateCurrentUserValue - valueRatingsReceived }
  ];

  const valueGivenData = [
    { name: 'Given', value: valueRatingsGiven },
    { name: 'Total', value: totalToRateByCurrentUserValue - valueRatingsGiven }
  ];

  // Calculate percentages
  const calculatePercentage = (received: number, total: number): string => ((received / total) * 100).toFixed(2);
  const leadershipReceivedPercentage = calculatePercentage(leadershipRatingsReceived, totalToRateCurrentUserLeadership);
  const valueReceivedPercentage = calculatePercentage(valueRatingsReceived, totalToRateCurrentUserValue);


  // State for carousel
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    {
        title: "Users that have rated me (Leadership)",
        data: leadershipReceivedData,
        colors: ['#FEBE30', '#A2CFEE'],
        label: "Leadership Ratings Received",
        percentage: leadershipReceivedPercentage,
        tooltipText: `Percentage of users who have rated you in Leadership out of those who were assigned to rate you.`
      },
    // {
    //   title: "Users I have rated (Leadership)",
    //   data: leadershipGivenData,
    //   colors: ['#4caf50', '#f44336'],
    //   label: "Leadership Ratings Given"
    // },
    {
        title: "Users that have rated me (Value)",
        data: valueReceivedData,
        colors: ['#093545', '#2EBDA6'],
        label: "Value Ratings Received",
        percentage: valueReceivedPercentage,
        tooltipText: `Percentage of users who have rated you in Value out of those who were assigned to rate you.`
      }
    // {
    //   title: "Users I have rated (Value)",
    //   data: valueGivenData,
    //   colors: ['#2196f3', '#ff9800'],
    //   label: "Value Ratings Given",
    // }
  ];

  return (
    <Box sx={{
      width: '100%',
      maxWidth: '800px', // Limit the width to avoid overlap
      margin: 'auto',
      p: { xs: 2, sm: 3, md: 4 },
      boxShadow: 1,
      borderRadius: 2,
      backgroundColor: 'background.paper',
      position: 'relative',
      zIndex: 1 // Ensure it stays above the background elements
    }}>
      <Typography variant="h6" align="center" gutterBottom>
        Rating Status for {me.displayName}
      </Typography>

      <Box sx={{ position: 'relative', height: '380px' }}>
        {slides.map((slide, index) => (
          <Fade key={index} in={currentSlide === index} timeout={500}>
            <Box sx={{
              display: currentSlide === index ? 'flex' : 'none',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'absolute',
              width: '100%',
            }}>
              <Typography variant="subtitle2" align="center" gutterBottom>
                {slide.title}
              </Typography>
              <Typography variant="body2" align="center" gutterBottom>
                {`${slide.data[0].value} / ${slide.data[1].value + slide.data[0].value}`}
              </Typography>
              <Tooltip title={slide.tooltipText} arrow>
                <Typography
                  variant="body2"
                  align="right"
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    backgroundColor: 'background.paper',
                    borderRadius: 1,
                    p: 1,
                  }}
                >
                  {slide.percentage}%
                </Typography>
              </Tooltip>
              <Box sx={{ width: '100%', height: '300px', maxWidth: '500px', mx: 'auto' }}>
                <DoughnutChart
                  data={slide.data}
                  colors={slide.colors}
                  label={slide.label}
                />
              </Box>
            </Box>
          </Fade>
        ))}
      </Box>

      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        position: 'absolute',
        bottom: 16,
        left: 16,
        right: 16
      }}>
        <IconButton
          onClick={() => setCurrentSlide((prev) => (prev > 0 ? prev - 1 : slides.length - 1))}
          sx={{ backgroundColor: 'background.paper', '&:hover': { backgroundColor: 'action.hover' } }}
        >
          <ArrowBack />
        </IconButton>
        <IconButton
          onClick={() => setCurrentSlide((prev) => (prev < slides.length - 1 ? prev + 1 : 0))}
          sx={{ backgroundColor: 'background.paper', '&:hover': { backgroundColor: 'action.hover' } }}
        >
          <ArrowForward />
        </IconButton>
      </Box>
    </Box>
  );
});
  export default UserRatingStatus;