import UserPerformanceData from "../../models/Report";
import { marginTopBottom, header, sectionHeader } from "./DocDefition";

const brandLogo = async () => {
  return {
    style: "brandLogo",
    image: await getBase64ImageFromURL(`${process.env.PUBLIC_URL}/logo512.png`),
    fit: [76, 76],
  };
};

const charts = async (url: HTMLAnchorElement) => {
  return {
    style: "charts",
    image: await getBase64ImageFromURL(`${url}`),
    // fit: [76, 76],
  };
};

const getBase64ImageFromURL = (url: string) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.setAttribute("crossOrigin", "anonymous");

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);

      const dataURL = canvas.toDataURL("image/png");

      resolve(dataURL);
    };

    img.onerror = (error) => {
      reject(error);
    };

    img.src = url;
  });
};

type RowSpan = {
  text: string | any;
  rowSpan?: number;
  style?: string;
};

type Row = [
  string | RowSpan,
  string | RowSpan,
  string | number | RowSpan,
  string | number | RowSpan,
  string | number | RowSpan,
  string | number | RowSpan
];

const tableWidths: Row = ["auto", "auto", 100, 100, 100, 100];

const tableHeader: Row = [
  "Employee Name",
  "Department",
  "Midterm E-Rating",
  "Midterm S-Rating",
  "Final E-Rating",
  "Final S-Rating",
];

export interface IReportTableRowItem {
  userName: string;
  department: string;
  midtermAutoRating: number;
  midtermRating: number;
  autoRating: number;
  finalRating: number;
  rating:number;
  supervisorMidtermRating:number;
  supervisorFinalAssesmentRating:number;
  employeeFinalAssesmentRating:number
}

const q2DocumentDefinition = (data: UserPerformanceData[]) => {

  console.log("here is my user  data", data);
  
  const tableRows: IReportTableRowItem[] = data.map((d) => {
    const row: IReportTableRowItem = {
      userName: d.asJson.userName,
      department: d.asJson.departmentName,
      midtermAutoRating: d.asJson.midtermRating,
      supervisorMidtermRating:d.asJson.supervisorMidtermRating,
      supervisorFinalAssesmentRating:d.asJson.supervisorFinalAssesmentRating,
      employeeFinalAssesmentRating:d.asJson.employeeFinalAssesmentRating,
      midtermRating: d.asJson.midtermRating,
      autoRating: d.asJson.autoRating,
      finalRating: d.asJson.finalRating,
      rating: d.asJson.rating,
    };
    return row;
  });
  return tableRows;
};

export const ReportPDF = async (
  vision: string,
  mission: string,
  chartsimage: HTMLAnchorElement,
  best: UserPerformanceData[],
  worst: UserPerformanceData[]
) => {
  const logo = await brandLogo();
  const _charts = await charts(chartsimage);
 
  const bestrows: IReportTableRowItem[] = q2DocumentDefinition(best);
  const worstrows: IReportTableRowItem[] = q2DocumentDefinition(worst);

  const bestMappedRows: Row[] = bestrows.map((row) => {
    return [
      row.userName,
      row.department,
      { text: row.rating, fillColor: "#fcecec" },
      { text: row.supervisorMidtermRating, fillColor: "#fcecec" },
      { text: row.employeeFinalAssesmentRating, fillColor: "#caf1de" },
      { text: row.supervisorFinalAssesmentRating, fillColor: "#caf1de" },
    ];
  });
  const worstmappedRows: Row[] = worstrows.map((row) => {
    return [
      row.userName,
      row.department,
      { text: row.rating, fillColor: "#fcecec" },
      { text: row.supervisorMidtermRating, fillColor: "#fcecec" },
      { text: row.employeeFinalAssesmentRating, fillColor: "#caf1de" },
      { text: row.supervisorFinalAssesmentRating, fillColor: "#caf1de" },
    ];
  });

  const bestBody = [tableHeader, ...bestMappedRows];
  const worstBody = [tableHeader, ...worstmappedRows];

  return {
    pageSize: "A2",
    pageOrientation: "landscape",
    content: [
      logo,
      marginTopBottom(),
      header("Company Performance Report"),
      marginTopBottom(),
      sectionHeader("Mission:"),
      sectionHeader(mission),
      marginTopBottom(),
      sectionHeader("Vision:"),
      sectionHeader(vision),
      marginTopBottom(),
      sectionHeader(
        "NOTE: This data is categorized according to the final supervisor rating."
      ),
      marginTopBottom(),
      header("Charts and analytics"),
      marginTopBottom(),
      _charts,
      marginTopBottom(),
      header("Best Performers"),
      marginTopBottom(),
      {
        layout: "lightHorizontalLines", // optional
        table: {
          headerRows: 1,
          widths: tableWidths,
          body: bestBody,
        },
      },
      marginTopBottom(),
      marginTopBottom(),
      // header("Worst Performers"),
      {
        layout: "lightHorizontalLines", // optional
        table: {
          headerRows: 1,
          widths: tableWidths,
          body: worstBody,
        },
      },
      marginTopBottom(),
      marginTopBottom(),
    ],
  };
};

