import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useAppContext } from "../../../shared/functions/Context";
import { IUser } from "../../../shared/models/User";
import "./Dapartment.scss";


interface RaterData {
  ratings: {
    [key: string]: { [key: string]: number | number[] };
  };
  stopDoing: string;
  startDoing: string;
  continueDoing: string;
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

const Department = observer(() => {
  const { api, store } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [highestRatedDepartments, setHighestRatedDepartments] = useState<string[]>([]);
  const [lowestRatedDepartments, setLowestRatedDepartments] = useState<string[]>([]);
  const [departmentAverages, setDepartmentAverages] = useState<{ [departmentName: string]: number }>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          api.user.getAll(),
          api.department.getAll(),
          api.ratingAssignments.getAll(),
        ]);

        const users = store.user.all.map((user) => user.asJson);
        const description = store.ratingAssignments.all.find(
          (rate) => rate.asJson.status === "In Progress"
        )?.asJson.description;

        if (description && users.length) {
          const uids = store.user.all.map((user) => user.asJson.uid);
          await api.valueRating.getAllNew(uids, description);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [api, store]);

  useEffect(() => {
    if (!loading) {
      const calculateDepartmentAverages = () => {
        const valueRatings = store.valueRating.all.map((rating) => rating.asJson);
        const groupedRatings: GroupedRatings = valueRatings.reduce<GroupedRatings>((acc, rating) => {
          const rateeId = rating.rateeId;
          const raterEntries = Object.entries(rating.values);
          
          raterEntries.forEach(([raterId, raterData]) => {
            acc[rateeId] = acc[rateeId] || [];
            acc[rateeId].push({
              rateeId,
              raterId,
              raterData: raterData as RaterData,
              date: rating.date.toString(),
            });
          });
          
          return acc;
        }, {});

        const departmentAverages: { [departmentName: string]: number[] } = {};

        Object.entries(groupedRatings).forEach(([rateeId, ratings]) => {
          const rateeName = getDisplayNameById(rateeId);
          const userDetails = getUserDetails(rateeId);
          const departmentName = userDetails ? getDepartmentName(userDetails.department) : undefined;
      
          if (departmentName) {
            ratings.forEach(rating => {
              let totalRatings = 0;
              let ratingCounter = 0;

              Object.entries(rating.raterData.ratings).forEach(([valueName, statements]) => {
                let totalValueRating = 0;
                let valueRatingCount = 0;
    
                Object.values(statements).forEach((ratingDetail: any) => {
                  if (Array.isArray(ratingDetail)) {
                    totalValueRating += ratingDetail.reduce((sum, current) => sum + current, 0);
                    valueRatingCount += ratingDetail.length;
                  } else {
                    totalValueRating += ratingDetail;
                    valueRatingCount += 1;
                  }
                });
    
                const averageRating = valueRatingCount > 0 ? totalValueRating / valueRatingCount : 0;
                totalRatings += averageRating;
                ratingCounter += 1;
              });

              const overallAverageRating = ratingCounter > 0 ? totalRatings / ratingCounter : 0;

              if (departmentAverages[departmentName]) {
                departmentAverages[departmentName].push(overallAverageRating);
              } else {
                departmentAverages[departmentName] = [overallAverageRating];
              }
            });
          }
        });
      
        const averagedDepartments: { [departmentName: string]: number } = {};
        
        Object.entries(departmentAverages).forEach(([departmentName, ratings]) => {
          const averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
          averagedDepartments[departmentName] = averageRating;
        });
      
        setDepartmentAverages(averagedDepartments);

        const departmentNames = Object.keys(averagedDepartments);

        const highestRated = departmentNames.reduce((highest, current) => {
          return averagedDepartments[current] > averagedDepartments[highest] ? current : highest;
        }, departmentNames[0]);

        const lowestRated = departmentNames.reduce((lowest, current) => {
          return averagedDepartments[current] < averagedDepartments[lowest] ? current : lowest;
        }, departmentNames[0]);

        setHighestRatedDepartments([highestRated]);
        setLowestRatedDepartments([lowestRated]);
      };

      calculateDepartmentAverages();
    }
  }, [loading, store.valueRating.all]);

  const getDisplayNameById = (userId: string): string | undefined => {
    const user = store.user.all.find((user) => user.asJson.uid === userId)?.asJson;
    return user ? user.displayName ?? undefined : undefined;
  };

  const getUserDetails = (userId: string): IUser | null => {
    const user = store.user.all.find((user) => user.asJson.uid === userId)?.asJson;
    return user || null;
  };

  const getDepartmentName = (departmentId: string): string => {
    const department = store.department.all.find((department) => department.asJson.id === departmentId)?.asJson;
    return department ? department.name ?? "" : "";
  };

  return (
    <div className="department-container">
      {loading ? (
        <div className="loader">Loading...</div>
      ) : (
        <div className="ratings-tables">
          <div className="section highest-rated">
            <h2>Highest Rated Departments</h2>
            <table>
              <thead>
                <tr>
                  <th>Department Name</th>
                  <th>Average Rating</th>
                </tr>
              </thead>
              <tbody>
                {highestRatedDepartments.map((departmentName) => (
                  <tr key={departmentName}>
                    <td>{departmentName}</td>
                    <td>{departmentAverages[departmentName]?.toFixed(2) ?? "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="section lowest-rated">
            <h2>Lowest Rated Departments</h2>
            <table>
              <thead>
                <tr>
                  <th>Department Name</th>
                  <th>Average Rating</th>
                </tr>
              </thead>
              <tbody>
                {lowestRatedDepartments.map((departmentName) => (
                  <tr key={departmentName}>
                    <td>{departmentName}</td>
                    <td>{departmentAverages[departmentName]?.toFixed(2) ?? "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="section all-departments">
            <h2>All Departments</h2>
            <table>
              <thead>
                <tr>
                  <th>Department Name</th>
                  <th>Average Rating</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(departmentAverages).map(([departmentName, averageRating]) => (
                  <tr key={departmentName}>
                    <td>{departmentName}</td>
                    <td>{typeof averageRating === 'number' && !isNaN(averageRating) ? averageRating.toFixed(2) : "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
});

export default Department;
