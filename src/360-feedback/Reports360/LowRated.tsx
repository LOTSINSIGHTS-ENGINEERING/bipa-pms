import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";

import "./LowRated.scss";
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

const LowRated = observer(() => {
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
    return store.user.all.find((user) => user.asJson.uid === userId)?.asJson || null;
  };

  const getDisplayNameById = (userId: string) => {
    return store.user.all.find((user) => user.asJson.uid === userId)?.asJson?.displayName;
  };

  const getDepartmentName = (departmentId: string): string => {
    return store.department.all.find((department) => department.asJson.id === departmentId)?.asJson?.name || "";
  };

  if (loading) return <div className="loader">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  const valueRatings = store.valueRating.all.map((rating) => rating.asJson);
  const leadershipRatings = store.leadershipRating.all.map((rating) => rating.asJson);

  const groupedRatings: GroupedRatings = {};

  // Group value ratings
  valueRatings.forEach((rating) => {
    Object.entries(rating.values).forEach(([raterId, raterData]) => {
      groupedRatings[rating.rateeId] = groupedRatings[rating.rateeId] || [];
      groupedRatings[rating.rateeId].push({
        rateeId: rating.rateeId,
        raterId,
        raterData: { ...(raterData as RaterData), type: 'value' },
        date: rating.date.toString(),
      });
    });
  });

  // Group leadership ratings
  leadershipRatings.forEach((rating) => {
    Object.entries(rating.criteria).forEach(([raterId, raterData]) => {
      groupedRatings[rating.rateeId] = groupedRatings[rating.rateeId] || [];
      groupedRatings[rating.rateeId].push({
        rateeId: rating.rateeId,
        raterId,
        raterData: { ...(raterData as RaterData), type: 'leadership' },
        date: rating.date.toString(),
      });
    });
  });

  const sortedRatings = Object.entries(groupedRatings)
    .map(([rateeId, ratings]) => {
      const totalOverallAverage = ratings.reduce((total, rating) => {
        const averages = Object.values(rating.raterData.ratings).map(statements => {
          const values = Object.values(statements).flat();
          return values.reduce((sum, val) => sum + val, 0) / values.length;
        });
        return total + (averages.reduce((sum, avg) => sum + avg, 0) / averages.length);
      }, 0);

      const finalOverallAverage = ratings.length > 0 ? totalOverallAverage / ratings.length : 0;
      return { rateeId, ratings, finalOverallAverage };
    })
    .filter((rating) => rating.finalOverallAverage <= 3)
    .sort((a, b) => a.finalOverallAverage - b.finalOverallAverage);

  return (
    <div className="low-rated-container">
      <ul className="ratee-list">
        {sortedRatings.map(({ rateeId, ratings, finalOverallAverage }) => {
          const rateeName = getDisplayNameById(rateeId);
          const userDetails = getUserDetails(rateeId);
          const departmentName = userDetails ? getDepartmentName(userDetails.department) : "";

          return (
            <li key={rateeId} className="ratee-item">
              <div className="ratee-header">
                <h3>{rateeName}</h3>
                <span className="ratee-overall-average">Overall Average: {finalOverallAverage.toFixed(2)}</span>
                <span className="ratee-department">Department: {departmentName}</span>
                <span className="ratee-job-title">Job Title: {userDetails?.jobTitle}</span>
              </div>
              <ul className="rater-list">
                {ratings.map(({ raterId, raterData, date }, index) => {
                  const raterName = getDisplayNameById(raterId); 
                  return (
                    <li key={`${rateeId}-${raterId}-${index}`} className="rater-item">
                      <div className="rater-info">
                        <span>Rater: {raterName}</span>
                        <span>Type: {raterData.type === 'value' ? 'Value' : 'Leadership'}</span>
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
                                    <tr key={`${criteriaName}-${criteriaIndex}`}>
                                      {criteriaIndex === 0 && (
                                        <td rowSpan={Object.keys(raterData.ratings).length}>
                                          {new Date(date).toLocaleDateString()}
                                        </td>
                                      )}
                                      <td>{criteriaName}</td>
                                      <td>{averageRating.toFixed(2)}</td>
                                      {criteriaIndex === 0 && (
                                        <>
                                          <td rowSpan={Object.keys(raterData.ratings).length}>
                                            {raterData.stopDoing}
                                          </td>
                                          <td rowSpan={Object.keys(raterData.ratings).length}>
                                            {raterData.startDoing}
                                          </td>
                                          <td rowSpan={Object.keys(raterData.ratings).length}>
                                            {raterData.continueDoing}
                                          </td>
                                        </>
                                      )}
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

export default LowRated;
