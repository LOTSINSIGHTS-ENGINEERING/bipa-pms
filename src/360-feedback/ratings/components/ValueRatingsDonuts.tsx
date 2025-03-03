import React, { useEffect, useState, useMemo } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { LoadingEllipsis } from "../../../shared/components/loading/Loading";
import { useAppContext } from "../../../shared/functions/Context";
import { defaultValueRatingScores } from "../../../shared/models/three-sixty-feedback-models/LeadershipRatingScores";
import { IValueRatingScores } from "../../../shared/models/three-sixty-feedback-models/ValueRatingScores";


ChartJS.register(ArcElement, Tooltip, Legend);
ChartJS.defaults.font.family = "'Lexend', sans-serif";

interface EntryScores {
  [valueName: string]: {
    [statement: string]: number;
  };
}

export const ValueRatingsDoughnut = () => {
  const { api, store } = useAppContext();

  const me = store.auth.meJson

  const [totalValueScore, setTotalValueScore] = useState<IValueRatingScores>({
    ...defaultValueRatingScores,
  });

  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState<Boolean>(true);
  // const valueRatings = useMemo(() => {
  //   return store.valueRating.all.map((rating) => rating.asJson.values);
  // }, [store.valueRating.all]);
  const filteredValueRatings = useMemo(() => {
    const specificId = me?.uid; // Replace with the actual id value you want to filter by
    
    return store.valueRating.all.filter((rating) => rating.asJson.rateeId === specificId && rating.asJson.adminApproval !== "Approved for Re-rating" && rating.asJson.resubmission!=="To be rated" && rating.asJson.resubmission!=="Closed" ) // Replace `rating.id` with the correct property if filtering by a different field
      .map((rating) => rating.asJson.values);
  }, [store.valueRating.all]);
 

  const scores = useMemo(
    () => getScoresFromValueRatings(filteredValueRatings),
    [filteredValueRatings]
  );
  const totalAverageScores = useMemo(
    () => calculateTotalAverageScores(scores),
    [scores]
  );

  const valueScore = useMemo(
    () => calculateTotalValueScore(totalAverageScores),
    [totalAverageScores]
  );

  useEffect(() => {
    const load = async () => {
      try {
        await api.ratingAssignments.getAll();
        const descriptions = store.ratingAssignments.all.find(
          (rating) => rating.asJson.isActive === true
        )?.asJson.description;
        setDescription(descriptions ?? "");
        if (me?.uid) {
          await api.valueRating.getAll(me.uid, descriptions ?? "");
        }
      } catch (error) {
        console.error("Error occurred:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [api.valueRating, api.ratingAssignments, me, store.ratingAssignments.all]);

  const colors: { [key: string]: string } = {
    Integrity: "#838CA7",
    Professionalism: "#3CB2C9",
    Sustainability: "#99E7FF",
    Innovation: "#186886",
    Transparency: "#093545",
  };

  const dummyData = [
    { label: "No Ratings", value: 0.000001, color: "#ccc" },
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
    id: "textCenter",
    beforeDraw(chart: { ctx: any; chartArea: any }) {
      const { ctx, chartArea } = chart;
      const centerX = (chartArea.left + chartArea.right) / 2;
      const centerY = (chartArea.top + chartArea.bottom) / 2;
      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "bold 30px Arial";
      ctx.fillStyle = "blue";
      const text = isNaN(parseFloat(valueScore)) || parseFloat(valueScore) <= 0 ? "0.00" : valueScore;
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
          id="value-donut"
          data={finalData}
          options={options}
          plugins={[textCenter]}
        />
      )}
    </div>
  );


  function getScoresFromValueRatings(valueRatings: any[]) {
    const scores: EntryScores[] = [];

    valueRatings.forEach((entry) => {
      Object.keys(entry).forEach((raterId) => {
        const ratings = entry[raterId].ratings;
        const valueNames = Object.keys(ratings);

        const entryScores: EntryScores = {};

        valueNames.forEach((valueName) => {
          entryScores[valueName] = ratings[valueName];
        });

        scores.push(entryScores);
      });
    });

    return scores;
  }

  function calculateTotalAverageScores(arrays: EntryScores[]) {
    const totals: { [valueName: string]: number } = {};
    const maxScores: { [valueName: string]: number } = {};

    arrays.forEach((array) => {
      Object.keys(array).forEach((valueName) => {
        if (!totals[valueName]) {
          totals[valueName] = 0;
        }
        const totalScore = Object.values(array[valueName]).reduce(
          (acc, cur) => acc + cur,
          0
        );
        totals[valueName] += totalScore;

        if (!maxScores[valueName]) {
          maxScores[valueName] = Object.values(array[valueName]).length * 5;
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

  function calculateTotalValueScore(totalAverageScores: {
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