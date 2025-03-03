"use client";
import React, { useEffect, useRef, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { LoadingEllipsis } from "../../../shared/components/loading/Loading";
import { useAppContext } from "../../../shared/functions/Context";


export const TemplatesDoughnut = () => {
  const { api, store } = useAppContext();
  const me = store.auth.meJson;
  const doughnutId = "projects-doughnut";
  const chartRef = useRef<any>(null);

  const [loading, setLoading] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [averageTemplateScores, setAverageTemplateScores] = useState<{ [key: string]: number }>({
    "Default Category": 0.5,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([api.templateRating.getAll()]);
      const templateRatings = store.templateRating.all.map((rating) => rating.asJson);
      const myTemplateRatings = templateRatings.filter((ratings) => ratings.rateeId === me?.uid);

      const totalTemplateScores = getTotalScores(myTemplateRatings);
      const averageTemplate = calculateAverageScores(totalTemplateScores);
      setAverageTemplateScores(averageTemplate);
      setTotalScore(sumTotalScores(averageTemplate));
    } catch (error) {
      console.error("Error occurred:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 10000); // 10 seconds timeout

    fetchData();

    return () => clearTimeout(timeoutId);
  }, []);

  function getTotalScores(ratingsArray: any[]) {
    const totalScores: { [key: string]: { [key: string]: number } } = {};
    ratingsArray.forEach((rating) => {
      const raterRatings = rating.values;
      Object.values(raterRatings).forEach((raterRating: any) => {
        const criteriaRatings = raterRating.ratings;
        Object.entries(criteriaRatings).forEach(([criteriaName, statements]: any) => {
          if (!totalScores[criteriaName]) {
            totalScores[criteriaName] = {};
          }
          Object.entries(statements).forEach(([statement, score]: any) => {
            totalScores[criteriaName][statement] = (totalScores[criteriaName][statement] || 0) + score;
          });
        });
      });
    });
    return totalScores;
  }

  function calculateAverageScores(totalScores: { [key: string]: { [key: string]: number } }) {
    const averageScores: { [key: string]: number } = {};
    for (const criteriaName in totalScores) {
      const statementScores = totalScores[criteriaName];
      let totalScore = 0;
      let statementCount = 0;
      for (const statement in statementScores) {
        totalScore += statementScores[statement];
        statementCount++;
      }
      averageScores[criteriaName] = totalScore / (statementCount * 5);
    }
    return averageScores;
  }

  function sumTotalScores(totalScores: { [key: string]: number }) {
    let total = 0;
    for (const key in totalScores) {
      total += totalScores[key];
    }
    return total / 5;
  }

  const colors = ["#99E7FF", "#3CB2C9", "#2EBDA6", "#186886", "#093545"];

  function getColor(index: number) {
    return colors[index % colors.length];
  }

  const data = Object.entries(averageTemplateScores).map(([title, score], index) => ({
    label: title,
    shortLabel: shortenLabel(title),
    value: score,
    color: getColor(index),
    cutout: "70%",
  }));

  if (data.length === 0) {
    data.push({
      label: "No Ratings",
      shortLabel: "No Ratings",
      value: 0.000001,
      color: "#ccc",
      cutout: "70%",
    });
  }

  function shortenLabel(label: string) {
    const words = label.split(" ");
    if (words.length > 1) {
      return `${words[0]} ${words[1]}`;
    }
    return label;
  }

  const textCenter = {
    id: "projects-textCenter",
    beforeDraw(chart: { ctx: any; chartArea: any }) {
      const { ctx, chartArea } = chart;
      const centerX = (chartArea.left + chartArea.right) / 2;
      const centerY = (chartArea.top + chartArea.bottom) / 2;

      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "bold 30px Arial"; // Adjust font properties as needed
      ctx.fillStyle = "blue"; // Adjust color as needed

      const text = isNaN(totalScore) ? "0" : (totalScore / 6).toFixed(2); // Use "-" if totalScore is NaN

      ctx.fillText(text, centerX, centerY);

      ctx.restore();
    },
  };

  const options = {
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          usePointStyle: true,
          generateLabels: (chart: any) => {
            const labels = chart.data.labels.map((label: string, index: number) => ({
              text: data[index]?.shortLabel || label,
              fillStyle: data[index]?.color || getColor(index),
              strokeStyle: data[index]?.color || getColor(index),
              lineWidth: 1,
              hidden: false,
              index: index,
            }));
            return labels;
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const labelIndex = context.dataIndex;
            const dataItem = data[labelIndex];
            return `${dataItem.label}: ${dataItem.value.toFixed(2)}`;
          },
        },
      },
      centerText: textCenter,
      responsive: true,
    },
    cutout: "70%",
  };

  const finalData = {
    labels: data.map((item) => item.label),
    datasets: [
      {
        data: data.map((item) => item.value),
        backgroundColor: data.map((item) => item.color),
        borderColor: data.map((item) => item.color),
        borderWidth: 1,
        dataVisibility: new Array(data.length).fill(true),
      },
    ],
  };

  return (
    <div style={{ width: "260px", height: "260px", marginTop: "1rem" }}>
      {loading ? (
        <LoadingEllipsis />
      ) : (
        <Doughnut id={doughnutId} data={finalData} options={options} plugins={[textCenter]} />
      )}
    </div>
  );
};