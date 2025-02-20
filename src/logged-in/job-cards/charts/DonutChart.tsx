import React from "react";
import { Doughnut } from "react-chartjs-2";





const DonutChart = ({ chartData }) => {
  return <Doughnut data={chartData} />;
};

export default DonutChart;