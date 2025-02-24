
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";



import "./RequestsTable.scss";
import DetailView from "./DetailView";
import { Typography,Tooltip, Box, IconButton, Switch, Select, MenuItem } from "@mui/material";
import { dateFormat_YY_MM_DY } from "../../logged-in/shared/utils/utils";
import { useAppContext } from "../../shared/functions/Context";
import { ITemplateRating, defaultTemplateRating } from "../../shared/models/three-sixty-feedback-models/TemplateRating";


interface IProp {
  data: ITemplateRating[];
  onDataChange: () => void;
  showArchivedButton?: boolean; 
}

const RequestTable = observer(({ data, onDataChange, showArchivedButton = true }: IProp) => {
  const navigate = useNavigate();
  const { api, store } = useAppContext();
  const [templateRating, setTemplateRating] = useState<ITemplateRating>({
    ...defaultTemplateRating,
  });
  const users = store.user.all.map((user) => user.asJson);
  const templates = store.templates.all.map((dep) => dep.asJson);

  const [showCompleted, setShowCompleted] = useState<boolean>(false); // State for showing completed requests
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined); // State for selected year
  const [detailViewOpen, setDetailViewOpen] = useState<boolean>(false); // State for dialog
  const [selectedDetail, setSelectedDetail] = useState<ITemplateRating | null>(null); // State for selected detail data

  const getUserName = (userId: string): string => {
    const user = users.find((user) => user.uid === userId)?.displayName;
    return user ?? "";
  };

  const getTemplateName = (depId: string): string => {
    const template = templates.find((dep) => dep.id === depId)?.title;
    return template ?? "";
  };

  const handleArchive = async (rating: ITemplateRating) => {
    const updatedRating = {
      ...rating,
      archived: !rating.archived,
    };
    setTemplateRating(updatedRating); // Update local state immediately

    try {
      await api.templateRating.update(updatedRating);
      console.log("Updated rating ", updatedRating);
      // Fetch fresh data after update
      onDataChange();
    } catch (error) {
      console.error("Error updating rating: ", error);
      // Handle error scenario
    }
  };

  const handleViewDetails = (row: ITemplateRating) => {
    setSelectedDetail(row);
    setDetailViewOpen(true);
  };

  const handleCloseDetailView = () => {
    setDetailViewOpen(false);
    setSelectedDetail(null);
  };

  useEffect(() => {
    const load = async () => {
      await api.user.getAll();
      await api.templates.getAll();
    };
    load();
  }, [api.user, api.templates]);


  const columns: GridColDef[] = [
    {
      field: "dueDate",
      headerName: "Due Date",
      flex: 1,
      renderCell: (params: { row?: ITemplateRating }) => {
        return dateFormat_YY_MM_DY(params.row?.dateRequested ?? 0);
      },
    },
    {
      field: "rateeId",
      headerName: "Ratee",
      flex: 1,
      renderCell: (params) => {
        const row = params.row;
        const rateeId = row.rateeId;
        return getUserName(rateeId);
      },
    },
    {
      field: "raterId",
      headerName: "Rater",
      flex: 1,
      renderCell: (params) => {
        const row = params.row;
        const raterId = row.raterId;
        return getUserName(raterId);
      },
    },
    {
      field: "templateId",
      headerName: "Questionnaire",
      flex: 1,
      renderCell: (params) => {
        const row = params.row;
        const template = row.templateId;
        return getTemplateName(template);
      },
    },
    {
      field: "reasonForRequest",
      headerName: "Reason",
      flex: 1,
      renderCell: (params) => {
        const row = params.row;
        const reason = row.reasonForRequest;
        return reason;
      },
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => {
        const row = params.row;
        const status = row.status;
        return (
          <Typography color={status === "Completed" ? "primary" : "textSecondary"}>
            {status}
          </Typography>
        );
      },
    },
    {
      field: "Options",
      headerName: "Options",
      flex: 1,
      renderCell: (params) => {
        const isArchived = params.row.archived;
        
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Tooltip title={isArchived ? "Unarchive" : "Archive"}>
              <span>
                {showArchivedButton && (
                  <IconButton onClick={() => handleArchive(params.row)}>
                    {isArchived ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M21.706 5.292l-2.999-2.999A.996.996 0 0 0 18 2H6a.996.996 0 0 0-.707.293L2.294 5.292A.994.994 0 0 0 2 6v13c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V6a.994.994 0 0 0-.294-.708zM6.414 4h11.172l1 1H5.414l1-1zM4 19V7h16l.002 12H4z"></path>
                        <path d="M7 14h3v3h4v-3h3l-5-5z"></path>
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M21.706 5.292l-2.999-2.999A.996.996 0 0 0 18 2H6a.996.996 0 0 0-.707.293L2.294 5.292A.994.994 0 0 0 2 6v13c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V6a.994.994 0 0 0-.294-.708zM6.414 4h11.172l1 1H5.414l1-1zM4 19V7h16l.002 12H4z"></path>
                        <path d="M14 9h-4v3H7l5 5 5-5h-3z"></path>
                      </svg>
                    )}
                  </IconButton>
                )}
              </span>
            </Tooltip>
            <Tooltip title="View Details">
              <IconButton onClick={() => handleViewDetails(params.row)}>
                <svg xmlns="http://www.w3.org/2000/svg"
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                >
                  <path d="M4 4h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 10h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 16h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4z"></path>
                </svg>
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  // Get unique years from data
  const uniqueYears = Array.from(new Set(data.map(row => new Date(row.dueDate).getFullYear())));

  return (
    <Box sx={{ height: 500 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ mr: 2 }}>Show Completed:</Typography>
        <Switch
          checked={showCompleted}
          onChange={() => setShowCompleted(!showCompleted)}
          color="primary"
        />
        <Typography variant="h6" sx={{ ml: 2 }}>Filter by Year:</Typography>
        <Select
            value={selectedYear ?? ""}
            onChange={(e) => setSelectedYear(e.target.value as number)}
            variant="outlined"
            sx={{ ml: 1, minWidth: 100, fontSize: '0.875rem', width:'5rem',height:'2rem' }}
          >
            <MenuItem value={undefined}>All</MenuItem>
            {uniqueYears.map(year => (
              <MenuItem key={year} value={year}>{year}</MenuItem>
            ))}
          </Select>
      </Box>
      <DataGrid
        rows={data.filter(row => {
          if (selectedYear === undefined) {
            return true; // Show all if no year selected
          } else {
            const rowYear = new Date(row.dueDate).getFullYear();
            return rowYear === selectedYear;
          }
        }).filter(row => showCompleted ? row.status === "Completed" : true)}
        columns={columns}
        getRowId={(row) => row.id}
        rowHeight={40}
        className="custom-data-grid"
      />
      <DetailView
        open={detailViewOpen}
        onClose={handleCloseDetailView}
        data={selectedDetail}
        getUserName={getUserName}
        getTemplateName={getTemplateName}
      />
    </Box>
  );
});

export default RequestTable;
