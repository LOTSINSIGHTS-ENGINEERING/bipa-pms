import React from "react";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { AveragedRating } from "../Reports";
import { Button } from "@mui/material";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

interface UserRatingReportPDFProps {
  averagedRatings: AveragedRating[];
  description: string;
  initials: string;
  getDisplayNameById: (userId: string) => string;
  getDepartmentName: (departmentId: string) => string;
}

const UserRatingReportPDF: React.FC<UserRatingReportPDFProps> = ({
  averagedRatings,
  description,
  initials,
  getDisplayNameById,
  getDepartmentName,
}) => {
  const generatePDF = () => {
    const docDefinition = {
      content: [
        { text: "User Rating Report", style: "header" },
        { text: `Assessment: ${description}`, style: "subheader" },
        ...averagedRatings.map((rating) => {
          const rateeName = getDisplayNameById(rating.rateeId);
          const departmentName = getDepartmentName(rating.rateeId);

          return {
            stack: [
              {
                columns: [
                  // {
                  //   width: 20,
                  //   height: 20,
                  //   margin: [0, 0, 8, 0], // Margin to the right of the circle
                  //   canvas: [
                  //     {
                  //       type: "ellipse",
                  //       x: 25, // Center of the ellipse
                  //       y: 25, // Center of the ellipse
                  //       color: "#093545",
                  //       fillOpacity: 1,
                  //       r1: 25, // Radius
                  //       r2: 25, // Radius
                  //       lineColor: "#2EBDA6",
                  //       lineWidth: 2,
                  //     },
                  //   ],
                  // },
                  {
                    stack: [
                      // {
                      //   text: `${initials}`,
                      //   style: "userInitials",
                      //   alignment: "center",
                      //   margin: [0, 0, 0, 5], // Margin around the initials
                      // },
                      {
                        text: `${rateeName}`,
                        style: "rateeName",
                      },
                      {
                        text: `Department: ${departmentName}`,
                        style: "departmentName",
                      },
                      {
                        text: `Job Title: ${rating.rateeId}`,
                        style: "jobTitle",
                      },
                      {
                        text: `Current Assessment: ${description}`,
                        style: "description",
                      },
                    ],
                  },
                ],
              },
              {
                style: "ratingSection",
                table: {
                  headerRows: 1,
                  widths: ["*", "*"],
                  body: [
                    [
                      { text: "Value Ratings", style: "tableHeader" },
                      { text: "Value", style: "tableHeader" },
                    ],
                    ...Object.entries(rating.valueAverages).map(([key, value]) => [
                      key,
                      { text: value.toFixed(2), style: "tableCell" },
                    ]),
                  ],
                },
                layout: {
                  fillColor: (rowIndex: number) =>
                    rowIndex % 2 === 0 ? "#E1EFFA" : null,
                  hLineColor: "#0B5454",
                  vLineColor: "#0B5454",
                },
              },
              {
                style: "ratingSection",
                table: {
                  headerRows: 1,
                  widths: ["*", "*"],
                  body: [
                    [
                      { text: "Leadership Ratings", style: "tableHeader" },
                      { text: "Value", style: "tableHeader" },
                    ],
                    ...Object.entries(rating.leadershipAverages).map(([key, value]) => [
                      key,
                      { text: value.toFixed(2), style: "tableCell" },
                    ]),
                  ],
                },
                layout: {
                  fillColor: (rowIndex: number) =>
                    rowIndex % 2 === 0 ? "#E1EFFA" : null,
                  hLineColor: "#0B5454",
                  vLineColor: "#0B5454",
                },
              },
              {
                text: `Overall Rating: ${rating.finalOverallAverage.toFixed(2)}`,
                style: "overallRating",
              },
            ],
          };
        }),
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10],
          color: "#0B5454",
        },
        subheader: {
          fontSize: 16,
          bold: true,
          margin: [0, 10, 0, 15],
          color: "#084444",
        },
        rateeName: {
          fontSize: 14,
          bold: true,
          color: "#0B5454",
        },
        // userInitials: {
        //   fontSize: 12,
        //   bold: true,
        //   color: "#ffffff",
        //   alignment: "center",
        //   margin: [0, 0, 0, 5],
        // },
        departmentName: {
          fontSize: 12,
          margin: [0, 0, 0, 5],
          color: "#084444",
        },
        jobTitle: {
          fontSize: 12,
          margin: [0, 0, 0, 10],
          color: "#084444",
        },
        description: {
          fontSize: 12,
          margin: [0, 0, 0, 10],
          color: "#084444",
        },
        ratingSection: {
          margin: [0, 5, 0, 15],
        },
        tableHeader: {
          bold: true,
          fontSize: 12,
          color: "#ffffff",
          fillColor: "#0B5454",
        },
        tableCell: {
          fontSize: 10,
          color: "#0B5454",
        },
        overallRating: {
          fontSize: 14,
          bold: true,
          margin: [0, 10, 0, 10],
          color: "#0B5454",
        },
      },
    };

    const pdfDocGenerator = pdfMake.createPdf(docDefinition as any);
    pdfDocGenerator.download("UserRatingReport.pdf");
  };

  return (
    <Button
      variant="contained"
      color="primary"
      onClick={generatePDF}
      sx={{ backgroundColor: "#0B5454", "&:hover": { backgroundColor: "#084444" } }}
    >
      Generate PDF
    </Button>
  );
};

export default UserRatingReportPDF;
