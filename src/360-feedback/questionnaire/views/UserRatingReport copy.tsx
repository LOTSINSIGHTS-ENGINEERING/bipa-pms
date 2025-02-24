import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import {
  Typography,
  Card,
  Grid,
  Pagination,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  LinearProgress,
  Box,
} from "@mui/material";
import ValueRatingApi from "../../../../shared/apis/three-sixty-apis/ValueRatingApi";
import LeadershipRatingApi from "../../../../shared/apis/three-sixty-apis/LeadershipRatingApi";
import GenerateUserRatingPDF from "../../ratings/components/GenerateUserRatingPDF";
import { useAppContext } from "../../../../shared/functions/Context";
import './UserRatingReport.scss';

interface IUser {
  uid: string;
  displayName: string | null;
  department: string;
  jobTitle: string;
}

interface Ratings {
  [key: string]: {
    [key: string]: number[];
  };
}

const UserRatingReport = observer(() => {
  const { api, store } = useAppContext();
  const [valueRatings, setValueRatings] = useState<Ratings>({});
  const [leadershipRatings, setLeadershipRatings] = useState<Ratings>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(4);
  const [departmentNames, setDepartmentNames] = useState<{ [key: string]: string }>({});
  const [filterByName, setFilterByName] = useState<string>("");
  const [filterByDepartment, setFilterByDepartment] = useState<string | null>(null);
  const [sortByNameAsc, setSortByNameAsc] = useState<boolean>(true);
  const [sortByNameDesc, setSortByNameDesc] = useState<boolean>(false);
  const [sortByDepartmentAsc, setSortByDepartmentAsc] = useState<boolean>(false);
  const [sortByDepartmentDesc, setSortByDepartmentDesc] = useState<boolean>(false);
  const [filterByRatingStatus, setFilterByRatingStatus] = useState<string>("all");


  const allUsers=store.user.all.map((user) => user.asJson.uid)

  const check=store.leadershipRating.all;
  console.log("here are my ratings",check)
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching user and department data...");
        await api.user.getAll();
        await api.department.getAll();
        await api.ratingAssignments.getAll();
        const description = store.ratingAssignments.all.find(
          (rate) => rate.asJson.status === "In Progress"
        )?.asJson.description;
  
        const allUsers = store.user.all.map((user) => user.asJson.uid);
  
        if (allUsers && description) {
          await api.leadershipRating.getAllNew(allUsers, description);
          await api.valueRating.getAllNew(allUsers, description);
        }
  
        const users = store.user.all.map((user) => user.asJson);
        console.log("Users loaded:", users);
  
        const departments = store.department.all.reduce((acc: { [key: string]: string }, dept) => {
          acc[dept.asJson.id] = dept.asJson.name;
          return acc;
        }, {});
        setDepartmentNames(departments);
  
        if (description && users.length) {
          const fetchedValueRatings = await new ValueRatingApi(api, store).getAllValueRatings(description, allUsers);
          const fetchedLeadershipRatings = await new LeadershipRatingApi(api, store).getAllLeadershipRatings(description, allUsers);
  
          console.log("Fetched Value Ratings:", fetchedValueRatings);
          console.log("Fetched Leadership Ratings:", fetchedLeadershipRatings);
  
          const transformRatings = (ratings: any[], type: string): Ratings => {
            const transformed: Ratings = {};
            ratings.forEach((rating: any) => {
              const rateeId = rating.rateeId;
              if (type === 'value') {
                Object.entries(rating.values).forEach(([raterId, raterData]: [string, any]) => {
                  Object.entries(raterData.ratings).forEach(([dimensionName, statements]: [string, any]) => {
                    const ratingValues = Object.values(statements).flat().filter((value): value is number => typeof value === 'number');
                    if (!transformed[dimensionName]) {
                      transformed[dimensionName] = {};
                    }
                    if (!transformed[dimensionName][rateeId]) {
                      transformed[dimensionName][rateeId] = [];
                    }
                    transformed[dimensionName][rateeId] = [...transformed[dimensionName][rateeId], ...ratingValues];
                  });
                });
              } else if (type === 'leadership') {
                Object.entries(rating.criteria).forEach(([raterId, raterData]: [string, any]) => {
                  Object.entries(raterData.rating).forEach(([criteriaName, statements]: [string, any]) => {
                    const ratingValues = Object.values(statements).flat().filter((value): value is number => typeof value === 'number');
                    if (!transformed[criteriaName]) {
                      transformed[criteriaName] = {};
                    }
                    if (!transformed[criteriaName][rateeId]) {
                      transformed[criteriaName][rateeId] = [];
                    }
                    transformed[criteriaName][rateeId] = [...transformed[criteriaName][rateeId], ...ratingValues];
                  });
                });
              }
            });
            return transformed;
          };
          
  
          setValueRatings(transformRatings(fetchedValueRatings, 'value'));
          setLeadershipRatings(transformRatings(fetchedLeadershipRatings, 'leadership'));
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
   

  const users = store.user.all.map((user) => user.asJson as IUser);
  const activeRatingAssignment = store.ratingAssignments.all.find((r) => r.asJson.isActive === true);
  const rateAssignments = activeRatingAssignment ? activeRatingAssignment.asJson.ratedUsersPerAssignmentValues : {};
  const leadershipAssignments = activeRatingAssignment ? activeRatingAssignment.asJson.ratedUsersPerAssignmentLeadership : {};

  const calculateRatingCounts = (assignments: { [key: string]: string[] }) => {
    return users.map((user) => {
      const userId = user.uid;
      const alreadyRatedUserIds = assignments[userId] || [];
      const matches = store.ratingAssignments.all
        .filter((match) => match.asJson.isActive)
        .map((match) => match.asJson.feedbackAssignments[userId])
        .flat();
      const actualUsers = users
        .filter((u) => matches.includes(u.uid))
        .map((u) => ({ value: u.uid, label: `${u.displayName} ${u.jobTitle}` }))
        .filter((u) => !alreadyRatedUserIds.includes(u.value));
      return {
        user: user.displayName || "",
        alreadyRatedCount: alreadyRatedUserIds.length,
        totalToRateCount: actualUsers.length + alreadyRatedUserIds.length,
      };
    });
  };

  const userRatingCounts = calculateRatingCounts(rateAssignments);
  const userLeadershipCounts = calculateRatingCounts(leadershipAssignments);

  const calculateAverageRatings = (ratings: Ratings, userId: string) => {
    return Object.entries(ratings).map(([dimension, userRatings]) => {
      const userRating = userRatings[userId];
      const averageRating =
        userRating && userRating.length
          ? (userRating.reduce((sum, rating) => sum + rating, 0) / userRating.length).toFixed(2)
          : "No Rating";
      return { dimension, averageRating };
    });
  };
  

  const filteredUsers = users.filter((user) => {
    const byName = user.displayName?.toLowerCase().includes(filterByName.toLowerCase()) ?? true; 
    const byDepartment = filterByDepartment ? user.department === filterByDepartment : true;
  
    const userRatingCount = userRatingCounts.find((count) => count.user === user.displayName);
    const alreadyRatedCount = userRatingCount?.alreadyRatedCount ?? 0; 
  
    let byRatingStatus = true;
    if (filterByRatingStatus === "rated") {
      byRatingStatus = alreadyRatedCount > 0;
    } else if (filterByRatingStatus === "unrated") {
      byRatingStatus = alreadyRatedCount === 0;
    }
  
    return byName && byDepartment && byRatingStatus;
  });
  
  

  // Sorting users
  const sortedUsers = [...filteredUsers];
  if (sortByNameAsc) {
    sortedUsers.sort((a, b) => (a.displayName || "").localeCompare(b.displayName || ""));
  } else if (sortByNameDesc) {
    sortedUsers.sort((a, b) => (b.displayName || "").localeCompare(a.displayName || ""));
  } else if (sortByDepartmentAsc) {
    sortedUsers.sort((a, b) => (departmentNames[a.department] || "").localeCompare(departmentNames[b.department] || ""));
  } else if (sortByDepartmentDesc) {
    sortedUsers.sort((a, b) => (departmentNames[b.department] || "").localeCompare(departmentNames[a.department] || ""));
  }

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (event: React.ChangeEvent<unknown>, pageNumber: number) => setCurrentPage(pageNumber);

  const handleGeneratePDF = () => {
    const generatePDF = GenerateUserRatingPDF(
      currentUsers,
      valueRatings,
      leadershipRatings,
      departmentNames,
      userRatingCounts,
      userLeadershipCounts
    );
    generatePDF();
  };

  return (
    <div className="admin-dashboard">
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <TextField
          label="Filter by User Name"
          variant="outlined"
          size="small"
          value={filterByName}
          onChange={(e) => setFilterByName(e.target.value)}
        />
        <FormControl variant="outlined" size="small" style={{ minWidth: '150px' }}>
          <InputLabel id="department-filter-label">Filter by Department</InputLabel>
          <Select
            labelId="department-filter-label"
            value={filterByDepartment || ''}
            onChange={(e) => setFilterByDepartment(e.target.value as string)}
            label="Filter by Department"
          >
            <MenuItem value="">All Departments</MenuItem>
            {Object.entries(departmentNames).map(([id, name]) => (
              <MenuItem key={id} value={id}>{name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl variant="outlined" size="small" style={{ minWidth: '150px' }}>
          <InputLabel id="rating-status-filter-label">Filter by Rating Status</InputLabel>
          <Select
            labelId="rating-status-filter-label"
            value={filterByRatingStatus}
            onChange={(e) => setFilterByRatingStatus(e.target.value as string)}
            label="Filter by Rating Status"
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="rated">Rated</MenuItem>
            <MenuItem value="unrated">Unrated</MenuItem>
          </Select>
        </FormControl>
        <div style={{ flexGrow: 1 }} />
        {/* <Tooltip title="Sort by Name">
            <IconButton 
              onClick={() => { 
                setSortByNameAsc(!sortByNameAsc); 
                setSortByNameDesc(false); 
                setSortByDepartmentAsc(false); 
                setSortByDepartmentDesc(false); 
              }}>
              <svg
                fill="#093545"  
                viewBox="0 0 16 16"
                height="1em"
                width="1em"
              >
                <path d="M6 10.5a.5.5 0 01.5-.5h3a.5.5 0 010 1h-3a.5.5 0 01-.5-.5zm-2-3a.5.5 0 01.5-.5h7a.5.5 0 010 1h-7a.5.5 0 01-.5-.5zm-2-3a.5.5 0 01.5-.5h11a.5.5 0 010 1h-11a.5.5 0 01-.5-.5z" />
              </svg>
              Name
            </IconButton>
          </Tooltip>
          <Tooltip title="Sort by Department">
               <IconButton 
                 onClick={() => { 
                   setSortByNameAsc(false); 
                   setSortByNameDesc(false); 
                   setSortByDepartmentAsc(!sortByDepartmentAsc); 
                   setSortByDepartmentDesc(false); 
                 }}>
                 <svg
                   fill="#093545"  // Change to your desired color
                   viewBox="0 0 16 16"
                   height="1em"
                   width="1em"
                 >
                   <path d="M6 10.5a.5.5 0 01.5-.5h3a.5.5 0 010 1h-3a.5.5 0 01-.5-.5zm-2-3a.5.5 0 01.5-.5h7a.5.5 0 010 1h-7a.5.5 0 01-.5-.5zm-2-3a.5.5 0 01.5-.5h11a.5.5 0 010 1h-11a.5.5 0 01-.5-.5z" />
                 </svg>
                 Department
               </IconButton>
            </Tooltip> */}
      </div>


           <Button
            variant="contained"
            color="primary"
            startIcon={
              <svg
                fill="#ffffff"  // Change to your desired color
                viewBox="0 0 16 16"
                height="1em"
                width="1em"
              >
                <path
                  fillRule="evenodd"
                  d="M14 4.5V14a2 2 0 01-2 2h-1v-1h1a1 1 0 001-1V4.5h-2A1.5 1.5 0 019.5 3V1H4a1 1 0 00-1 1v9H2V2a2 2 0 012-2h5.5L14 4.5zM1.6 11.85H0v3.999h.791v-1.342h.803c.287 0 .531-.057.732-.173.203-.117.358-.275.463-.474a1.42 1.42 0 00.161-.677c0-.25-.053-.476-.158-.677a1.176 1.176 0 00-.46-.477c-.2-.12-.443-.179-.732-.179zm.545 1.333a.795.795 0 01-.085.38.574.574 0 01-.238.241.794.794 0 01-.375.082H.788V12.48h.66c.218 0 .389.06.512.181.123.122.185.296.185.522zm1.217-1.333v3.999h1.46c.401 0 .734-.08.998-.237a1.45 1.45 0 00.595-.689c.13-.3.196-.662.196-1.084 0-.42-.065-.778-.196-1.075a1.426 1.426 0 00-.589-.68c-.264-.156-.599-.234-1.005-.234H3.362zm.791.645h.563c.248 0 .45.05.609.152a.89.89 0 01.354.454c.079.201.118.452.118.753a2.3 2.3 0 01-.068.592 1.14 1.14 0 01-.196.422.8.8 0 01-.334.252 1.298 1.298 0 01-.483.082h-.563v-2.707zm3.743 1.763v1.591h-.79V11.85h2.548v.653H7.896v1.117h1.606v.638H7.896z"
                />
              </svg>
            }
            onClick={handleGeneratePDF}
          >
            Generate PDF Report
          </Button>
      
      <Typography variant="h6" sx={{ mt: 4 }}>User Rating Report</Typography>
      <Grid container spacing={2}>
  {currentUsers.map((user) => {
    const valueAverageRatings = calculateAverageRatings(valueRatings, user.uid);
    const leadershipAverageRatings = calculateAverageRatings(leadershipRatings, user.uid);

    return (
      <Grid item xs={12} md={6} key={user.uid}>
        <Card variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h6">User: {user.displayName}</Typography>
          <div className="user-rating-card">
            <Typography variant="subtitle1">Value Ratings</Typography>
            <ul>
              {valueAverageRatings.map(({ dimension, averageRating }) => (
                <li key={dimension}>
                  <strong>{dimension}:</strong> {averageRating}/5
                </li>
              ))}
            </ul>
            <Typography variant="subtitle1">Leadership Ratings</Typography>
             <ul>
               {leadershipAverageRatings.map(({ dimension, averageRating }) => (
                 <li key={dimension}>
                   <strong>{dimension}:</strong> {averageRating}/5
                 </li>
               ))}
             </ul>

            <Typography variant="body2">
              <strong>Department:</strong> {departmentNames[user.department] || "Unknown"}
            </Typography>
            <Typography variant="body2">
              <strong>Job Title:</strong> {user.jobTitle}
            </Typography>
            <Box sx={{ mt: 'auto' }}>
              <Typography variant="subtitle2" gutterBottom>Values Rating Progress</Typography>
              <Typography variant="body2" gutterBottom>
                {`${userRatingCounts.find((count) => count.user === user.displayName)?.alreadyRatedCount || 0} / ${userRatingCounts.find((count) => count.user === user.displayName)?.totalToRateCount || 0}`}
              </Typography>
              
              <LinearProgress 
                variant="determinate" 
                value={(userRatingCounts.find((count) => count.user === user.displayName)?.alreadyRatedCount || 0) * 100 / (userRatingCounts.find((count) => count.user === user.displayName)?.totalToRateCount || 1)} 
              />
              
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Leadership Rating Progress</Typography>
              <Typography variant="body2" gutterBottom>
                {`${userLeadershipCounts.find((count) => count.user === user.displayName)?.alreadyRatedCount || 0} / ${userLeadershipCounts.find((count) => count.user === user.displayName)?.totalToRateCount || 0}`}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(userLeadershipCounts.find((count) => count.user === user.displayName)?.alreadyRatedCount || 0) * 100 / (userLeadershipCounts.find((count) => count.user === user.displayName)?.totalToRateCount || 1)} 
              />
            </Box>
          </div>
        </Card>
      </Grid>
    );   
  })}
</Grid>

      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
        <Pagination
          count={Math.ceil(filteredUsers.length / usersPerPage)}
          page={currentPage}
          onChange={paginate}
          shape="rounded"
          variant="outlined"
        />
      </div>
    </div>
  );
});

export default UserRatingReport;
