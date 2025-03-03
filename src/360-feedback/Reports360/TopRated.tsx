import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";

import "./LowRated.scss"; 
import { Tooltip } from "@mui/material";
import { useAppContext } from "../../shared/functions/Context";
import { IUser } from "../../shared/models/User";

interface RaterData {
  ratings: {
    [key: string]: { [key: string]: number | number[] };
  };
  stopDoing: string;
  startDoing: string;
  continueDoing: string;
  type: 'value' | 'leadership';
}

interface GroupedRating {
  rateeId: string;
  raterId: string;
  raterData: RaterData;
  date: string;
}

interface GroupedRatings {
  [rateeId: string]: GroupedRating[];
}

const TopRated = observer(() => {
  const { api, store } = useAppContext();
  const [showDetails, setShowDetails] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      } catch (error) {
        setError("An error occurred while fetching data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [api, store]);

  const toggleDetails = (rateeId: string, raterId: string) => {
    setShowDetails((prevState) => ({
      ...prevState,
      [`${rateeId}-${raterId}`]: !prevState[`${rateeId}-${raterId}`],
    }));
  };

  const getUserDetails = (userId: string): IUser | null => {
    const user = store.user.all.find(
      (user) => user.asJson.uid === userId
    )?.asJson;
    return user || null;
  };

  const getDisplayNameById = (userId: string) => {
    const user = store.user.all.find(
      (user) => user.asJson.uid === userId
    )?.asJson;
    return user ? user.displayName : undefined;
  };

  const getDepartmentName = (departmentId: string): string => {
    const department = store.department.all.find(
      (department) => department.asJson.id === departmentId
    )?.asJson;
    return department ? department.name ?? "" : "";
  };

  if (loading) {
    return <div className="loader">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  const valueRatings = store.valueRating.all.map((rating) => rating.asJson);
  const leadershipRatings = store.leadershipRating.all.map((rating) => rating.asJson);

  const groupedRatings: GroupedRatings = {};

  valueRatings.forEach((rating) => {
    const rateeId = rating.rateeId;
    const raterEntries = Object.entries(rating.values);
    raterEntries.forEach(([raterId, raterData]) => {
      groupedRatings[rateeId] = groupedRatings[rateeId] || [];
      groupedRatings[rateeId].push({
        rateeId,
        raterId,
        raterData: { ...(raterData as RaterData), type: 'value' },
        date: rating.date.toString(),
      });
    });
  });

  leadershipRatings.forEach((rating) => {
    const rateeId = rating.rateeId;
    const raterEntries = Object.entries(rating.criteria);
    raterEntries.forEach(([raterId, raterData]) => {
      groupedRatings[rateeId] = groupedRatings[rateeId] || [];
      groupedRatings[rateeId].push({
        rateeId,
        raterId,
        raterData: { ...(raterData as RaterData), type: 'leadership' },
        date: rating.date.toString(),
      });
    });
  });

  const sortedRatings = Object.entries(groupedRatings)
    .map(([rateeId, ratings]) => {
      const totalOverallAverage = ratings.reduce((total, rating) => {
        let totalRatings = 0;
        let ratingCounter = 0;

        Object.entries(rating.raterData.ratings).forEach(([valueName, statements]) => {
          let totalValueRating = 0;
          let valueRatingCount = 0;

          Object.values(statements).forEach((ratingDetail) => {
            if (Array.isArray(ratingDetail)) {
              totalValueRating += ratingDetail.reduce(
                (total, current) => total + current,
                0
              );
              valueRatingCount += ratingDetail.length;
            } else {
              totalValueRating += ratingDetail;
              valueRatingCount += 1;
            }
          });

          const averageRating =
            valueRatingCount > 0 ? totalValueRating / valueRatingCount : 0;
          totalRatings += averageRating;
          ratingCounter += 1;
        });

        const overallAverageRating =
          ratingCounter > 0 ? totalRatings / ratingCounter : 0;
        return total + overallAverageRating;
      }, 0);

      const finalOverallAverage =
        ratings.length > 0 ? totalOverallAverage / ratings.length : 0;
      return { rateeId, ratings, finalOverallAverage };
    })
    .filter((rating) => rating.finalOverallAverage >= 3.0)
    .sort((a, b) => b.finalOverallAverage - a.finalOverallAverage);

  if (sortedRatings.length === 0) {
    return <div>No ratings found meeting the criteria.</div>;
  }

  return (
    <div className="top-rated-container">
      <ul className="ratee-list">
        {sortedRatings.map(({ rateeId, ratings, finalOverallAverage }) => {
          const rateeName = getDisplayNameById(rateeId);
          const userDetails = getUserDetails(rateeId);
          const departmentName = userDetails
            ? getDepartmentName(userDetails.department)
            : "";

          return (
            <li key={rateeId} className="ratee-item">
              <div className="ratee-header">
                <span className="ratee-name">{rateeName}</span>
                <span className="ratee-overall-average">
                  Overall Average: {finalOverallAverage.toFixed(2)}
                </span>
                <span className="ratee-department">
                  Department: {departmentName}
                </span>
                <span className="ratee-job-title">
                  Job Title: {userDetails?.jobTitle}
                </span>
              </div>
              <ul className="rater-list">
                {ratings.map(({ raterId, raterData, date }, index) => {
                  const raterName = getDisplayNameById(raterId);
                  return (
                    <li key={`${rateeId}-${raterId}-${index}`} className="rater-item">
                      <div className="rater-info">
                        <span className="rater-name">Rater: {raterName}</span>
                        <span className="rater-type">Type: {raterData.type === 'value' ? 'Value' : 'Leadership'}</span>
                        <button
                          className="details-button"
                          onClick={() => toggleDetails(rateeId, raterId)}
                        >
                          {showDetails[`${rateeId}-${raterId}`] ? "Hide Details" : "Show Details"}
                        </button>
                      </div>
                      {showDetails[`${rateeId}-${raterId}`] && (
                        <div className="details-row">
                          <table className="details-table">
                            <thead>
                              <tr>
                                <th>Date</th>
                                <th>{raterData.type === 'value' ? 'Value Name' : 'Leadership Criteria'}</th>
                                <th>Rating</th>
                                <th>Stop Doing</th>
                                <th>Start Doing</th>
                                <th>Continue Doing</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(raterData.ratings).map(
                                ([criteriaName, statements], criteriaIndex) => {
                                  const values = Object.values(statements).flat();
                                  const averageRating = values.reduce((sum, val) => sum + val, 0) / values.length;
  
                                  return (
                                    <tr key={criteriaIndex}>
                                      <td>{date}</td>
                                      <td>{criteriaName}</td>
                                      <td>{averageRating.toFixed(2)}</td>
                                      <td>{raterData.stopDoing}</td>
                                      <td>{raterData.startDoing}</td>
                                      <td>{raterData.continueDoing}</td>
                                    </tr>
                                  );
                                }
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ul>
    </div>
  );
});

export default TopRated;
