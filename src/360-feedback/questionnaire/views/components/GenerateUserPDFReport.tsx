import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

export const GenerateUserPDFReport = (userData: any) => {
  const docDefinition = {
    content: [
      { text: 'User Rating Report', style: 'header' },
      { text: `Name: ${userData.displayName}`, style: 'subheader' },
      { text: `Department: ${userData.departmentName}`, style: 'subheader' },
      { text: `Job Title: ${userData.jobTitle}`, style: 'subheader' },
      { text: `Final Average: ${userData.finalOverallAverage}`, style: 'subheader' },
      { text: 'Value Ratings:', style: 'subheader' },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto'],
          body: [
            ['Value', 'Average'],
            ...Object.entries(userData.valueAverages).map(([key, value]) => [key, (value as number).toFixed(2)]),
          ]
        }
      },
      { text: 'Leadership Ratings:', style: 'subheader' },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto'],
          body: [
            ['Criteria', 'Average'],
            ...Object.entries(userData.leadershipAverages).map(([key, value]) => [key, (value as number).toFixed(2)]),
          ]
        }
      }
    ],
    styles: {
      header: {
        fontSize: 22,
        bold: true,
        margin: [0, 0, 0, 10] as [number, number, number, number]
      },
      subheader: {
        fontSize: 16,
        bold: true,
        margin: [0, 10, 0, 5] as [number, number, number, number]
      }
    }
  };

  pdfMake.createPdf(docDefinition).download(`${userData.displayName}_RatingReport.pdf`);
};
