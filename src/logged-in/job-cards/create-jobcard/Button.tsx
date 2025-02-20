import React from "react";
import "./Button.scss"; // Assuming you have a separate CSS file for styling

const BlueButton = ({ onClick, children }) => {
  return (
    <button className="blue-button" onClick={onClick}>
      {children}
    </button>
  );
};

export default BlueButton;
