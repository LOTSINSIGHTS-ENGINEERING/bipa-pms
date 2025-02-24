import React, { useState, useEffect } from "react";

import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { observer } from "mobx-react-lite";
// import { useAppContext } from "../../../../shared/functions/Context";
import FlagIcon from "@mui/icons-material/Flag";
import PrintIcon from "@mui/icons-material/Print";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
// import { dateFormat_YY_MM_DY_timeStamp } from "../../../shared/utils/utils";
import "./RatingTable.scss";
// import { ILeadershipRating } from "../../../../shared/models/three-sixty-feedback-models/LeadershipRating";
// import { ITemplateRating } from "../../../../shared/models/three-sixty-feedback-models/TemplateRating";
import GenerateRatingsTablePDF from "./GenerateRatingsTablePDF";
import GeneratePrintablePage from "./GeneratePrintablePage";
import {} from "./useAverageValueRating";
import { IconButton, Box, Typography, Button } from "@mui/material";
import { useAppContext } from "../../../shared/functions/Context";
import { dateFormat_YY_MM_DY_timeStamp } from "../../../shared/functions/TimestampToDate";
import { ITemplateRating } from "../../../shared/models/three-sixty-feedback-models/TemplateRating";
import { IValueRating } from "../../../shared/models/three-sixty-feedback-models/ValueRating";
// import { Button } from "primereact/button";


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

const defaultRatings: ILeadershipRatings = {
  overallRating: 0,
  id: "",
  rateeId: "",
  dimension: "",
  isflagged: false,
  department: "",
  description: "",
  criteria: {},
  date: 0,
  raterId: "",
  templateId: "",
  heading: "",
  reasonForRequest: "",
  dueDate: "",
  values: {},
  archived: false,
};

interface IProp {
  data: ILeadershipRatings[];
}

const RatingsTable = observer(({ data }: IProp) => {
  const { api, store } = useAppContext();
  const templates = store.templates.all.map((template) => template.asJson);
  const [flaggedRows, setFlaggedRows] = useState<ILeadershipRatings[]>([]);

  const handleFlagRow = async (row: ILeadershipRatings) => {
    const isAlreadyFlagged = flaggedRows.some(
      (flaggedRow) => flaggedRow.id === row.id
    );
    let updatedFlaggedRows;

    if (isAlreadyFlagged) {
      updatedFlaggedRows = flaggedRows.filter(
        (flaggedRow) => flaggedRow.id !== row.id
      );
    } else {
      updatedFlaggedRows = [...flaggedRows, row];
    }

    setFlaggedRows(updatedFlaggedRows);

    const updatedRow = {
      ...row,
      isflagged: !row.isflagged,
    };

    try {
      if (row.dimension === "Values") {
        const updatedRating: IValueRating = {
          ...row,
          isflagged: !row.isflagged,
          department: row.department,
          values: row.criteria,
        };
        // await api.valueRating.update(updatedRating, updatedRating.rateeId, "2024 - 2025");
        console.log("see flaged rating values", updatedRating);
      } else if (row.dimension === "Leadership") {
        const updatedRating: ILeadershipRatings = {
          ...row,
          isflagged: !row.isflagged,
          department: row.department,
          criteria: row.criteria,
        };
        console.log("see flaged rating leadership", updatedRating);

        // await api.leadershipRating.update(updatedRating, updatedRating.rateeId, "2024 - 2025");
      } else {
        const updatedRating: ITemplateRating = {
          ...row,
          isflagged: !row.isflagged,
          department: row.department,
          raterId: "",
          templateId: "",
          heading: "",
          reasonForRequest: "",
          dueDate: 0,
          values: {},
          archived: false,
        };
        await api.templateRating.update(updatedRating);
      }
      // Fetch and update the data after successful update
      await fetchData();
    } catch (error) {
      console.error("Error updating rating:", error);
    }
  };

  const fetchData = async () => {
    await api.user.getAll();
    await api.templates.getAll();
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
      headerClassName: "bold-header",
      renderCell: (params: { row?: ILeadershipRatings }) => {
        return dateFormat_YY_MM_DY_timeStamp(params.row?.date ?? 0);
      },
    },
    {
      field: "dimension",
      headerName: "Dimension",
      flex: 1,
      headerClassName: "bold-header",
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
      headerClassName: "bold-header",
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
      headerClassName: "bold-header",
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
      headerClassName: "bold-header",
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
      headerClassName: "bold-header",
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
      field: "flagged",
      headerName: "Flag",
      flex: 1,
      headerClassName: "bold-header",
      renderCell: (params) => {
        const row = params.row;
  
        const isFlagged = flaggedRows.some(
          (flaggedRow) => flaggedRow.id === row.id
        );
  
        return (
          <IconButton
            className={`rating-table-flag-icon ${isFlagged ? "active" : ""}`}
            onClick={() => handleFlagRow(row)}
          >
            <FlagIcon />
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
    </Box>
  );
});

export default RatingsTable;
