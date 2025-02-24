import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";

import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';
import './reports.scss';
import UserRatingReportPDF from "./components/UserRatingReportPDF";
import { useAppContext } from "../../shared/functions/Context";

export interface AveragedRating {
  rateeId: string;
  valueAverages: { [key: string]: number };
  leadershipAverages: { [key: string]: number };
  templateAverages: { [key: string]: number };
  overallValueAverage: number;
  overallLeadershipAverage: number;
  overallTemplateAverage: number;
  finalOverallAverage: number;
}

const UserRatingReport = observer(() => {
  const { api, store } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [averagedRatings, setAveragedRatings] = useState<AveragedRating[]>([]);
  const [description, setDescription] = useState("");
  const [initials, setInitials] = useState("");

  const me = store.auth.meJson;

  useEffect(() => {
    const name = me ? me.displayName || " " : " ";
    setInitials(name
      .split(" ")
      .map((namePart) => namePart[0])
      .join(""));
  }, [me]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await api.ratingAssignments.getAll();
        const activeAssignment = store.ratingAssignments.all.find(
          (rating) => rating.asJson.isActive === true
        );
        const activeDescription = activeAssignment?.asJson.description ?? "";
        setDescription(activeDescription);

        await Promise.all([
          api.valueRating.getAll(me?.uid ?? "", activeDescription),
          api.leadershipRating.getAll(me?.uid ?? "", activeDescription),
          api.templateRating.getAll()
        ]);
      } catch (err) {
        setError("Failed to load data. Please try again.");
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [api, store, me?.uid]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          api.user.getAll(),
          api.department.getAll(),
          api.ratingAssignments.getAll(),
        ]);

        const users = store.user.all.map((user) => user.asJson);
        const inProgressAssignment = store.ratingAssignments.all.find(
          (rate) => rate.asJson.status === "In Progress"
        )?.asJson;

        if (inProgressAssignment && users.length && inProgressAssignment.description) {
          const uids = users.map((user) => user.uid);
          await Promise.all([
            api.valueRating.getAllNew(uids, inProgressAssignment.description),
            api.leadershipRating.getAllNew(uids, inProgressAssignment.description)
          ]);
        }

        calculateAverages();
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("An error occurred while fetching data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [api, store]);

  const calculateAverages = () => {
    const valueRatings = store.valueRating.all.map((rating) => rating.asJson);
    const leadershipRatings = store.leadershipRating.all.map((rating) => rating.asJson);
    const templateRatings = store.templateRating.all.map((rating) => rating.asJson);

    const filteredRatings = store.user.all
      .filter(user => user.asJson.uid === me?.uid) // Filter by logged-in user's UID
      .map((user) => {
        const rateeId = user.asJson.uid;
        const userValueRatings = valueRatings.filter(rating => rating.rateeId === rateeId);
        const userLeadershipRatings = leadershipRatings.filter(rating => rating.rateeId === rateeId);
        const userTemplateRatings = templateRatings.filter(rating => rating.rateeId === rateeId);

        const valueAverages: { [key: string]: number } = {};
        const leadershipAverages: { [key: string]: number } = {};
        const templateAverages: { [key: string]: number } = {};

        // Calculate value averages
        userValueRatings.forEach(rating => {
          Object.entries(rating.values).forEach(([, raterData]) => {
            Object.entries(raterData.ratings).forEach(([valueName, statements]) => {
              if (!valueAverages[valueName]) valueAverages[valueName] = 0;
              let total = 0;
              let count = 0;
              Object.values(statements).forEach((rating: any) => {
                if (Array.isArray(rating)) {
                  total += rating.reduce((sum, val) => sum + val, 0);
                  count += rating.length;
                } else {
                  total += rating;
                  count++;
                }
              });
              valueAverages[valueName] += total / count;
            });
          });
        });

        // Calculate leadership averages
        userLeadershipRatings.forEach(rating => {
          Object.entries(rating.criteria).forEach(([, raterData]) => {
            Object.entries(raterData.ratings).forEach(([criteriaName, rating]) => {
              if (!leadershipAverages[criteriaName]) leadershipAverages[criteriaName] = 0;
              if (typeof rating === 'number') {
                leadershipAverages[criteriaName] += rating;
              } else if (typeof rating === 'object') {
                const ratingsArray = Object.values(rating) as number[];
                const avgRating = ratingsArray.reduce((sum, val) => sum + val, 0) / ratingsArray.length;
                leadershipAverages[criteriaName] += avgRating;
              }
            });
          });
        });

        // Calculate template averages
        userTemplateRatings.forEach(rating => {
          Object.entries(rating.values).forEach(([, raterData]) => {
            Object.entries(raterData.ratings).forEach(([criteriaName, rating]) => {
              if (!templateAverages[criteriaName]) templateAverages[criteriaName] = 0;
              if (typeof rating === 'number') {
                templateAverages[criteriaName] += rating;
              } else if (typeof rating === 'object') {
                const ratingsArray = Object.values(rating) as number[];
                const avgRating = ratingsArray.reduce((sum, val) => sum + val, 0) / ratingsArray.length;
                templateAverages[criteriaName] += avgRating;
              }
            });
          });
        });

        // Finalize averages
        Object.keys(valueAverages).forEach(key => {
          valueAverages[key] /= userValueRatings.length || 1;
        });
        Object.keys(leadershipAverages).forEach(key => {
          leadershipAverages[key] /= userLeadershipRatings.length || 1;
        });
        Object.keys(templateAverages).forEach(key => {
          templateAverages[key] /= userTemplateRatings.length || 1;
        });

        const overallValueAverage = Object.values(valueAverages).reduce((sum, val) => sum + val, 0) / (Object.keys(valueAverages).length || 1);
        const overallLeadershipAverage = Object.values(leadershipAverages).reduce((sum, val) => sum + val, 0) / (Object.keys(leadershipAverages).length || 1);
        const overallTemplateAverage = Object.values(templateAverages).reduce((sum, val) => sum + val, 0) / (Object.keys(templateAverages).length || 1);
        const finalOverallAverage = (overallValueAverage + overallLeadershipAverage + overallTemplateAverage) / 3;

        return {
          rateeId,
          valueAverages,
          leadershipAverages,
          templateAverages,
          overallValueAverage,
          overallLeadershipAverage,
          overallTemplateAverage,
          finalOverallAverage
        };
      });

    setAveragedRatings(filteredRatings.sort((a, b) => b.finalOverallAverage - a.finalOverallAverage));
  };

  const getDisplayNameById = (userId: string) => {
    const user = store.user.all.find((user) => user.asJson.uid === userId)?.asJson;
    return user ? user.displayName : "Unknown User";
  };

  const getDepartmentName = (departmentId: string): string => {
    const department = store.department.all.find((department) => department.asJson.id === departmentId)?.asJson;
    return department ? department.name ?? "" : "";
  };

  if (loading) {
    return <div className="loader">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="user-rating-report">
      <div className="rating-cards">
        {averagedRatings.map((rating) => {
          const { rateeId, valueAverages, leadershipAverages, templateAverages, overallValueAverage, overallLeadershipAverage, overallTemplateAverage, finalOverallAverage } = rating;
          const rateeName = getDisplayNameById(rateeId);
          const departmentName = getDepartmentName(store.user.all.find((user) => user.asJson.uid === rateeId)?.asJson.department || "");

          return (
            <div className="rating-card" key={rateeId}>
              <div className="card-header">
                <div className="user-info">
                  <div className="user-circle">
                    <Typography variant="h4" className="user-initials">
                      {initials}
                    </Typography>
                  </div>
                  <div className="user-details">
                    <Typography variant="h6" className="ratee-name">{rateeName}</Typography>
                    <Typography variant="body2">Current Assessment: {description}</Typography>
                    <div className="info-section">
                      <div className="info-item">
                        <strong>Department:</strong> {departmentName}
                      </div>
                      <div className="info-item">
                        <strong>Job Title:</strong> {store.user.all.find((user) => user.asJson.uid === rateeId)?.asJson.jobTitle || ""}
                      </div>
                    </div>
                  </div>
                </div>
               
                <div className="reports-pic">
                  <img src={`${process.env.PUBLIC_URL}/reports-pic.png`} alt="Reports" />
                </div> 
                <div className="pdf-btn">
                  <UserRatingReportPDF
                    averagedRatings={averagedRatings}
                    description={description}
                    initials={initials}
                    getDisplayNameById={(userId: string) => getDisplayNameById(userId) || ""}
                    getDepartmentName={getDepartmentName}
                  />
                </div>
              </div>
              <div className="card-body">
                <div className="rating-summary">
                  <Typography variant="h6">Overall Rating</Typography>
                  <Box position="relative" display="inline-flex">
                    <CircularProgress
                      variant="determinate"
                      value={finalOverallAverage * 20} // Assuming the rating is out of 5
                      size={100}
                      thickness={5}
                    />
                    <Box
                      top={0}
                      left={0}
                      bottom={0}
                      right={0}
                      position="absolute"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Typography variant="caption" component="div" color="textSecondary">
                        {`${finalOverallAverage.toFixed(2)}`}
                      </Typography>
                    </Box>
                  </Box>
                </div>
                <div className="rating-details">
                  <div className="rating-category">
                    <Tooltip title="Average of all value ratings given for this employee.">
                      <Typography variant="h6">
                        Value Ratings
                        <IconButton size="small">
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Typography>
                    </Tooltip>
                    <ul>
                      {Object.entries(valueAverages).map(([valueName, average]) => (
                        <li key={valueName}>
                          {valueName}: {average.toFixed(2)}
                        </li>
                      ))}
                    </ul>
                    <Typography variant="caption" color="textSecondary">
                      (Average: {overallValueAverage.toFixed(2)})
                    </Typography>
                  </div>
                  <div className="rating-category">
                    <Tooltip title="Average of all leadership ratings given for this employee.">
                      <Typography variant="h6">
                        Leadership Ratings
                        <IconButton size="small">
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Typography>
                    </Tooltip>
                    <ul>
                      {Object.entries(leadershipAverages).map(([criteriaName, average]) => (
                        <li key={criteriaName}>
                          {criteriaName}: {average.toFixed(2)}
                        </li>
                      ))}
                    </ul>
                    <Typography variant="caption" color="textSecondary">
                      (Average: {overallLeadershipAverage.toFixed(2)})
                    </Typography>
                  </div>
                  <div className="rating-category">
                    <Tooltip title="Average of all template ratings given for this employee.">
                      <Typography variant="h6">
                        Template Ratings
                        <IconButton size="small">
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Typography>
                    </Tooltip>
                    <ul>
                      {Object.entries(templateAverages).map(([criteriaName, average]) => (
                        <li key={criteriaName}>
                          {criteriaName}: {average.toFixed(2)}
                        </li>
                      ))}
                    </ul>
                    <Typography variant="caption" color="textSecondary">
                      (Average: {overallTemplateAverage.toFixed(2)})
                    </Typography>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default UserRatingReport;
