import { useEffect } from "react";
import { ILeadershipRating } from "../../../shared/models/three-sixty-feedback-models/LeadershipRating";
import { useAppContext } from "../../../shared/functions/Context";


const GeneratePrintablePage = (data: ILeadershipRating[]) => {
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
  
    // Function to create the printable page
    const createPrintablePage = () => {
      // Define the table data
      const tableRows = data.map((rating, index) => {
        const criteria = rating.criteria && Object.keys(rating.criteria).length > 0 ? rating.criteria[Object.keys(rating.criteria)[0]] : null;
        return `
          <tr>
            <td>${index + 1}</td>
            <td>${new Date(rating.date).toLocaleDateString()}</td>
            <td>${getUserName(Object.keys(rating.criteria)[0])}</td>
            <td>${rating.dimension}</td>
            <td>${criteria ? criteria.startDoing : ""}</td>
            <td>${criteria ? criteria.stopDoing : ""}</td>
            <td>${criteria ? criteria.continueDoing : ""}</td>
            <td>${criteria ? criteria.additionalComment : ""}</td>
          </tr>
        `;
      }).join('');
  
      // Define the printable page content
      const printableContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Printable Page</title>
          <style>
            body { font-family: Arial, sans-serif; }
            h1 { text-align: center; color: #31708f; }
            table { border-collapse: collapse; width: 100%; margin-top: 20px; }
            th, td { border: 1px solid #dddddd; text-align: left; padding: 8px; }
            th { background-color: #daf7fc; color: #333; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            tr:nth-child(odd) { background-color: #fff; }
            tr:hover { background-color: #f1f1f1; }
            th, td { text-align: center; }
            td:nth-child(3) { background-color: #f8e6e0; }
          </style>
        </head>
        <body>
          <h1>360 Ratings Report for Midterm 2024</h1>
          <table>
            <thead>
              <tr>
                <th>No.</th>
                <th>Date</th>
                <th>Rater</th>
                <th>Dimension</th>
                <th>Start</th>
                <th>Stop</th>
                <th>Continue</th>
                <th>Comments</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </body>
        </html>
      `;
  
      // Open a new window with the printable page content
      const newWindow = window.open();
      newWindow?.document.write(printableContent);
      newWindow?.document.close();
  
      // Focus on the new window
      newWindow?.focus();
  
      // Print the page
      newWindow?.print();
    };
  
    // Return the function to generate the printable page
    return createPrintablePage;
};
  
// Export the function for use in other components
export default GeneratePrintablePage;
