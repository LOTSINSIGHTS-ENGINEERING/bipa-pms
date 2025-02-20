import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface JobCardChartProps {
    data: {
        labels: string[];
        values: number[];
    };
    title: string;
}

const JobCardChart: React.FC<JobCardChartProps> = ({ data, title }) => {
    const chartData = {
        labels: data.labels,
        datasets: [
            {
                label: title,
                data: data.values,
                backgroundColor: ['#ADD8E6', '#FFC0CB', '#90EE90', '#D3D3D3', '#B0E0E6'],
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1,
            },
        ],
    };

    return <Bar data={chartData} />;
};

export default JobCardChart;
