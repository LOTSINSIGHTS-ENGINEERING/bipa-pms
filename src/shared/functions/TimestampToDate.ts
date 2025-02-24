import { Timestamp } from "firebase/firestore";

export const serverTimestampInMillis = () => {
  const timestampMillis = Timestamp.now().toMillis();
  return timestampMillis;
};

export const timestampToDate = (timestamp: any): string => {
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    time: "numeric",
  };
  return timestamp.toDate().toLocaleDateString("en-US", options);
};

export const timestampToTime = (timestamp: any): string => {
  return timestamp.toDate().toLocaleTimeString("en-US");
};
export const dateFormat_YY_MM_DY_timeStamp = (dateMillis:number) => {
  if (dateMillis === null) return "-";
  const date = new Date(dateMillis);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();
  // append 0 if month or day is less than 10
  const mn = `${month < 10 ? `0${month}` : month}`;
  const dy = `${day < 10 ? `0${day}` : day}`;

  return `${year}-${mn}-${dy}`;
};

export const mapMonthToAbbreviation = (month: number): string => {
  switch (month) {
    case 1:
      return "Jan";
    case 2:
      return "Feb";
    case 3:
      return "Mar";
    case 4:
      return "Apr";
    case 5:
      return "May";
    case 6:
      return "Jun";
    case 7:
      return "Jul";
    case 8:
      return "Aug";
    case 9:
      return "Sep";
    case 10:
      return "Oct";
    case 11:
      return "Nov";
    case 12:
      return "Dec";
    default:
      return "";
  }
};
