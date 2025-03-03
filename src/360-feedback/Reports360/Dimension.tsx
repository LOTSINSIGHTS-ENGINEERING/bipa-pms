import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";

import "./Dimension.scss";
import ValueRatingApi from "../../shared/apis/three-sixty-apis/ValueRatingApi";
import { useAppContext } from "../../shared/functions/Context";
import { IUser } from "../../shared/models/User";

interface ValueRatings {
  [key: string]: {
    [key: string]: number[];
  };
}

const Dimension = observer(() => {
  const { api, store } = useAppContext();
  const valueRatingApi = new ValueRatingApi(api, store);
  const [valueRatings, setValueRatings] = useState<ValueRatings>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching user and department data...");
        await api.user.getAll();
        await api.department.getAll();
        await api.ratingAssignments.getAll();

        const users = store.user.all.map((user) => user.asJson);
        console.log("Users loaded:", users);

        const description = store.ratingAssignments.all.find(
          (rate) => rate.asJson.status === "In Progress"
        )?.asJson.description;
        const uids = store.user.all.map((user) => user.asJson.uid);

        if (description && users.length) {
          const fetchedRatings = await valueRatingApi.getAllValueRatings(description, uids);
          console.log("Fetched Ratings from API:", fetchedRatings);

          const transformedRatings: ValueRatings = {};

          fetchedRatings.forEach((rating) => {
            Object.entries(rating.values).forEach(([raterId, raterData]) => {
              Object.entries(raterData.ratings).forEach(([valueName, statements]) => {
                const ratingValues = Object.values(statements).flat();
                if (!transformedRatings[valueName]) {
                  transformedRatings[valueName] = {};
                }
                if (!transformedRatings[valueName][raterId]) {
                  transformedRatings[valueName][raterId] = [];
                }
                transformedRatings[valueName][raterId] = [...ratingValues];
              });
            });
          });

          console.log("Transformed Ratings:", transformedRatings);
          setValueRatings(transformedRatings);
        } else {
          console.log("Description or users not found");
          setError("Description or users not found");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Error fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [api, store]);

  const getUserDetails = (userId: string): IUser | null => {
    const user = store.user.all.find((user) => user.asJson.uid === userId)?.asJson;
    return user || null;
  };

  const getDisplayNameById = (userId: string) => {
    const user = store.user.all.find((user) => user.asJson.uid === userId)?.asJson;
    return user ? user.displayName : undefined;
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
    <div className="rated-container">
      {Object.entries(valueRatings).map(([valueName, raterRatings]) => {
        const topRatedRatee = Object.entries(raterRatings).reduce(
          (maxRatee, [rateeId, ratings]) => {
            const averageRating =
              ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
            return averageRating > maxRatee.averageRating
              ? { rateeId, averageRating }
              : maxRatee;
          },
          { rateeId: "", averageRating: 0 }
        );
  
        if (!topRatedRatee.rateeId) {
          return null;
        }
  
        const rateeDetails = getUserDetails(topRatedRatee.rateeId);
        const rateeDisplayName = getDisplayNameById(topRatedRatee.rateeId);
        const rateeDepartment = rateeDetails
          ? getDepartmentName(rateeDetails.department)
          : "";
  
        return (
          <div key={valueName} className="rating-card">
            <div className="card-header">
              <h3>{valueName}</h3>
              </div>
              <div className="ratee-details">
                <h4>Ratee: {rateeDisplayName}</h4>
                {rateeDetails && (
                  <div>
                    <p>Department: {rateeDepartment}</p>
                    <p>Job Title: {rateeDetails.jobTitle}</p>
                  </div>
                )}
                <p>Average Rating: {topRatedRatee.averageRating.toFixed(2)}</p>
              </div>
            
          </div>
        );
      })}
    </div>
  );
  
});

export default Dimension;
