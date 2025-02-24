import React, { useEffect, useRef, useState } from "react";
import { Bar, PolarArea } from "react-chartjs-2";
import Chart from "chart.js/auto";

import { updateTotalRate } from "../../ratings/functions";
import { LoadingEllipsis } from "../../../shared/components/loading/Loading";
import { useAppContext } from "../../../shared/functions/Context";
import { ILeadershipRating } from "../../../shared/models/three-sixty-feedback-models/LeadershipRating";
import { IValueRating } from "../../../shared/models/three-sixty-feedback-models/ValueRating";

Chart.defaults.font.family = "'Lexend', sans-serif";
export const CombinedPolars = () => {
  const { api, store } = useAppContext();
  const me = store.auth.meJson;
  const chartRef = useRef<any>(null);
  type IRatings =  IValueRating | ILeadershipRating;
  const doughnutId = "combined-polars";
  const [loading, setLoading] = useState(true);
  const [description, setDescription] = useState("");
  function getTotalScores(ratingsArray: any[]) {
    const totalScores: { [key: string]: number } = {};
    ratingsArray.forEach((rating) => {
      const raterRatings = rating.values || rating.criteria;
      Object.values(raterRatings).forEach((raterRating: any) => {
        const criteriaRatings = raterRating.ratings || raterRating.criteria;
        Object.entries(criteriaRatings).forEach(([criteriaName, statements]: any) => {
          Object.entries(statements).forEach(([statement, score]: any) => {
            totalScores[criteriaName] = (totalScores[criteriaName] || 0) + score;
          });
        });
      });
    });
    return totalScores;
  }

  function sumTotalScores(totalScores: { [key: string]: number }) {
    let total = 0;
    for (const key in totalScores) {
      total += totalScores[key];
    }
    return total / 3;
  }

  function calculateAverageScores(totalScores: { [key: string]: number }) {
    const averageScores: { [key: string]: number } = {};
    for (const key in totalScores) {
      averageScores[key] = totalScores[key] / Object.keys(totalScores).length;
    }
    return averageScores;
  }

  const [totalScore, setTotalScore] = useState(0);
  const [averageValueScores, setAverageValueScores] = useState<{ [key: string]: number }>({});
  const [averageLeadershipScores, setAverageLeadershipScores] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    let currentChartInstance: Chart<"bar"> | null = null;
    if (chartRef.current) {
      currentChartInstance = new Chart(chartRef.current, {
        type: "bar",
        data: {
          labels: ["Value", "Leadership"],
          datasets: [
            {
              label: "Category",
              data: [0, 0, 0, 0, 0, 0],
              backgroundColor: [
                "#838CA7",
                "#3CB2C9",
                "#99E7FF",
                "#186886",
                "#2EBDA6",
              ],
              borderColor: [
                "#838CA7",
                "#3CB2C9",
                "#99E7FF",
                "#186886",
                "#2EBDA6",
              ],
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              suggestedMax: 5,
              ticks: {
                stepSize: 1,
              },
            },
          },
          plugins: {
            legend: {
              display: false,
            },
          },
        },
      });
    }

    const fetchData = async () => {
      try {
        await Promise.all([
          api.ratingAssignments.getAll()
        ]);
        const descriptions = store.ratingAssignments.all.find((rating) =>
          rating.asJson.isActive === true
        )?.asJson.description;
        setDescription(descriptions ?? "");
        await Promise.all([
          api.valueRating.getAll(me?.uid ?? "", descriptions ?? ""),
          api.leadershipRating.getAll(me?.uid ?? "", descriptions ?? ""),
        ]);

        const valueRatings = store.valueRating.all.map((rating) => rating.asJson);
        const leadershipRating = store.leadershipRating.all.map((rating) => rating.asJson);
        
        const allRatings: IRatings[] = [
          ...valueRatings,
          ...leadershipRating
        ];

        const totalValueScores = getTotalScores(valueRatings);
        const totalLeadershipScores = getTotalScores(leadershipRating);
        const averageValue = calculateAverageScores(totalValueScores);
        const averageLeadership = calculateAverageScores(totalLeadershipScores);
    
        setAverageValueScores(averageValue);
        setAverageLeadershipScores(averageLeadership);
    
        setTotalScore(() => {
          const totalScores =
            sumTotalScores(averageValue) +
            sumTotalScores(averageLeadership) 
          updateTotalRate(totalScores);
          console.log("Total Scores "+totalScores);
          return totalScores;
        });
        setLoading(false);
      } catch (error) {
        console.error("Error occurred:", error);
        setLoading(false);
      }
    };
    fetchData();

    return () => {
      if (currentChartInstance) {
        currentChartInstance.destroy();
      }
    };
  }, [
    api.valueRating,
    api.leadershipRating,
    me?.uid,
  ]);

  return (
    <div style={{ width: "600px", height: "300px", marginTop: "1rem",padding:"1rem" }}>
      {!loading ? (
        <Bar
          data={{
            labels: ["Value", "Leadership"],
            datasets: [
              {
                label: "Category",
                data: [
                  sumTotalScores(averageValueScores),
                  sumTotalScores(averageLeadershipScores),
                  0, // Placeholder for "Other" category
                ],
                backgroundColor: [
                  "#838CA7",
                  "#3CB2C9",
                  "#99E7FF",
                  "#186886",
                  "#2EBDA6",
                ],
                borderColor: [
                  "#838CA7",
                  "#3CB2C9",
                  "#99E7FF",
                  "#186886",
                  "#2EBDA6",
                ],
                borderWidth: 1,
              },
            ],
          }}
          options={{
            scales: {
              y: {
                beginAtZero: true,
                suggestedMax: 5,
                ticks: {
                  stepSize: 1,
                },
              },
            },
            plugins: {
              legend: {
                display: false,
              },
            },
            
          }}
          ref={chartRef}
        />
      ) : (
        <LoadingEllipsis />
      )}
    </div>
  );
};