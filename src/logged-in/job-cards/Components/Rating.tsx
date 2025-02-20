import React from "react";
import "./Rating.css";

const RatingSquare = ({ rating }) => {
  // Define colors based on rating
  const colors = {
    1: "#dc3545", /* Red color */
    2: "#ffa500", // Orange color
    3: "#4bb543", // Green color
    4: "#2f80ed", // Blue color
    5: "#9b59b6", // Purple color
  };


  // Get the appropriate color for the rating
  const squareColor = colors[Math.floor(rating)] || "#aaa";

  return (
    <div className="rating-square" style={{ backgroundColor: squareColor }}>
      {rating}
    </div>
  );
};

export default RatingSquare;
