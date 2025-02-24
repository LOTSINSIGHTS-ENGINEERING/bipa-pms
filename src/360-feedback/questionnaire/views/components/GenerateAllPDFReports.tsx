import React from 'react';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { Button } from '@mui/material';
import { useAppContext } from '../../../../shared/functions/Context';


pdfMake.vfs = pdfFonts.pdfMake.vfs;

type AveragedRating = {
  rateeId: string;
  valueAverages: { [key: string]: number };
  leadershipAverages: { [key: string]: number };
  overallValueAverage: number;
  overallLeadershipAverage: number;
  finalOverallAverage: number;
};

const GenerateAllPDFReports: React.FC<{ ratings: AveragedRating[] }> = ({ ratings }) => {
  const { store } = useAppContext();

  const getDisplayNameById = (userId: string) => {
    const user = store.user.all.find(user => user.asJson.uid === userId)?.asJson;
    return user ? user.displayName : 'Unknown User';
  };

  const getDepartmentName = (userId: string) => {
    const user = store.user.all.find(user => user.asJson.uid === userId)?.asJson;
    const departmentId = user?.department;
    if (!departmentId) return 'N/A';
    const department = store.department.all.find(dept => dept.asJson.id === departmentId)?.asJson;
    return department ? department.name ?? 'N/A' : 'N/A';
  };

  const getJobTitle = (userId: string) => {
    const user = store.user.all.find(user => user.asJson.uid === userId)?.asJson;
    return user ? user.jobTitle ?? 'N/A' : 'N/A';
  };

  const formatNumber = (value: number): string => {
    return isNaN(value) ? 'N/A' : value.toFixed(2);
  };

  const generatePDF = () => {
    const docDefinition = {
      content: [
        { text: 'All User Rating Reports', style: 'header' },
        {
          table: {
            widths: [100, 'auto', 'auto', 'auto', 'auto', 'auto', 100, 100],
            body: [
              [
                { text: 'Name', style: 'tableHeader' },
                { text: 'Department', style: 'tableHeader' },
                { text: 'Job Title', style: 'tableHeader' },
                { text: 'Final Avg', style: 'tableHeader' },
                { text: 'Value Avg', style: 'tableHeader' },
                { text: 'Leadership Avg', style: 'tableHeader' },
                { text: 'Value Criteria', style: 'tableHeader' },
                { text: 'Leadership Criteria', style: 'tableHeader' },
              ],
              ...ratings.flatMap(rating => [
                [
                  { text: getDisplayNameById(rating.rateeId), style: 'tableCell' },
                  { text: getDepartmentName(rating.rateeId), style: 'tableCell' },
                  { text: getJobTitle(rating.rateeId), style: 'tableCell' },
                  { text: formatNumber(rating.finalOverallAverage), style: 'tableCell' },
                  { text: formatNumber(rating.overallValueAverage), style: 'tableCell' },
                  { text: formatNumber(rating.overallLeadershipAverage), style: 'tableCell' },
                  { text: '', style: 'tableCell' },
                  { text: '', style: 'tableCell' },
                ],
                ...Object.entries(rating.valueAverages).map(([criteria, value], index) => [
                  { text: '', colSpan: 6, border: [false, false, false, false] }, {}, {}, {}, {}, {},
                  { text: `${criteria}: ${formatNumber(value)}`, style: 'tableCell' },
                  { text: '', style: 'tableCell', border: [false, false, false, false] },
                ]),
                ...Object.entries(rating.leadershipAverages).map(([criteria, value], index) => [
                  { text: '', colSpan: 6, border: [false, false, false, false] }, {}, {}, {}, {}, {},
                  { text: '', style: 'tableCell', border: [false, false, false, false] },
                  { text: `${criteria}: ${formatNumber(value)}`, style: 'tableCell' },
                ]),
              ]),
            ],
          },
          layout: {
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => '#aaa',
            vLineColor: () => '#aaa',
            paddingLeft: () => 2,
            paddingRight: () => 2,
            paddingTop: () => 1,
            paddingBottom: () => 1,
          },
        },
      ],
      styles: {
        header: {
          fontSize: 14,
          bold: true,
          alignment: 'center',
          margin: [0, 0, 0, 10],
        },
        tableHeader: {
          bold: true,
          fontSize: 8,
          // color: 'black',
          fillColor: '#E1EFFA',
          alignment: 'center',
        },
        tableCell: {
          fontSize: 7,
        },
      },
      defaultStyle: {
        columnGap: 10,
      },
    };

    const pdfDocGenerator = pdfMake.createPdf(docDefinition as any);
    pdfDocGenerator.download('AllReports.pdf');
  };

  return (
   <Button
         onClick={generatePDF}
         startIcon={
           <svg
             fill="currentColor"
             viewBox="0 0 16 16"
             height="24px"  // Increase the size of the icon
             width="24px"
           >
             <path
               fillRule="evenodd"
               d="M14 4.5V14a2 2 0 01-2 2h-1v-1h1a1 1 0 001-1V4.5h-2A1.5 1.5 0 019.5 3V1H4a1 1 0 00-1 1v9H2V2a2 2 0 012-2h5.5L14 4.5zM1.6 11.85H0v3.999h.791v-1.342h.803c.287 0 .531-.057.732-.173.203-.117.358-.275.463-.474a1.42 1.42 0 00.161-.677c0-.25-.053-.476-.158-.677a1.176 1.176 0 00-.46-.477c-.2-.12-.443-.179-.732-.179zm.545 1.333a.795.795 0 01-.085.38.574.574 0 01-.238.241.794.794 0 01-.375.082H.788V12.48h.66c.218 0 .389.06.512.181.123.122.185.296.185.522zm1.217-1.333v3.999h1.46c.401 0 .734-.08.998-.237a1.45 1.45 0 00.595-.689c.13-.3.196-.662.196-1.084 0-.42-.065-.778-.196-1.075a1.426 1.426 0 00-.589-.68c-.264-.156-.599-.234-1.005-.234H3.362zm.791.645h.563c.248 0 .45.05.609.152a.89.89 0 01.354.454c.079.201.118.452.118.753a2.3 2.3 0 01-.068.592 1.14 1.14 0 01-.196.422.8.8 0 01-.334.252 1.298 1.298 0 01-.483.082h-.563v-2.707zm3.743 1.763v1.591h-.79V11.85h2.548v.653H7.896v1.117h1.606v.638H7.896z"
             />
           </svg>
         }
         sx={{
           padding: '12px 24px',  // Increase the padding for a larger button
           fontSize: '16px',  // Increase the font size of any text within the button
         }}
       >
       </Button>
  );
};

export default GenerateAllPDFReports;
