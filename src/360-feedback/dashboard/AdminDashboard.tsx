import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Dialog from "@mui/material/Dialog";
import CloseIcon from "@mui/icons-material/Close";
import DialogContent from "@mui/material/DialogContent";
import { DialogActions, IconButton } from "@mui/material";
import RequestsCount from "../requests/RequestsCount";
import Home from "../home/Home";
import "./AdminDashboard.scss";
import { useAppContext } from "../../../shared/functions/Context";
import { observer } from "mobx-react-lite";
import AverageScoresByDepartment from "./Charts/DepartmentChart";
import ReviewStatusDistribution from "./Charts/ReviewStatus";

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

const AdminDashboard = observer(() => {
  const { api, store } = useAppContext();
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topRatedIndividual, setTopRatedIndividual] = useState<string | null>(null);
  const [lowRatedIndividual, setLowRatedIndividual] = useState<string | null>(null);
  const [openAboutDialog, setOpenAboutDialog] = useState(false);
  const [departmentAverages, setDepartmentAverages] = useState<{ [departmentName: string]: number }>({});
  const [flaggedRequestsCount, setFlaggedRequestsCount] = useState<number>(0);
  const [sortedRatings, setSortedRatings] = useState<any[]>([]);

  const getDepartmentName = (departmentId: string): string => {
    const department = store.department.all.find(department => department.asJson.id === departmentId)?.asJson;
    return department ? department.name ?? '' : '';
  };

  const getDisplayNameById = (userId: string) => {
    const user = store.user.all.find(user => user.asJson.uid === userId)?.asJson;
    return user ? user.displayName : undefined;
  };
  const currentUserId = store.auth.meJson?.uid;
  const displayName = currentUserId ? getDisplayNameById(currentUserId) : undefined;

  const currentHour = new Date().getHours();
  let greeting;
  let emoji;
  
  if (currentHour < 12) {
    greeting = "Good Morning";
    emoji = "☀️";
  } else if (currentHour < 18) {
    greeting = "Good Afternoon";
    emoji = "🌞";
  } else {
    greeting = "Good Evening";
    emoji = "🌙";
  }

  const valueRatings = store.valueRating.all.map(rating => rating.asJson);
  const leadershipRatings = store.leadershipRating.all.map(rating => rating.asJson);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching data...');
        await Promise.all([
          api.user.getAll(),
          api.department.getAll(), // Ensure this API call fetches department data
          api.ratingAssignments.getAll()
        ]);
  
        const users = store.user.all.map(user => user.asJson);
        console.log('Users fetched:', users.length);
  
        const inProgressAssignment = store.ratingAssignments.all.find(rate => rate.asJson.status === 'In Progress')?.asJson;
  
        console.log('In Progress Assignment:', inProgressAssignment);
  
        if (inProgressAssignment && users.length && inProgressAssignment.description) {
          const uids = users.map(user => user.uid);
          await Promise.all([
            api.valueRating.getAllNew(uids, inProgressAssignment.description),
            api.leadershipRating.getAll(uids[0], inProgressAssignment.description),
          ]);
          console.log('Ratings fetched successfully');
  
          console.log('Value Ratings:', valueRatings);
          console.log('Leadership Ratings:', leadershipRatings);
  
          const groupedRatings: GroupedRatings = {};
  
          // Group and process value ratings
          valueRatings.forEach(rating => {
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
  
          // Group and process leadership ratings
          leadershipRatings.forEach(rating => {
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
  
          console.log('Grouped Ratings:', groupedRatings);
  
          const sortedRatingsData = Object.entries(groupedRatings)
            .map(([rateeId, ratings]) => {
              const totalOverallAverage = ratings.reduce((total, rating) => {
                let totalRatings = 0;
                let ratingCounter = 0;
  
                Object.entries(rating.raterData.ratings).forEach(([valueName, statements]) => {
                  let totalValueRating = 0;
                  let valueRatingCount = 0;
  
                  Object.values(statements).forEach(ratingDetail => {
                    if (Array.isArray(ratingDetail)) {
                      totalValueRating += ratingDetail.reduce((total, current) => total + current, 0);
                      valueRatingCount += ratingDetail.length;
                    } else {
                      totalValueRating += ratingDetail as number;
                      valueRatingCount += 1;
                    }
                  });
  
                  const averageRating = valueRatingCount > 0 ? totalValueRating / valueRatingCount : 0;
                  totalRatings += averageRating;
                  ratingCounter += 1;
                });
  
                const overallAverageRating = ratingCounter > 0 ? totalRatings / ratingCounter : 0;
                return total + overallAverageRating;
              }, 0);
  
              const finalOverallAverage = ratings.length > 0 ? totalOverallAverage / ratings.length : 0;
              return { rateeId, ratings, finalOverallAverage };
            })
            .sort((a, b) => b.finalOverallAverage - a.finalOverallAverage); // Changed to descending order
  
          console.log('Sorted Ratings:', sortedRatingsData);
  
          setSortedRatings(sortedRatingsData);
  
          // Find top-rated individual
          if (sortedRatingsData.length > 0) {
            const topRatedUser = getDisplayNameById(sortedRatingsData[0].rateeId);
            setTopRatedIndividual(topRatedUser ?? 'N/A');
          } else {
            setTopRatedIndividual('N/A');
          }
  
          // Find low-rated individual with overall rating lower than 3
          const lowRatedRating = sortedRatingsData.find(rating => rating.finalOverallAverage < 3);
          if (lowRatedRating) {
            const lowRatedUser = getDisplayNameById(lowRatedRating.rateeId);
            setLowRatedIndividual(lowRatedUser ?? 'N/A');
          } else {
            setLowRatedIndividual('N/A');
          }
  
          // Calculate department averages
          const departmentRatings: { [departmentName: string]: number[] } = {};
  
          sortedRatingsData.forEach(rating => {
            const user = store.user.all.find(user => user.asJson.uid === rating.rateeId)?.asJson;
            if (user && user.department) {
              const departmentName = getDepartmentName(user.department);
              if (departmentName) {
                if (!departmentRatings[departmentName]) {
                  departmentRatings[departmentName] = [];
                }
                departmentRatings[departmentName].push(rating.finalOverallAverage);
              }
            }
          });
  
          const departmentAvg: { [departmentName: string]: number } = {};
  
          Object.entries(departmentRatings).forEach(([departmentName, ratings]) => {
            const averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
            departmentAvg[departmentName] = averageRating;
          });
  
          setDepartmentAverages(departmentAvg);
          console.log('Department Averages:', departmentAvg);
  
          // Update flagged requests count
          const flaggedCount =
            valueRatings.filter(
              rating =>
                rating.isflagged && rating.adminApproval !== "Approved for Re-rating" && rating.resubmission !== 'Open'
            ).length +
            leadershipRatings.filter(
              rating =>
                rating.isflagged && rating.adminApproval !== "Approved for Re-rating" && rating.resubmission !== 'Open'
            ).length;
           
          setFlaggedRequestsCount(flaggedCount);
        } else {
          console.log('Conditions not met for fetching ratings');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('An error occurred while fetching data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [api, store]);
  

  const toggleDetails = (rateeId: string, raterId: string) => {
    setShowDetails(prevState => ({
      ...prevState,
      [`${rateeId}-${raterId}`]: !prevState[`${rateeId}-${raterId}`],
    }));
  };

  const handleAboutClick = () => {
    setOpenAboutDialog(true);
  };

  const handleCloseAboutDialog = () => {
    setOpenAboutDialog(false);
  };

  const onViewTab = (tab: string) => {
    navigate(`/c/threesixty/home/overview?tab=${tab}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }
  // Get top 6 rated individuals
  const top6RatedIndividuals = sortedRatings.slice(0, 6).map((rating) => ({
    displayName: getDisplayNameById(rating.rateeId),
    score: rating.finalOverallAverage.toFixed(2),
  }));


  const reviewStatusData = [
    { status: "Not Started", count: 10 },
    { status: "In Progress", count: 20 },
    { status: "Completed", count: 15 },
    
  ];

  return (
    <div className="AdminDashboard">
      {/* <div className="about-button-container">
        <button onClick={handleAboutClick}>About 360</button>
      </div> */}
    <div className="centralized-text">
        {displayName ? (
          <h2>{`${greeting}, ${displayName} ${emoji}`}</h2>
        ) : (
          <h2>{`${greeting} ${emoji}`}</h2>
        )}
        <p>Welcome to the Admin Dashboard</p>
        <div className="about-button-container">
           <a onClick={handleAboutClick}>About 360</a>
         </div>
       
      </div>

      <div className="card-container">
         <div className="info-card" onClick={() => onViewTab("requests-review")}>
           <div className="info-body">
             <p className="label">Review Requests</p>
             <p className="value">
               <div style={{ display: "flex", justifyContent: "center" }}>
                 <RequestsCount />
               </div>
             </p>
           </div>
         </div>
       
         <div className="info-card" onClick={() => onViewTab("top-rated")}>
           <div className="info-body">
             <h2 className="label">Top Rated</h2>
             <p className="value">{topRatedIndividual}</p>
           </div>
         </div>
       
         <div className="info-card" onClick={() => onViewTab("low-rated")}>
           <div className="info-body">
             <h2 className="label">Low Rated</h2>
             <p className="value" style={{ fontFamily: "Lexend, sans-serif", fontStyle: "normal" }}>
               {lowRatedIndividual}
             </p>
           </div>
         </div>
       
         <div className="info-card" onClick={() => onViewTab("flagged-requests")}>
           <div className="info-body">
             <h2 className="label">Flagged Requests</h2>
             <p className="value">{flaggedRequestsCount}</p>
           </div>
         </div>
       </div>
       
       <div className="grid-container">
         <div className="grid-item">
           <div className="card">
             <div className="department-container">
               <AverageScoresByDepartment data={Object.entries(departmentAverages).map(([department, averageScore]) => ({ department, averageScore }))} />
             </div>
           </div>
         </div>
       
         <div className="grid-item">
           <div className="card">
             <div className="top-rated-container">
               <ReviewStatusDistribution data={reviewStatusData} />
             </div>
           </div>
         </div>
       </div>


      <Dialog
        open={openAboutDialog}
        onClose={handleCloseAboutDialog}
        maxWidth="lg">
        <DialogActions>
          <IconButton aria-label="close" onClick={handleCloseAboutDialog}>
            <CloseIcon />
          </IconButton>
        </DialogActions>
        <DialogContent>
          <Home />
        </DialogContent>
      </Dialog>
    </div>
  );
});
export default AdminDashboard;
