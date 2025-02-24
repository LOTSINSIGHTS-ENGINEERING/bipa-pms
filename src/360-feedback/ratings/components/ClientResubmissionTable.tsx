import React, { useState, useEffect } from "react";
import { Box, Button, Typography, IconButton } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { observer } from "mobx-react-lite";

import FlagIcon from "@mui/icons-material/Flag";
import PrintIcon from "@mui/icons-material/Print";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ReplayIcon from "@mui/icons-material/Replay";

import "./RatingTable.scss";


import GenerateRatingsTablePDF from "./GenerateRatingsTablePDF";
import GeneratePrintablePage from "./GeneratePrintablePage";


import QuestionnaireBoxResubmission from "../../questionnaire/components/QuestionnaireBoxResubmission";
import { defaultValueRating, IValueRating } from "../../../shared/models/three-sixty-feedback-models/ValueRating";
import { IValue } from "../../../shared/models/three-sixty-feedback-models/Values";
import { defaultLeadership, ILeadership } from "../../../shared/models/three-sixty-feedback-models/Leadership";
import { defaultLeadershipRating, ILeadershipRating } from "../../../shared/models/three-sixty-feedback-models/LeadershipRating";
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
  dueDate?: string;
  values?: {};
  archived?: false;
}

interface IProp {
  data: (ILeadershipRating | ILeadershipRatings)[];
  description: string;
}

const ClientResubmissionTable = observer(({ data, description }: IProp) => {
  const { api, store } = useAppContext();
  const [selectedRating, setSelectedRating] = useState<
    IValue[] | ILeadership[]
  >([]);
  const valueRatings = store.value.all.map((value) => value.asJson);
  const criteria = store.leadership.all.map((value) => value.asJson);
  const templates = store.templates.all.map((template) => template.asJson);
  const [leadershipRating, setLeadershipRating] = useState<ILeadershipRating>({
    ...defaultLeadershipRating,
  });
  const [values, setValues] = useState<IValue | ILeadership>({
    ...defaultLeadership,
  });
  const [selectedRow, setSelectedRow] = useState<ILeadershipRatings | null>(
    null
  );
  const [showUserQuestionnaireBox, setShowUserQuestionnaireBox] =
    useState(false);
  const [showTable, setShowTable] = useState(true); // Set initial state to true
  const ratingAssignments = store.ratingAssignments.all.find(
    (r) => r.asJson.isActive === true
  )?.asJson;
  const [valueRating, setValueRating] = useState<IValueRating>({
    ...defaultValueRating,
  });

  const fetchData = async () => {
    await api.user.getAll();
    await api.templates.getAll();
    await api.ratingAssignments.getAll();
    await api.value.getAll();
    await api.leadership.getAll();
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
          <IconButton>
            <FlagIcon style={{ color: isFlagged ? "red" : "gray" }} />
          </IconButton>
        );
      },
    },
    {
      field: "options",
      headerName: "Options",
      flex: 1,
      renderCell: (params: GridRenderCellParams<ILeadershipRatings>) => {
        const row = params.row;

        const handleRequestReRating = async () => {
          // Check if the rating is "Values"
          if (row.dimension === "Values") {
            // Set the leadership rating object
            if (row.id) {
              const selectedRating = store.valueRating.getItemById(
                row.id
              )?.asJson;
              setSelectedRating(valueRatings);
              if (selectedRating) {
                const updated: IValueRating = { ...selectedRating };

                // await api.valueRating.create(
                //   updated,
                //   selectedRating?.rateeId,
                //   description
                // );
                console.log("Created rating:", updated);
              }

              console.log("Here is the selected road map ", valueRating);
            }

            // Optionally, perform other actions after setting the leadership rating
            if (leadershipRating) {
              console.log("Leadership rating has been set", leadershipRating);
            }

            // Set the selected row and show the UserQuestionnaireBox component
            setSelectedRow(row);
            setShowUserQuestionnaireBox(true);
            setShowTable(false); // Hide the table when showing the questionnaire
          }
          if (row.dimension === "Leadership") {
            console.log("selected leadership");

            setSelectedRating(criteria);
            setSelectedRow(row);
            setShowUserQuestionnaireBox(true);
            setShowTable(false); // Hide the table when showing the questionnaire
          } else {
            console.log(
              "Cannot request re-rating for this dimension:",
              row.dimension
            );
          }
        };

        return (
          <IconButton onClick={handleRequestReRating}>
            <ReplayIcon />
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

  const toggleTableVisibility = () => {
    setShowTable((prevShowTable) => !prevShowTable);
  };

  return (
    <Box className="rating-table-container">
      <div className="rating-table-header">
        <Typography className="rating-table-title">Resubmission Ratings Overview</Typography>
        <div className="rating-table-actions">
          <Button
            className="rating-table-button"
            onClick={toggleTableVisibility}>
            {showTable ? "Hide Table" : "Show Table"}
          </Button>
          <Button className="rating-table-button" onClick={handlePrint}>
            <PrintIcon />
            Print
          </Button>
          <Button className="rating-table-button" onClick={handleExportPDF}>
            <PictureAsPdfIcon />
            Export as PDF
          </Button>
        </div>
      </div>
      <div className="rating-table-content">
        {showTable && (
          <div className="rating-table-grid">
            <DataGrid
              rows={data}
              columns={columns}
              pageSizeOptions={[5, 10, 25, 50]}
              paginationModel={{ pageSize: 10, page: 0 }}
              disableRowSelectionOnClick
            />
          </div>
        )}
      </div>
      {showUserQuestionnaireBox && selectedRow && (
        <QuestionnaireBoxResubmission
          value={selectedRating}
          ratee={selectedRow.rateeId}
          rater={selectedRow.raterId}
          description={description}
          rating={selectedRow.id}
      
          
        />
      )}
    </Box>
  );
});

export default ClientResubmissionTable;
function dateFormat_YY_MM_DY_timeStamp(arg0: number): React.ReactNode {
  throw new Error("Function not implemented.");
}

