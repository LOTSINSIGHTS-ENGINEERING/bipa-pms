import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useAppContext } from "../../../shared/functions/Context";
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const UserRatingDashboard = observer(() => {
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [description, setDescription] = useState("");

  const { api, store } = useAppContext();
  const me = store.auth.meJson?.uid;

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        await api.ratingAssignments.getAll();
        const activeAssignment = store.ratingAssignments.all.find(
          (rating) => rating.asJson.isActive === true
        );
        const activeDescription = activeAssignment?.asJson.description ?? "";
        setDescription(activeDescription);

        await Promise.all([
          api.valueRating.getAll(me ?? "", activeDescription),
          api.leadershipRating.getAll(me ?? "", activeDescription),
          api.templateRating.getAll()
        ]);
      } catch (err) {
        setError("Failed to load data. Please try again.");
        console.error("Error loading data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [api, store, me]);

  const valueRatings = store.valueRating.all.filter(
    (value) => value.asJson.rateeId === me
  );
 
  const leadershipRatings = store.leadershipRating.all.filter(
    (value) => value.asJson.rateeId === me
  );

  const templateRatings = store.templateRating.all.filter(
    (value) => value.asJson.rateeId === me && value.asJson.status === "Completed"
  );

  const calculateAverageRatings = (ratings: any[]) => {
    console.log("Raw ratings:", ratings);
    const dimensionRatings: { [key: string]: number[] } = {};

    ratings.forEach(rating => {
      if ('criteria' in rating) {
        // Leadership Rating
        Object.values(rating.criteria).forEach((criterion: any) => {
          Object.entries(criterion.ratings).forEach(([dimension, value]) => {
            if (!dimensionRatings[dimension]) {
              dimensionRatings[dimension] = [];
            }
            if (typeof value === 'number') {
              dimensionRatings[dimension].push(value);
            }
          });
        });
      } else if ('values' in rating) {
        // Value Rating
        Object.values(rating.values).forEach((value: any) => {
          Object.entries(value.ratings).forEach(([dimension, ratingValue]) => {
            if (!dimensionRatings[dimension]) {
              dimensionRatings[dimension] = [];
            }
            if (typeof ratingValue === 'number') {
              dimensionRatings[dimension].push(ratingValue);
            } else if (Array.isArray(ratingValue)) {
              dimensionRatings[dimension].push(...ratingValue.filter(r => typeof r === 'number'));
            }
          });
        });
      }
    });

    console.log("Dimension ratings:", dimensionRatings);

    const averageRatings = Object.entries(dimensionRatings).map(([dimension, ratings]) => ({
      dimension,
      averageRating: ratings.length > 0
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
        : 0
    }));

    console.log("Average Ratings:", averageRatings);

    return averageRatings;
  };

  const valueAverageRatings = calculateAverageRatings(valueRatings.map(r => r.asJson));
  const leadershipAverageRatings = calculateAverageRatings(leadershipRatings.map(r => r.asJson));
  const templateAverageRatings = calculateAverageRatings(templateRatings.map(r => r.asJson));

  console.log("Value Average Ratings:", valueAverageRatings);
  console.log("Leadership Average Ratings:", leadershipAverageRatings);
  console.log("Template Average Ratings:", templateAverageRatings);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const RatingSection = ({ title, ratings }: { title: string; ratings: { dimension: string; averageRating: number | null }[] }) => (
    <Card variant="outlined" className="rating-card" sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>{title}</Typography>
        <Grid container spacing={2}>
          {ratings.map((rating, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Typography variant="body1">
                {rating.dimension}: {rating.averageRating !== null && !isNaN(rating.averageRating) ? rating.averageRating.toFixed(2) : "N/A"}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );

  const RatingChart = ({ title, ratings }: { title: string; ratings: { dimension: string; averageRating: number }[] }) => {
    const chartData = {
      labels: ratings.map(r => r.dimension),
      datasets: [
        {
          label: title,
          data: ratings.map(r => r.averageRating),
          backgroundColor: 'rgba(33, 150, 243, 0.2)',
          borderColor: '#2196f3',
          borderWidth: 1,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          angleLines: {
            display: true
          },
          suggestedMin: 0,
          suggestedMax: 5
        }
      },
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: title,
        },
      },
    };

    return (
      <Box sx={{ height: 300, width: '100%', maxWidth: 400, margin: 'auto' }}>
        <Radar data={chartData} options={options} />
      </Box>
    );
  };

  if (isLoading) {
    return <CircularProgress className="circular-progress" />;
  }

  if (error) {
    return <Alert severity="error" className="alert">{error}</Alert>;
  }

  return (
    <Box className="user-rating-dashboard" sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Your Performance Dashboard</Typography>
      <Typography variant="subtitle1" gutterBottom>
        User: {store.auth.meJson?.displayName}
      </Typography>
      <Typography variant="body2" gutterBottom>
        Department: {store.auth.meJson?.department} | Job Title: {store.auth.meJson?.jobTitle}
      </Typography>
      <Typography variant="body2" gutterBottom>
        Current Assessment: {description}
      </Typography>

      <Tabs value={activeTab} onChange={handleTabChange} aria-label="rating tabs" sx={{ mb: 2 }}>
        <Tab label="Values" />
        <Tab label="Leadership" />
        <Tab label="Competencies" />
      </Tabs>

      <Box sx={{ mt: 2 }}>
        {activeTab === 0 && (
          <>
            <RatingSection title="Value Ratings" ratings={valueAverageRatings} />
            <RatingChart title="Value Ratings" ratings={valueAverageRatings} />
          </>
        )}
        {activeTab === 1 && (
          <>
            <RatingSection title="Leadership Ratings" ratings={leadershipAverageRatings} />
            <RatingChart title="Leadership Ratings" ratings={leadershipAverageRatings} />
          </>
        )}
        {activeTab === 2 && (
          <>
            <RatingSection title="Competency Ratings" ratings={templateAverageRatings} />
            <RatingChart title="Competency Ratings" ratings={templateAverageRatings} />
          </>
        )}
      </Box>
    </Box>
  );
});

export default UserRatingDashboard;
