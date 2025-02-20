import React from "react";
import "./DashboardCard.scss";

interface DashboardCardProps {
  variant: "primary" | "success" | "warning" | "danger";
  icon: string;
  label: string;
  value: number | string;
  tooltip: string;
}

// const DashboardCard: React.FC<DashboardCardProps> = ({
//   variant,
//   icon,
//   label,
//   value,
//   tooltip,
// }) => {
//   return (
//     <div
//       className={`dashboard-card dashboard-card--${variant} uk-card uk-card-default`}
//     >
//       <div className="icon" data-tooltip={tooltip}>
//         <span>{icon}</span>
//       </div>
//       <div className="info-body uk-card-body">
//         <p className="value">{value}</p>
//         <p className="label">{label}</p>
//         {/* Strip inside info-body */}
//         <div className="info-strip"></div>
//       </div>
//     </div>
//   );
// };
const DashboardCard: React.FC<DashboardCardProps> = ({
  variant,
  icon,
  label,
  value,
  tooltip,
}) => {
  let cardColor;

  switch (variant) {
    case "primary":
      cardColor = "#4976ba";
      break;
    case "success":
      cardColor = "#138636";
      break;
    case "warning":
      cardColor = "#ffbc12";
      break;
    case "danger":
      cardColor = "#c91432";
      break;
    default:
      cardColor = "#4976ba"; // default primary color
  }

  return (

    
    <div
      className="dashboard-card uk-card uk-card-default"
      style={{ borderColor: cardColor }}
    >
      <div className="icon" data-tooltip={tooltip}>
        <span>{icon}</span>
      </div>
      <div className="info-body uk-card-body">
        <p className="value" style={{ color: cardColor }}>
          {value}
        </p>
        <p className="label">{label}</p>
        {/* Strip at the bottom */}
        <div className="info-strip" style={{ backgroundColor: cardColor }}></div>
      </div>
    </div>
  );
};



export default DashboardCard;
