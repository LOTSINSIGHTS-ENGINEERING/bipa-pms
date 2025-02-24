import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

import { useEffect } from "react";

import { useAppContext } from "../../../shared/functions/Context";
import { ITemplateRating } from "../../../shared/models/three-sixty-feedback-models/TemplateRating";

// Define the fonts for pdfMake
pdfMake.vfs = pdfFonts.pdfMake.vfs;

// Define the function to generate the PDF

const GenerateRatingsTablePDFProject = (data: ITemplateRating[]) => {
  const { api, store } = useAppContext();
  const users = store.user.all.map((user) => user.asJson);
  const getUserName = (userId: string): string => {
    const user = users.find((user) => user.uid === userId);
    return user ? user.displayName ?? "" : "";
  };

  useEffect(() => {
    const load = async () => {
      await api.user.getAll();
    };
    load();
  }, [api.user]);

  // Function to create the PDF
  const createPDF = async () => {
    // Define the table data
    const tableData = data.map((rating) => {
      const criteria =
        rating.values && Object.keys(rating.values).length > 0
          ? rating.values[Object.keys(rating.values)[0]]
          : null;
      return [
        {
          text: new Date(rating.dateRequested ?? 0).toLocaleDateString(),
          style: "tableCell",
        },
        {
          text: getUserName(Object.keys(rating.values)[0]),
          style: "tableCell",
        },
        { text: rating.dimension, style: "tableCell" },
        { text: criteria ? criteria.startDoing : "", style: "tableCell" },
        { text: criteria ? criteria.stopDoing : "", style: "tableCell" },
        { text: criteria ? criteria.continueDoing : "", style: "tableCell" },
        {
          text: criteria ? criteria.additionalComment : "",
          style: "tableCell",
        },
      ];
    });

    // Define the table headers
    const tableHeaders = [
      { text: "Date", style: "tableHeader" },
      { text: "Rater", style: "tableHeader" },
      { text: "Dimension", style: "tableHeader" },
      { text: "Start", style: "tableHeader" },
      { text: "Stop", style: "tableHeader" },
      { text: "Continue", style: "tableHeader" },
      { text: "Comments", style: "tableHeader" },
    ];

    // Define the table
    const table = {
      headerRows: 1,
      widths: ["auto", "auto", "auto", "auto", "auto", "auto", "*"],
      body: [tableHeaders, ...tableData],
    };

    // Define the document definition
    const documentDefinition: any = {
      pageOrientation: 'landscape',
      content: [
        { text: 'Ratings Overview', style: 'header' },
        { text: ' ', style: 'subheader' },
        {
          table: table,
          layout: 'lightHorizontalLines'
        }
      ],
      styles: {
        header: {
          fontSize: 24,
          bold: true,
          margin: [0, 10, 0, 10],
          color: '#31708f'
        },
        subheader: {
          fontSize: 18,
          bold: true,
          margin: [0, 10, 0, 5],
          color: '#31b0d5'
        },
        tableHeader: {
          bold: true,
          fontSize: 12,
          color: '#333',
          fillColor: '#daf7fc',
          margin: [0, 5, 0, 5],
          alignment: 'center',
          // decoration: {
          //   borderRadius: 5 
          // }
        },
        tableCell: {
          fontSize: 10,
          margin: [0, 5, 0, 5],
          alignment: 'center',
          color: '#333',
        }
      }
    };
    
    // Open a new window to display the PDF
    const newWindow = window.open();

    // Create the PDF document
    pdfMake.createPdf(documentDefinition).open({}, newWindow);
  };

  // Return the function to generate the PDF
  return createPDF;
};

// Export the function for use in other components
export default GenerateRatingsTablePDFProject;
