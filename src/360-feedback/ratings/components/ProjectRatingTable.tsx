import { Box, Button, Popover, Typography } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";


import GenerateRatingsTablePDF from "./GenerateRatingsTablePDF";
import GeneratePrintablePage from "./GeneratePrintablePage";
import RaterCountByDimension from "./RaterCountByDimension";
import "./RatingTable.scss";

import PrintIcon from '@mui/icons-material/Print';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import GenerateRatingsTablePDFProject from "./GenerateRatingsTablePDFProject";


import { useAppContext } from "../../../shared/functions/Context";
import { ITemplateRating } from "../../../shared/models/three-sixty-feedback-models/TemplateRating";

interface IProp {
  data: ITemplateRating[];
}

const ProjectRatingTable = observer(({ data }: IProp) => {
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
  const templates = store.templates.all.map((template)=>{return template.asJson});

  const open = Boolean(anchorEl);
  const getTemplateTitle = (templateId: string): string => {
    console.log("Here is my dimesion for my template "+templateId)
    const foundTemplate = templates.find((template) => template.id === templateId);
    return foundTemplate ? foundTemplate.title : "";
  };
  useEffect(() => {
    const load = async () => {
      await api.user.getAll();
      await api.templates.getAll();
    };
    load();
  }, [api.user,api.templates]);

  // useEffect(() => {
  //   // Calculate dimensions and rater counts when data changes
  //   const calculateRaterCounts = () => {
  //     const dimensionsSet = new Set<string>();
  //     const counts: { [dimension: string]: number } = {};

  //     data.forEach((rating) => {
  //       dimensionsSet.add(rating.dimension);

  //       const raterIds = Object.keys(rating.criteria ?? {});
  //       raterIds.forEach((raterId) => {
  //         const dimension = rating.dimension;
  //         counts[dimension] = (counts[dimension] || 0) + 1;
  //       });
  //     });

  //     setDimensions(Array.from(dimensionsSet));
  //     setRaterCounts(counts);
  //   };

  //   calculateRaterCounts();
  // }, [data]);

  const columns: GridColDef[] = [
    {
      field: "date",
      headerName: "Date",
      flex: 1,
      renderCell: (params: { row?: ITemplateRating }) => {
        return dateFormat_YY_MM_DY_timeStamp(params.row?.dateRequested??0);
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

        const raterIds = Object.keys(row.value ?? {});
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
        return (getTemplateTitle(row.dimension))
      },
    },
    {
      field: "start",
      headerName: "Start",
      flex: 1,
      renderCell: (params) => {
        const row = params.row;
        const value =
          row.value && Object.keys(row.value).length > 0
            ? row.value[Object.keys(row.value)[0]]
            : null;
        const text = value ? value.startDoing : "";
        return <div title={text}>{text}</div>;
      },
    },
    {
      field: "stop",
      headerName: "Stop",
      flex: 1,
      renderCell: (params) => {
        const row = params.row;
        const value =
          row.value && Object.keys(row.value).length > 0
            ? row.value[Object.keys(row.value)[0]]
            : null;
        const text = value ? value.stopDoing : "";
        return <div title={text}>{text}</div>;
      },
    },
    {
      field: "continue",
      headerName: "Continue",
      flex: 1,
      renderCell: (params) => {
        const row = params.row;
        const value =
          row.value && Object.keys(row.value).length > 0
            ? row.value[Object.keys(row.value)[0]]
            : null;
        const text = value ? value.continueDoing : "";
        return <div title={text}>{text}</div>;
      },
    },
    {
      field: "comments",
      headerName: "Comments",
      flex: 1,
      renderCell: (params) => {
        const row = params.row;
        const value =
          row.value && Object.keys(row.value).length > 0
            ? row.value[Object.keys(row.value)[0]]
            : null;
        const text = value ? value.additionalComment : "";
        return <div title={text}>{text}</div>;
      },
    },
  ];

  // const createPDF = GenerateRatingsTablePDF(data);
   const createPDFProject = GenerateRatingsTablePDFProject(data);

  // const createPrintablePage = GeneratePrintablePage(data);

  const handleExportPDF = () => {
    // createPDF();
    createPDFProject()
  };

  const handlePrint = () => {
    // createPrintablePage();
  };

  return (
    <Box>
      <div className="non-printable">
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
          }}>
          <Typography sx={{ p: 2 }}>{popoverText}</Typography>
        </Popover>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-end",
          }}>
          <Button
            title="Export"
            onClick={handleExportPDF}
            className="feedback-button">
            <PictureAsPdfIcon />
          </Button>
          <Button
            title="Print"
            onClick={handlePrint}
            className="feedback-button">
            <PrintIcon />
          </Button>
        </div>
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

export default ProjectRatingTable;
function dateFormat_YY_MM_DY_timeStamp(arg0: any): import("react").ReactNode {
  throw new Error("Function not implemented.");
}

