import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { observer } from "mobx-react-lite";

import "./RatingTable.scss";


import GenerateRatingsTablePDF from "./GenerateRatingsTablePDF";
import GeneratePrintablePage from "./GeneratePrintablePage";


import { useAppContext } from "../../../shared/functions/Context";
import { ILeadershipRating, defaultLeadershipRating } from "../../../shared/models/three-sixty-feedback-models/LeadershipRating";
import { IValueRating } from "../../../shared/models/three-sixty-feedback-models/ValueRating";
import { dateFormat_YY_MM_DY_timeStamp } from "../../../shared/functions/TimestampToDate";
import { RESUBMISSION_EMAIL } from "../../../shared/apis/MailApi";

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
  dueDate?: string;
  values?: {};
  archived?: false;
}



interface IProp {
  data: (ILeadershipRating | ILeadershipRatings)[];
  description: string;
}

const AdminFlagRatingsTable = observer(({ data, description }: IProp) => {
  const { api, store, ui } = useAppContext();
  const me = store.auth.meJson?.uid;
  const user = store.user.selected;
  const templates = store.templates.all.map((template) => template.asJson);
  const [leadershipRating, setLeadershipRating] = useState<ILeadershipRating>({
    ...defaultLeadershipRating,
  });

  const [openReRatingDialog, setOpenReRatingDialog] = useState(false);
  const [selectedRow, setSelectedRow] = useState<ILeadershipRatings | null>(
    null
  );

  const fetchData = async () => {
    await api.user.getAll();
    await api.templates.getAll();
    await api.ratingAssignments.getAll();
  };

  useEffect(() => {
    fetchData();
  }, [api.user, api.templates]);

  const getTemplateTitle = (templateId: string): string => {
    const foundTemplate = templates.find(
      (template) => template.id === templateId
    );
    return foundTemplate ? foundTemplate.title : "";
  };

  const handleRequestReRating = async () => {
    if (!selectedRow) return;

    if (selectedRow.dimension === "Values") {
      console.log("Request re-rating for Values:", selectedRow);
      if (selectedRow.id) {
        const selectedRating = store.valueRating.getItemById(
          selectedRow.id
        )?.asJson;
        if (selectedRating) {
      
        
          const currentValueRating: IValueRating = {
            ...selectedRating,
            adminApproval: "Approved for Re-rating",
            resubmission: "To be rated",
          };

          await api.valueRating.update(
            currentValueRating,
            selectedRating.rateeId,
            description
          );

          const { MY_SUBJECT, MY_BODY } =
            user && me
              ? RESUBMISSION_EMAIL(user.email, me)
              : { MY_SUBJECT: "", MY_BODY: "" };

          try {
            await api.mail.sendMail1(
              [selectedRating.rateeId],
              MY_SUBJECT,
              MY_BODY,
              ""
            );
            ui.snackbar.load({
              id: Date.now(),
              type: "success",
              message: "Email sent.",
              timeoutInMs: 10000,
            });
          } catch (error) {
            console.log("Error sending email:", error);
            ui.snackbar.load({
              id: Date.now(),
              type: "warning",
              message: "Email not sent.",
              timeoutInMs: 10000,
            });
          }
          
        }
      }
    } else if (selectedRow.dimension === "Leadership") {
      
      if (selectedRow.id) {
        const selectedRating = store.leadershipRating.getItemById(
          selectedRow.id
        )?.asJson;
        if (selectedRating) {


          const currentValueRating: ILeadershipRating = {
            ...selectedRating,
            adminApproval: "Approved for Re-rating",
            resubmission: "To be rated",
          };

          await api.leadershipRating.update(
            currentValueRating,
            selectedRating.rateeId,
            description
          );

          //send email 
          const { MY_SUBJECT, MY_BODY } =
          user && me
            ? RESUBMISSION_EMAIL(user.email, me)
            : { MY_SUBJECT: "", MY_BODY: "" };

        try {
          await api.mail.sendMail1(
            [selectedRating.rateeId],
            MY_SUBJECT,
            MY_BODY,
            ""
          );
          ui.snackbar.load({
            id: Date.now(),
            type: "success",
            message: "Email sent.",
            timeoutInMs: 10000,
          });
        } catch (error) {
          console.log("Error sending email:", error);
          ui.snackbar.load({
            id: Date.now(),
            type: "warning",
            message: "Email not sent.",
            timeoutInMs: 10000,
          });
        }

        
        
        }
      }
    } else {
      console.log(
        "Cannot request re-rating for this dimension:",
        selectedRow.dimension
      );
    }

    setOpenReRatingDialog(false);
  };

  const handleReRatingClick = (row: ILeadershipRatings) => {
    setSelectedRow(row);
    setOpenReRatingDialog(true);
  };

  const columns: GridColDef[] = [
    {
      field: "date",
      headerName: "Date",
      flex: 1,
      renderCell: (params) => {
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
          <IconButton>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              style={{ color: isFlagged ? "red" : "gray" }}
            >
              <path d="m14.303 6-3-2H6V2H4v20h2v-8h4.697l3 2H20V6z"></path>
            </svg>
          </IconButton>
        );
      },
    },
    {
      field: "options",
      headerName: "Re-submit",
      flex: 1,
      renderCell: (params: GridRenderCellParams<ILeadershipRatings>) => {
        const row = params.row;

        return (
          <IconButton onClick={() => handleReRatingClick(row)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path d="M9 18h3v-2H9c-1.654 0-3-1.346-3-3s1.346-3 3-3h6v3l5-4-5-4v3H9c-2.757 0-5 2.243-5 5s2.243 5 5 5z"></path>
            </svg>
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
        <Typography className="rating-table-title">Ratings Overview</Typography>
        <div className="rating-table-actions">
          <Button className="rating-table-button" onClick={handlePrint}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path d="M19 7h-1V2H6v5H5a3 3 0 0 0-3 3v7a2 2 0 0 0 2 2h2v3h12v-3h2a2 2 0 0 0 2-2v-7a3 3 0 0 0-3-3zM8 4h8v3H8V4zm0 16v-4h8v4H8zm11-8h-4v-2h4v2z"></path>
            </svg>
            Print
          </Button>
          <Button className="rating-table-button" onClick={handleExportPDF}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path d="M8.267 14.68c-.184 0-.308.018-.372.036v1.178c.076.018.171.023.302.023.479 0 .774-.242.774-.651 0-.366-.254-.586-.704-.586zm3.487.012c-.2 0-.33.018-.407.036v2.61c.077.018.201.018.313.018.817.006 1.349-.444 1.349-1.396.006-.83-.479-1.268-1.255-1.268z"></path>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM9.498 16.19c-.309.29-.765.42-1.296.42a2.23 2.23 0 0 1-.308-.018v1.426H7v-3.936A7.558 7.558 0 0 1 8.219 14c.557 0 .953.106 1.22.319.254.202.426.533.426.923-.001.392-.131.723-.367.948zm3.807 1.355c-.42.349-1.059.515-1.84.515-.468 0-.799-.03-1.024-.06v-3.917A7.947 7.947 0 0 1 11.66 14c.757 0 1.249.136 1.633.426.415.308.675.799.675 1.504 0 .763-.279 1.29-.663 1.615zM17 14.77h-1.532v.911H16.9v.734h-1.432v1.604h-.906V14.03H17v.74zM14 9h-1V4l5 5h-4z"></path>
            </svg>
            Export as PDF
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

      <Dialog
        open={openReRatingDialog}
        onClose={() => setOpenReRatingDialog(false)}
      >
        <DialogTitle>Request Re-rating</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to send this rating for resubmission?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReRatingDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleRequestReRating} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
});

export default AdminFlagRatingsTable;
