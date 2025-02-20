import React from "react";
import PropTypes from "prop-types";

const InfoCard = ({ value, label, icon, tooltip }) => {
  return (
    <div className="info-card info-card--primary uk-card uk-card-default uk-card-small">
      <div className="icon" data-tooltip={tooltip}>
        <span>{icon}</span>
      </div>

      <div className="info-body uk-card-body">
        <p className="value">{value}</p>
        <p className="label">{label}</p>
      </div>
    </div>
  );
};

InfoCard.propTypes = {
  value: PropTypes.number.isRequired,
  label: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
  tooltip: PropTypes.string.isRequired,
};

export default InfoCard;
