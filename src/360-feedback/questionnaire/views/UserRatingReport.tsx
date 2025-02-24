import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useAppContext } from "../../../../shared/functions/Context";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Modal,
  Button
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Close } from "@mui/icons-material";
import './UserRatingReport.scss';
import GenerateAllPDFReports from "./components/GenerateAllPDFReports";
import {GenerateUserPDFReport} from "./components/GenerateUserPDFReport";


// Define AveragedRating type if not already defined
type AveragedRating = {
  rateeId: string;
  valueAverages: { [key: string]: number };
  leadershipAverages: { [key: string]: number };
  overallValueAverage: number;
  overallLeadershipAverage: number;
  finalOverallAverage: number;
};

const ITEMS_PER_PAGE = 10;

const UserRatingReport = observer(() => {
  const { api, store } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [averagedRatings, setAveragedRatings] = useState<AveragedRating[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

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

    const averagedRatings: AveragedRating[] = store.user.all.map((user) => {
      const rateeId = user.asJson.uid;
      const userValueRatings = valueRatings.filter(rating => rating.rateeId === rateeId);
      const userLeadershipRatings = leadershipRatings.filter(rating => rating.rateeId === rateeId);

      const valueAverages: { [key: string]: number } = {};
      const leadershipAverages: { [key: string]: number } = {};

      // Calculate value averages
      userValueRatings.forEach(rating => {
        Object.entries(rating.values).forEach(([, raterData]) => {
          Object.entries(raterData.ratings).forEach(([valueName, statements]) => {
            if (!valueAverages[valueName]) valueAverages[valueName] = 0;
            let total = 0;
            let count = 0;
            Object.values(statements).forEach((rating) => {
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
              const avgRating = Object.values(rating).reduce((sum, val) => sum + val, 0) / Object.values(rating).length;
              leadershipAverages[criteriaName] += avgRating;
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

      const overallValueAverage = Object.values(valueAverages).reduce((sum, val) => sum + val, 0) / (Object.keys(valueAverages).length || 1);
      const overallLeadershipAverage = Object.values(leadershipAverages).reduce((sum, val) => sum + val, 0) / (Object.keys(leadershipAverages).length || 1);
      const finalOverallAverage = (overallValueAverage + overallLeadershipAverage) / 2;

      return {
        rateeId,
        valueAverages,
        leadershipAverages,
        overallValueAverage,
        overallLeadershipAverage,
        finalOverallAverage
      };
    });

    setAveragedRatings(averagedRatings.sort((a, b) => b.finalOverallAverage - a.finalOverallAverage));
  };

  // const createPDF = GenerateRatingsTablePDF();
  // const createPrintablePage = GeneratePrintablePage();

  // const handleExportPDF = () => {
   
  // };

  // const handlePrint = () => {
  
  // };


  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCloseModal = () => {
    setSelectedUserId(null);
  };

     const handleGeneratePDF = (userId: string) => {
       const selectedUserData = averagedRatings.find(rating => rating.rateeId === userId);
       if (selectedUserData) {
         const userDetails = store.user.all.find(user => user.asJson.uid === userId)?.asJson;
         const userData = {
           displayName: getDisplayNameById(userId),
           departmentName: getDepartmentName(userDetails?.department),
           jobTitle: userDetails?.jobTitle || "",
           finalOverallAverage: selectedUserData.finalOverallAverage.toFixed(2),
           valueAverages: selectedUserData.valueAverages,
           leadershipAverages: selectedUserData.leadershipAverages
         };
         GenerateUserPDFReport(userData);
       }
     };

  const getDisplayNameById = (userId: string) => {
    const user = store.user.all.find((user) => user.asJson.uid === userId)?.asJson;
    return user ? user.displayName : "Unknown User";
  };

  const getDepartmentName = (departmentId: string | undefined) => {
    if (!departmentId) return 'N/A';
    const department = store.department.all.find(
      (department) => department.asJson.id === departmentId
    )?.asJson;
    return department ? department.name ?? "" : "N/A";
  };

  if (loading) {
    return (
      <Box className="loading-error-container">
        <Typography variant="h5">Loading...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="loading-error-container">
        <Typography variant="h5" color="error">{error}</Typography>
      </Box>
    );
  }

  const columns: GridColDef[] = [
    { field: 'rateeName', headerName: 'Name', width: 200 },
    { field: 'departmentName', headerName: 'Department', width: 400 },
    { field: 'jobTitle', headerName: 'Job Title', width: 200 },
    { field: 'finalOverallAverage', headerName: 'Final Average', width: 200, type: 'number' },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <IconButton onClick={() => setSelectedUserId(params.row.id)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 4h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 10h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 16h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4z"></path>
          </svg>
        </IconButton>
      ),
    },
  ];

  const rows = averagedRatings.map((rating) => {
    const rateeName = getDisplayNameById(rating.rateeId);
    const userDetails = store.user.all.find(user => user.asJson.uid === rating.rateeId)?.asJson;
    const departmentName = userDetails ? getDepartmentName(userDetails.department) : "";
    const jobTitle = userDetails?.jobTitle || "";

    return {
      id: rating.rateeId,
      rateeName,
      departmentName,
      jobTitle,
      finalOverallAverage: rating.finalOverallAverage.toFixed(2),
    };
  });

  // const handleGeneratePDF = (userId: string) => {

  //   console.log("Generating PDF for user:", userId);
    
  // };

  const selectedUserData = averagedRatings.find(rating => rating.rateeId === selectedUserId);

  return (
    <Box className="box-container">
       
      {/* <Typography variant="h4" gutterBottom>User Rating Report</Typography> */}
      {/* <Paper elevation={3} className="paper-container">
        <div className="rating-table-actions">
          <Button className="reports-table-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path d="M19 7h-1V2H6v5H5a3 3 0 0 0-3 3v7a2 2 0 0 0 2 2h2v3h12v-3h2a2 2 0 0 0 2-2v-7a3 3 0 0 0-3-3zM8 4h8v3H8V4zm0 16v-4h8v4H8zm11-8h-4v-2h4v2z"></path>
            </svg>
          </Button>
          <Button className="reports-table-button" >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path d="M8.267 14.68c-.184 0-.308.018-.372.036v1.178c.076.018.171.023.302.023.479 0 .774-.242.774-.651 0-.366-.254-.586-.704-.586zm3.487.012c-.2 0-.33.018-.407.036v2.61c.077.018.201.018.313.018.817.006 1.349-.444 1.349-1.396.006-.83-.479-1.268-1.255-1.268z"></path><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM9.498 16.19c-.309.29-.765.42-1.296.42a2.23 2.23 0 0 1-.308-.018v1.426H7v-3.936A7.558 7.558 0 0 1 8.219 14c.557 0 .953.106 1.22.319.254.202.426.533.426.923-.001.392-.131.723-.367.948zm3.807 1.355c-.42.349-1.059.515-1.84.515-.468 0-.799-.03-1.024-.06v-3.917A7.947 7.947 0 0 1 11.66 14c.757 0 1.249.136 1.633.426.415.308.675.799.675 1.504 0 .763-.279 1.29-.663 1.615zM17 14.77h-1.532v.911H16.9v.734h-1.432v1.604h-.906V14.03H17v.74zM14 9h-1V4l5 5h-4z"></path>
            </svg>
          </Button>
        </div>
        <DataGrid
          rows={rows}
          columns={columns}
          
          pagination
          paginationMode="server"
        />
      </Paper> */}
      
        <Paper elevation={3} className="paper-container">
          <div className="rating-table-actions">
            <GenerateAllPDFReports ratings={averagedRatings} />
           
          </div>
          <DataGrid
            rows={rows}
            columns={columns}
            pagination
            paginationMode="server"
          />
        </Paper>


      <Modal
        open={!!selectedUserId}
        onClose={handleCloseModal}
        aria-labelledby="user-details-modal"
        aria-describedby="user-details-description"
      >
        <div className="modal-backdrop">
          {selectedUserId && selectedUserData && (
            <Paper className="user-details-modal">
              <Box className="details-header">
                <Typography variant="h5">User Details</Typography>
                <IconButton onClick={handleCloseModal}>
                  <Close />
                </IconButton>
              </Box>
              <Box className="details-content">
                <Typography variant="h6">{getDisplayNameById(selectedUserData.rateeId)}</Typography>
                <Button className="reports-table-button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                      <path d="M19 7h-1V2H6v5H5a3 3 0 0 0-3 3v7a2 2 0 0 0 2 2h2v3h12v-3h2a2 2 0 0 0 2-2v-7a3 3 0 0 0-3-3zM8 4h8v3H8V4zm0 16v-4h8v4H8zm11-8h-4v-2h4v2z"></path>
                    </svg>
                   </Button>
                   <Button onClick={() => handleGeneratePDF(selectedUserId!)}>
                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                      <path d="M8.267 14.68c-.184 0-.308.018-.372.036v1.178c.076.018.171.023.302.023.479 0 .774-.242.774-.651 0-.366-.254-.586-.704-.586zm3.487.012c-.2 0-.33.018-.407.036v2.61c.077.018.201.018.313.018.817.006 1.349-.444 1.349-1.396.006-.83-.479-1.268-1.255-1.268z"></path><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM9.498 16.19c-.309.29-.765.42-1.296.42a2.23 2.23 0 0 1-.308-.018v1.426H7v-3.936A7.558 7.558 0 0 1 8.219 14c.557 0 .953.106 1.22.319.254.202.426.533.426.923-.001.392-.131.723-.367.948zm3.807 1.355c-.42.349-1.059.515-1.84.515-.468 0-.799-.03-1.024-.06v-3.917A7.947 7.947 0 0 1 11.66 14c.757 0 1.249.136 1.633.426.415.308.675.799.675 1.504 0 .763-.279 1.29-.663 1.615zM17 14.77h-1.532v.911H16.9v.734h-1.432v1.604h-.906V14.03H17v.74zM14 9h-1V4l5 5h-4z"></path>
                    </svg>
                  </Button>
                  
                <Typography>Department: {getDepartmentName(store.user.all.find(user => user.asJson.uid === selectedUserData.rateeId)?.asJson.department) || 'N/A'}</Typography>
                <Typography>Job Title: {store.user.all.find(user => user.asJson.uid === selectedUserData.rateeId)?.asJson.jobTitle || 'N/A'}</Typography>
                <Typography>Final Average: {selectedUserData.finalOverallAverage.toFixed(2)}</Typography>

                <TableContainer component={Paper} className="table-container">
                  <Table>
                    <TableHead className="table-header">
                      <TableRow>
                        <TableCell>Category</TableCell>
                        <TableCell align="right">Average</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>Value Ratings</TableCell>
                        <TableCell align="right">{selectedUserData.overallValueAverage.toFixed(2)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Leadership Ratings</TableCell>
                        <TableCell align="right">{selectedUserData.overallLeadershipAverage.toFixed(2)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Final Average</TableCell>
                        <TableCell align="right">{selectedUserData.finalOverallAverage.toFixed(2)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>

                <Typography variant="h6" gutterBottom>Value Ratings Breakdown</Typography>
                <TableContainer component={Paper} className="table-container">
                  <Table>
                    <TableHead className="table-header">
                      <TableRow>
                        <TableCell>Value</TableCell>
                        <TableCell align="right">Average</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(selectedUserData.valueAverages).map(([name, avg]) => (
                        <TableRow key={name}>
                          <TableCell>{name}</TableCell>
                          <TableCell align="right">{avg.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Typography variant="h6" gutterBottom>Leadership Ratings Breakdown</Typography>
                <TableContainer component={Paper} className="table-container">
                  <Table>
                    <TableHead className="table-header">
                      <TableRow>
                        <TableCell>Criteria</TableCell>
                        <TableCell align="right">Average</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(selectedUserData.leadershipAverages).map(([name, avg]) => (
                        <TableRow key={name}>
                          <TableCell>{name}</TableCell>
                          <TableCell align="right">{avg.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Paper>
          )}
        </div>
      </Modal>
    </Box>
  );
});

export default UserRatingReport;