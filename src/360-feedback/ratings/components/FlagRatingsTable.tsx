import React, { useState, useEffect } from "react";
import { Box, Button, Typography, IconButton, DialogTitle, Dialog, DialogActions, DialogContent } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { observer } from "mobx-react-lite";

import FlagIcon from "@mui/icons-material/Flag";
import PrintIcon from "@mui/icons-material/Print";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

import "./RatingTable.scss";


import GenerateRatingsTablePDF from "./GenerateRatingsTablePDF";
import GeneratePrintablePage from "./GeneratePrintablePage";

import { useAppContext } from "../../../shared/functions/Context";

interface ILeadershipRatings {
  overallRating: number;
  id: string;
  rateeId: string;
  dimension: string;
  isflagged: boolean;
  department: string;
  description: string;
  criteria: {
    [raterId: string]: {
      additionalComment?: string;
      stopDoing: string;
      startDoing: string;
      continueDoing: string;
      ratings: {
        [criteriaName: string]: {
          [statement: string]: number;
        };
      };
      leadershipScore?: number;
    };
  };
  date: number;
  raterId?: string;
  templateId?: string;
  heading?: string;
  reasonForRequest?: string;
  dueDate?: number;
  values?: {};
  archived?: boolean | undefined;
}

interface IProp {
  data: (ILeadershipRatings | ILeadershipRatings)[];
  description: string;
}

const FlagRatingsTable = observer(({ data, description }: { data: ILeadershipRatings[], description: string }) => {
  const { api, store } = useAppContext();
  const templates = store.templates.all.map((template) => template.asJson);

  const [selectedRow, setSelectedRow] = useState<ILeadershipRatings | null>(null);
  const [openFlagDialog, setOpenFlagDialog] = useState(false);
  const [openUnflagDialog, setOpenUnflagDialog] = useState(false);

  const handleToggleFlagRow = (row: ILeadershipRatings) => {
    setSelectedRow(row);
    if (row.isflagged) {
      setOpenUnflagDialog(true);
    } else {
      setOpenFlagDialog(true);
    }
  };

  const confirmFlagRow = async () => {
    if (selectedRow) {
      try {
        let updatedRating: any;
        if (selectedRow.dimension === "Values") {
          const checkInstore = store.valueRating.getItemById(selectedRow.id)?.asJson;
          if (checkInstore) {
            updatedRating = {
              ...checkInstore,
              isflagged: true,
              department: selectedRow.department,
              values: selectedRow.criteria,
            };
            await api.valueRating.update(updatedRating, updatedRating.rateeId, description);
          }
        } else if (selectedRow.dimension === "Leadership") {
          const checkInstore = store.leadershipRating.getItemById(selectedRow.id)?.asJson;
          if (checkInstore) {
            updatedRating = {
              ...checkInstore,
              isflagged: true,
              department: selectedRow.department,
              criteria: selectedRow.criteria,
            };
            await api.leadershipRating.update(updatedRating, updatedRating.rateeId, description);
          }
        } else {
          updatedRating = {
            ...selectedRow,
            isflagged: true,
            department: selectedRow.department,
          };
          await api.templateRating.update(updatedRating);
        }

        setSelectedRow(updatedRating);
        setOpenFlagDialog(false);

      } catch (error) {
        console.error("Error updating rating:", error);
      }
    }
  };

  const confirmUnflagRow = async () => {
    if (selectedRow) {
      try {
        let updatedRating: any;
        if (selectedRow.dimension === "Values") {
          const checkInstore = store.valueRating.getItemById(selectedRow.id)?.asJson;
          if (checkInstore) {
            updatedRating = {
              ...checkInstore,
              isflagged: false, // Set to false for unflagging
              department: selectedRow.department,
              values: selectedRow.criteria,
            };
            await api.valueRating.update(updatedRating, updatedRating.rateeId, description);
          }
        } else if (selectedRow.dimension === "Leadership") {
          const checkInstore = store.leadershipRating.getItemById(selectedRow.id)?.asJson;
          if (checkInstore) {
            updatedRating = {
              ...checkInstore,
              isflagged: false, // Set to false for unflagging
              department: selectedRow.department,
              criteria: selectedRow.criteria,
            };
            await api.leadershipRating.update(updatedRating, updatedRating.rateeId, description);
          }
        } else {
          updatedRating = {
            ...selectedRow,
            isflagged: false, // Set to false for unflagging
            department: selectedRow.department,
          };
          await api.templateRating.update(updatedRating);
        }

        setSelectedRow(updatedRating);
        setOpenUnflagDialog(false);

      } catch (error) {
        console.error("Error updating rating:", error);
      }
    }
  };

  const handleCloseFlagDialog = () => {
    setOpenFlagDialog(false);
  };

  const handleCloseUnflagDialog = () => {
    setOpenUnflagDialog(false);
  };

  const fetchData = async () => {
    await api.templates.getAll();
    await api.value.getAll();
    await api.leadership.getAll();
  };

  useEffect(() => {
    fetchData();
  }, [api.user, api.templates]);

  useEffect(() => {
    const load = async () => {
      try {
        await api.user.getAll();
        await api.ratingAssignments.getAll();

        const users = store.user.all.map((user) => user.asJson);
        const uids = users.map((user) => user.uid);
        const descriptions = store.ratingAssignments.all.find(
          (rating) => rating.asJson.isActive === true
        )?.asJson.description;

        if (descriptions) {
          await api.templateRating.getAll();
          await api.ratingAssignments.getAll();

          if (descriptions) {
            await api.valueRating.getAllNew(uids, descriptions);
            await api.leadershipRating.getAllNew(uids, descriptions);
          }
        }
      } catch (error) {
        console.error("Error loading APIs:", error);
      }
    };

    load();
  }, [api.valueRating, api.templateRating]);

  const getTemplateTitle = (templateId: string): string => {
    const foundTemplate = templates.find(
      (template) => template.id === templateId
    );
    return foundTemplate ? foundTemplate.title : "";
  };

  const columns: GridColDef[] = [
    {
      field: "date",
      headerName: "Date",
      flex: 1,
      renderCell: (params: { row?: ILeadershipRatings }) => {
        return dateFormat_YY_MM_DY_timeStamp(params.row?.date ?? 0);
      },
    },
    {
      field: "dimension",
      headerName: "Dimension",
      flex: 1,
      renderCell: (params) => {
        const row = params.row;
        if (row.dimension === "Values" || row.dimension === "Leadership") {
          return row.dimension;
        } else {
          return getTemplateTitle(row.dimension);
        }
      },
    },
    {
      field: "start",
      headerName: "Start",
      flex: 1,
      renderCell: (params) => {
        const row = params.row;
        const criteria =
          row.criteria && Object.keys(row.criteria).length > 0
            ? row.criteria[Object.keys(row.criteria)[0]]
            : null;
        const text = criteria ? criteria.startDoing : "";
        return <div title={text}>{text}</div>;
      },
    },
    {
      field: "stop",
      headerName: "Stop",
      flex: 1,
      renderCell: (params) => {
        const row = params.row;
        const criteria =
          row.criteria && Object.keys(row.criteria).length > 0
            ? row.criteria[Object.keys(row.criteria)[0]]
            : null;
        const text = criteria ? criteria.stopDoing : "";
        return <div title={text}>{text}</div>;
      },
    },
    {
      field: "continue",
      headerName: "Continue",
      flex: 1,
      renderCell: (params) => {
        const row = params.row;
        const criteria =
          row.criteria && Object.keys(row.criteria).length > 0
            ? row.criteria[Object.keys(row.criteria)[0]]
            : null;
        const text = criteria ? criteria.continueDoing : "";
        return <div title={text}>{text}</div>;
      },
    },
    {
      field: "comments",
      headerName: "Comments",
      flex: 1,
      renderCell: (params) => {
        const row = params.row;
        const criteria =
          row.criteria && Object.keys(row.criteria).length > 0
            ? row.criteria[Object.keys(row.criteria)[0]]
            : null;
        const text = criteria ? criteria.additionalComment : "";
        return <div title={text}>{text}</div>;
      },
    },
    {
      field: "isflagged",
      headerName: "Flagged",
      flex: 1,
      renderCell: (params: GridRenderCellParams<ILeadershipRatings>) => {
        const isFlagged = params.row.isflagged;
        return (
          <IconButton onClick={() => handleToggleFlagRow(params.row)}>
            <FlagIcon style={{ color: isFlagged ? "red" : "gray" }} />
          </IconButton>
        );
      },
    },
  ];

  const createPDF = GenerateRatingsTablePDF(data);
  const createPrintablePage = GeneratePrintablePage(data);

  const handleExportPDF = () => {
    createPDF();
  };

  const handlePrint = () => {
    createPrintablePage();
  };

  return (
    <Box className="rating-table-container">
      <div className="rating-table-header">
        <Typography className="rating-table-title">
          Ratings Overview 
        </Typography>
        <div className="rating-table-actions">
          <Button className="rating-table-button" onClick={handlePrint}>
            <PrintIcon />
          </Button>
          <Button className="rating-table-button" onClick={handleExportPDF}>
            <PictureAsPdfIcon />
          </Button>
        </div>
      </div>
      <div className="rating-table-content">
        <div className="rating-table-grid">
          <DataGrid
            rows={data}
            columns={columns}
            pageSizeOptions={[5, 10, 25, 50]}
            paginationModel={{ pageSize: 10, page: 0 }}
            disableRowSelectionOnClick
          />
        </div>
      </div>

      {/* Flag Dialog */}
      <Dialog open={openFlagDialog} onClose={handleCloseFlagDialog}>
        <DialogTitle>Confirm Flagging</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to flag this rating?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFlagDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmFlagRow} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Unflag Dialog */}
      <Dialog open={openUnflagDialog} onClose={handleCloseUnflagDialog}>
        <DialogTitle>Confirm Unflagging</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to unflag this rating?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUnflagDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmUnflagRow} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
});

export default FlagRatingsTable;

function dateFormat_YY_MM_DY_timeStamp(arg0: number): React.ReactNode {
  throw new Error("Function not implemented.");
}
