import { Box, Button, Popover, Typography } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";

import GenerateRatingsTablePDF from "./GenerateRatingsTablePDF";

import React from "react";
import { dateFormat } from "../../../logged-in/shared/utils/utils";
import { useAppContext } from "../../../shared/functions/Context";
import { ILeadershipRating } from "../../../shared/models/three-sixty-feedback-models/LeadershipRating";


interface IProp {
  data: ILeadershipRating[];
}

const TemplateRatingsTable = observer(({ data }: IProp) => {
  const { api, store } = useAppContext();
  const users = store.user.all.map((user) => user.asJson);
  const getUserName = (userId: string): string => {
    const user = users.find((user) => user.uid === userId);
    if (!user) {
      return "";
    }
    return user.displayName ?? "";
  };
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [popoverText, setPopoverText] = useState<string>("");

  const handlePopoverOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    const text = event.currentTarget.dataset.text;
    if (text) {
      setPopoverText(text);
    }
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  useEffect(() => {
    const load = async () => {
      await api.user.getAll();
    };
    load();
  }, [api.user]);

  const columns: GridColDef[] = [
    {
      field: "date",
      headerName: "Date",
      flex: 1,
      valueGetter: (params: { row?: ILeadershipRating }) => {
        return dateFormat(params.row?.date ??"");
      },
    },
    {
      field: "rater",
      headerName: "Rater",
      flex: 1,
      renderCell: (params) => {
        const row = params.row;

        if (!row) {
          console.error("Invalid params or row:", params);
          return "";
        }

        const raterIds = Object.keys(row.criteria ?? {});
        const raterId = raterIds.length > 0 ? raterIds[0] : "";
        return getUserName(raterId);
      },
    },
    {
      field: "dimension",
      headerName: "Dimension",
      flex: 1,
      renderCell: (params) => {
        const row = params.row;
        return row.dimension;
      },
    },
    {
      field: "start",
      headerName: "Start",
      flex: 1,
      renderCell: (params) => {
        const row = params.row;
        const criteria = row.criteria[Object.keys(row.criteria)[0]];
        const text = criteria.startDoing;
        return (
          <Button
            onClick={handlePopoverOpen}
            data-text={text}
            variant="text"
            size="small"
          >
            Show
          </Button>
        );
      },
    },
    {
      field: "stop",
      headerName: "Stop",
      flex: 1,
      renderCell: (params) => {
        const row = params.row;
        const criteria = row.criteria[Object.keys(row.criteria)[0]];
        const text = criteria.stopDoing;
        return (
          <Button
            onClick={handlePopoverOpen}
            data-text={text}
            variant="text"
            size="small"
          >
            Show
          </Button>
        );
      },
    },
    {
      field: "continue",
      headerName: "Continue",
      flex: 1,
      renderCell: (params) => {
        const row = params.row;
        const criteria = row.criteria[Object.keys(row.criteria)[0]];
        const text = criteria.continueDoing;
        return (
          <Button
            onClick={handlePopoverOpen}
            data-text={text}
            variant="text"
            size="small"
          >
            Show
          </Button>
        );
      },
    },
    {
      field: "comments",
      headerName: "Comments",
      flex: 1,
      renderCell: (params) => {
        const row = params.row;
        const criteria = row.criteria[Object.keys(row.criteria)[0]];
        const text = criteria.additionalComment;
        return (
          <Button
            onClick={handlePopoverOpen}
            data-text={text}
            variant="text"
            size="small"
          >
            Show
          </Button>
        );
      },
    },
  ];

  const createPDF = GenerateRatingsTablePDF(data);

  const handleExportPDF = () => {
    createPDF();
  };

  const handlePrint = () => {
  };
  
  const handleHistory = () => {
    // Handle history action
  };

  return (
    <Box>
  <Popover
    open={open}
    anchorEl={anchorEl}
    onClose={handlePopoverClose}
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "left",
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "left",
    }}
  >
    <Typography sx={{ p: 2 }}>{popoverText}</Typography>
  </Popover>
  <div className="print-hide">
    <Button onClick={handleExportPDF}>Export PDF</Button>
    <Button onClick={handlePrint}>Print</Button>
    <Button onClick={handleHistory}>History</Button>
  </div>

  <div className="data-grid-container">
    <DataGrid
      rows={data}
      columns={columns}
      getRowId={(row) => row.id}
      rowHeight={40}
      autoHeight
    />
  </div>
</Box>
  );
});

export default TemplateRatingsTable;
