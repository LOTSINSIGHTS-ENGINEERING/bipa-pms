import React, { useEffect, useState, useMemo } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

import { LoadingEllipsis } from "../../../shared/components/loading/Loading";
import { useAppContext } from "../../../shared/functions/Context";


ChartJS.register(ArcElement, Tooltip, Legend);
ChartJS.defaults.font.family = "'Lexend', sans-serif";

interface EntryScores {
  [criteria: string]: {
    [statement: string]: number;
  };
}

export const LeadershipRatingsDoughnut = () => {
  const { api, store } = useAppContext();
  // const leadershipRatings = useMemo(
  //   () => store.leadershipRating.all.map((rating) => rating.asJson.criteria),
  //   [store.leadershipRating.all]
  // );
  const me = store.auth.meJson;
  const filteredValueRatings = useMemo(() => {
    const specificId = me?.uid; // Replace with the actual id value you want to filter by
    
    return store.leadershipRating.all
      .filter((rating) =>  rating.asJson.rateeId === specificId && rating.asJson.adminApproval !== "Approved for Re-rating" && rating.asJson.resubmission!=="To be rated" && rating.asJson.resubmission!=="Closed" ) // Replace `rating.id` with the correct property if filtering by a different field
      .map((rating) => rating.asJson.criteria);
  }, [store.valueRating.all]);
 

  const [loading, setLoading] = useState<Boolean>(true);
  const scores = useMemo(
    () => getScoresFromLeadershipRatings(filteredValueRatings),
    [filteredValueRatings]
  );
  const [description, setDescription] = useState("");

  const totalAverageScores = useMemo(
    () => calculateTotalAverageScores(scores),
    [scores]
  );

  const leadershipScore = useMemo(
    () => calculateTotalLeadershipScore(totalAverageScores),
    [totalAverageScores]
  );

  useEffect(() => {
    const load = async () => {
      try {
        await api.ratingAssignments.getAll();
        const descriptions = store.ratingAssignments.all.find((rating) =>
          rating.asJson.isActive === true
        )?.asJson.description;
        setDescription(descriptions ?? "");
        if (me?.uid) {
          await api.leadershipRating.getAll(me.uid, descriptions ?? "");
        }
      } catch (error) {
        console.error("Error occurred:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [api.leadershipRating, api.ratingAssignments, me, store.ratingAssignments.all]);

  const colors: { [key: string]: string } = {
    "Communication": "#99E7FF",
    "Conflict Resolution": "#6776A5",
    "Leadership Competency": "#2EBDA6",
    "Motivating and Relating": "#186886",
    "Relationship Building": "#3CB2C9",
  };

  const dummyData = [
    { label: "No Ratings", value: 0.000001, color: "#ccc" }, // Very small value to ensure rendering
  ];
  

  const data = Object.keys(totalAverageScores).length > 0
    ? Object.keys(totalAverageScores).map((key) => ({
        label: key,
        value: totalAverageScores[key],
        color: colors[key] || "#093545",
      }))
    : dummyData;

  const finalData = {
    labels: data.map((item) => item.label),
    datasets: [
      {
        data: data.map((item) => item.value),
        backgroundColor: data.map((item) => item.color),
        borderColor: data.map((item) => item.color),
        borderWidth: 1,
      },
    ],
  };

  const options: any = {
    plugins: {
      legend: {
        position: "right",
        labels: {
          usePointStyle: true,
        },
        pointStyle: "circle",
        pointRadius: 10,
      },
      tooltip: {
        callbacks: {
          label: function(context: { label?: string; parsed: number }) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            label += context.parsed.toFixed(2); // Ensure it displays 2 decimal places
            return label;
          }
        }
      },
    },
    cutout: "70%",
  };

  const textCenter = {
    id: "leadership-textCenter",
    beforeDraw(chart: { ctx: any; chartArea: any }) {
      const { ctx, chartArea } = chart;
      const centerX = (chartArea.left + chartArea.right) / 2;
      const centerY = (chartArea.top + chartArea.bottom) / 2;

      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "bold 30px Arial";
      ctx.fillStyle = "blue";

      const text = isNaN(parseFloat(leadershipScore)) || parseFloat(leadershipScore) <= 0 ? "0.00" : leadershipScore;
      ctx.fillText(text, centerX, centerY);

      ctx.restore();
    },
  };

  return (
    <div style={{ width: "260px", height: "260px", marginTop: "1rem" }}>
      {loading ? (
        <LoadingEllipsis />
      ) : (
        <Doughnut
          id="leadership-donut"
          data={finalData}
          options={options}
          plugins={[textCenter]}
        />
      )}
    </div>
  );

  function getScoresFromLeadershipRatings(ratings: any[]) {
    const scores: EntryScores[] = [];

    ratings.forEach((entry) => {
      const ratings = entry[Object.keys(entry)[0]].ratings;
      const valueNames = Object.keys(ratings);

      const entryScores: EntryScores = {};

      valueNames.forEach((valueName) => {
        entryScores[valueName] = ratings[valueName];
      });

      scores.push(entryScores);
    });

    return scores;
  }

  function calculateTotalAverageScores(arrays: EntryScores[]) {
    const totals: { [criteria: string]: number } = {};
    const maxScores: { [criteria: string]: number } = {};

    arrays.forEach((array) => {
      Object.keys(array).forEach((criteria) => {
        if (!totals[criteria]) {
          totals[criteria] = 0;
        }
        const totalScore = Object.values(array[criteria]).reduce(
          (acc, cur) => acc + cur,
          0
        );
        totals[criteria] += totalScore;

        if (!maxScores[criteria]) {
          maxScores[criteria] = Object.values(array[criteria]).length * 5;
        }
      });
    });

    const count = arrays.length;
    const totalAverageScores: { [valueName: string]: number } = {};
    Object.keys(totals).forEach((valueName) => {
      const totalScore = totals[valueName];
      const maxScore = maxScores[valueName];
      const average = totalScore / count;
      totalAverageScores[valueName] = Math.round((average / maxScore) * 5);
    });

    return totalAverageScores;
  }

  function calculateTotalLeadershipScore(totalAverageScores: {
    [valueName: string]: number;
  }) {
    let totalScore = 0;
    const numValues = Object.keys(totalAverageScores).length;

    Object.values(totalAverageScores).forEach((score) => {
      totalScore += score;
    });
    let averageTotalScore = totalScore / numValues;

    averageTotalScore = parseFloat(averageTotalScore.toFixed(2));
    const formattedScore = averageTotalScore.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return formattedScore;
  }
};