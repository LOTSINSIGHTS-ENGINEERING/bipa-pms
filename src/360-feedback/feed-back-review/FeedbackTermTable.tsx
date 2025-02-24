import { Box, Button, IconButton, Popover, Tooltip, Typography } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

//import { PDFViewer, Document, Page, Text } from '@react-pdf/renderer';
import ViewCompactIcon from "@mui/icons-material/ViewCompact";
import { IRateAssignment } from "../../shared/models/three-sixty-feedback-models/RateAssignments";
import { useAppContext } from "../../shared/functions/Context";
interface IProp {
  data: IRateAssignment[];
}

const FeedbackTermTable = observer(({ data }: IProp) => {
  const navigate = useNavigate();
  const { api, store } = useAppContext();
  
  const handleViewClick = (id: string) => {
    navigate(`/c/threesixty/home/feedback/reviews/${id}`)
  };

  const columns: GridColDef[] = [
    {
      field: "description",
      headerName: "Description",
      flex: 1,
      renderCell: (params) => {
        const row = params.row;
        const description = row.descriptions;
        return description;
      },
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => {
        const row = params.row;
        const status = row.status;
        return status;
      },
    },
    {
      field: "Options",
      headerName: "Options",
      flex: 1,
      renderCell: (params) => {
        return (
          <Tooltip title="View">
            <IconButton onClick={() => handleViewClick(params.row.id)}>
            <svg xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24">
              <path d="M4 4h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 10h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 16h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4z">
                </path></svg>
            </IconButton>
          </Tooltip>
        );
      },
    },
  ];

  // const PDFDocument = (
  // <Document>
  //   <Page size="A4">
  //     {data.map((item, index) => (
  //       <Text key={index}>{JSON.stringify(item)}</Text>
  //     ))}
  //   </Page>
  // </Document>
  // );

  return (
    <Box sx={{ height: 400 }}>
      
      <DataGrid
        rows={data}
        columns={columns}
        getRowId={(row) => row.id} // Use the appropriate identifier property
        rowHeight={40}
      />
    </Box>
  );
});

export default FeedbackTermTable;
