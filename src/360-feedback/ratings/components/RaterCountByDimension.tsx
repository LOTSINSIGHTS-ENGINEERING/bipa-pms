import React, { useEffect, useRef, useCallback } from "react";
import Chart from "chart.js/auto";

interface IRaterCountByDimensionProps {
  dimensions: string[];
  raterCounts: { [dimension: string]: number };
}

const RaterCountByDimension: React.FC<IRaterCountByDimensionProps> = ({
  dimensions,
  raterCounts,
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  const updateChart = useCallback(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext("2d");
      if (ctx) {
        if (chartInstance.current) {
          chartInstance.current.data.labels = dimensions;
          chartInstance.current.data.datasets[0].data = dimensions.map(
            (dimension) => raterCounts[dimension] || 0
          );
          chartInstance.current.update();
        } else {
          chartInstance.current = new Chart(ctx, {
            type: "bar",
            data: {
              labels: dimensions,
              datasets: [
                {
                  label: "Number of Raters",
                  data: dimensions.map(
                    (dimension) => raterCounts[dimension] || 0
                  ),
                  backgroundColor: "rgba(75, 192, 192, 0.8)",
                  borderColor: "rgba(75, 192, 192, 1)",
                  borderWidth: 1,
                },
              ],
            },
            options: {
              maintainAspectRatio: true,
              scales: {
                y: {
                  beginAtZero: true,
                  suggestedMax: 20,
                  ticks: {
                    stepSize: 10,
                  },
                },
                x: {
                  grid: {
                    display: false,
                  },
                },
              },
              plugins: {
                legend: {
                  labels: {
                    font: {
                      size: 16,
                    },
                  },
                },
              },
            },
          });
        }
      }
    }
  }, [dimensions, raterCounts]);

  useEffect(() => {
    const animationFrame = requestAnimationFrame(updateChart);
    return () => cancelAnimationFrame(animationFrame);
  }, [updateChart]);

  return (
    <div style={{ width: "400px", height: "300px", marginTop: "1rem",padding:"1rem" }}>
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default RaterCountByDimension;
