import React from 'react';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Define the fonts for pdfMake
pdfMake.vfs = pdfFonts.pdfMake.vfs;

interface IUser {
  uid: string;
  displayName: string | null;
  department: string;
  jobTitle: string;
}

interface Ratings {
  [key: string]: {
    [key: string]: number[];
  };
}

interface RatingCounts {
  user: string;
  alreadyRatedCount: number;
  totalToRateCount: number;
}

interface PdfGeneratorProps {
  users: IUser[];
  valueRatings: Ratings;
  leadershipRatings: Ratings;
  departmentNames: { [key: string]: string };
  userRatingCounts: RatingCounts[];
  userLeadershipCounts: RatingCounts[];
  fileName: string;
}

const PdfGenerator: React.FC<PdfGeneratorProps> = ({
  users,
  valueRatings,
  leadershipRatings,
  departmentNames,
  userRatingCounts,
  userLeadershipCounts,
  fileName
}) => {

  const calculateAverageRatings = (ratings: Ratings, userId: string) => {
    return Object.entries(ratings).map(([dimension, userRatings]) => {
      const userRating = userRatings[userId];
      const averageRating =
        userRating && userRating.length
          ? (userRating.reduce((sum, rating) => sum + rating, 0) / userRating.length).toFixed(2)
          : "No Rating";
      return { dimension, averageRating };
    });
  };

  const createPDF = () => {
    const tableData = users.map((user) => {
      const valueAverageRatings = calculateAverageRatings(valueRatings, user.uid);
      const leadershipAverageRatings = calculateAverageRatings(leadershipRatings, user.uid);
      const userRatingCount = userRatingCounts.find((count) => count.user === user.displayName);
      const userLeadershipCount = userLeadershipCounts.find((count) => count.user === user.displayName);

      return [
        { text: user.displayName || "N/A", style: "tableCell" },
        { text: departmentNames[user.department] || "Unknown", style: "tableCell" },
        { text: user.jobTitle || "N/A", style: "tableCell" },
        { 
          ul: valueAverageRatings.map(({ dimension, averageRating }) => 
            `${dimension}: ${averageRating}/5`
          ),
          style: "tableCell"
        },
        { 
          ul: leadershipAverageRatings.map(({ dimension, averageRating }) => 
            `${dimension}: ${averageRating}/5`
          ),
          style: "tableCell"
        },
        { 
          text: `${userRatingCount?.alreadyRatedCount || 0} / ${userRatingCount?.totalToRateCount || 0}`,
          style: "tableCell" 
        },
        { 
          text: `${userLeadershipCount?.alreadyRatedCount || 0} / ${userLeadershipCount?.totalToRateCount || 0}`,
          style: "tableCell" 
        },
      ];
    });

    const tableHeaders = [
      { text: "User", style: "tableHeader" },
      { text: "Department", style: "tableHeader" },
      { text: "Job Title", style: "tableHeader" },
      { text: "Value Ratings", style: "tableHeader" },
      { text: "Leadership Ratings", style: "tableHeader" },
      { text: "Values Rating Progress", style: "tableHeader" },
      { text: "Leadership Rating Progress", style: "tableHeader" },
    ];

    const table = {
      headerRows: 1,
      widths: ["auto", "auto", "auto", "*", "*", "auto", "auto"],
      body: [tableHeaders, ...tableData],
    };

    const documentDefinition = {
      pageOrientation: 'landscape',
      content: [
        { text: 'User Rating Report', style: 'header' },
        { text: `Generated on ${new Date().toLocaleDateString()}`, style: 'subheader' },
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
        },
        tableCell: {
          fontSize: 10,
          margin: [0, 5, 0, 5],
          alignment: 'center',
          color: '#333',
        }
      }
    };
    
    // pdfMake.createPdf(documentDefinition).download(fileName);
  };

  return (
    <button onClick={createPDF}>Download PDF</button>
  );
};

export default PdfGenerator;
 