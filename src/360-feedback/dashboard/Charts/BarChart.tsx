import React, { useEffect, useRef, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useAppContext } from "../../../shared/functions/Context";
import { ILeadershipRating } from "../../../shared/models/three-sixty-feedback-models/LeadershipRating";
import { IValueRating } from "../../../shared/models/three-sixty-feedback-models/ValueRating";

const BarChart = () => {
  const { api, store } = useAppContext();
  const me = store.auth.meJson;
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [valueRatings, setValueRatings] = useState<IValueRating[]>([]);
  const [leadershipRatings, setLeadershipRatings] = useState<
    ILeadershipRating[]
  >([]);
  const [description, setDescription] = useState("");
  const [chartSeries, setChartSeries] = useState<number[]>([]);

  // Fetch data and update chart series only once after initial render
  useEffect(() => {
    const fetchData = async () => {
      try {
        await api.ratingAssignments.getAll();
        const descriptions = store.ratingAssignments.all.find(
          (rating) => rating.asJson.isActive === true
        )?.asJson.description;
        setDescription(descriptions ?? "");

        const valueRatingsData = await api.valueRating.getAll(
          me?.uid ?? "",
          descriptions ?? ""
        );
        const leadershipRatingsData = await api.leadershipRating.getAll(
          me?.uid ?? "",
          descriptions ?? ""
        );

        setValueRatings(
          Array.isArray(valueRatingsData) ? valueRatingsData : []
        );
        setLeadershipRatings(
          Array.isArray(leadershipRatingsData) ? leadershipRatingsData : []
        );
        setChartSeries([valueRatingsData.length, leadershipRatingsData.length]);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [api.ratingAssignments, api.valueRating, api.leadershipRating, me?.uid]);

  const chartOptions: ApexOptions = {
    chart: {
      type: "bar",
      height: 350,
      // Set a background color for the chart area
      background: "#000000", // Adjust the hex code for your desired shade
    },
    plotOptions: {
      bar: {
        horizontal: true,
        dataLabels: {
          position: "top",
        },
      },
    },
    dataLabels: {
      enabled: true,
      offsetX: -6,
      style: {
        fontSize: "12px",
        colors: ["#333"],
      },
    },
    stroke: {
      show: true,
      width: 1,
      colors: ["#fff"],
    },
    xaxis: {
      categories: ["Value", "Leadership"],
    },
  };

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <ReactApexChart
            options={chartOptions}
            series={[{ data: chartSeries }]}
            type="bar"
            height={350}
          />{" "}
        </>
      )}
    </div>
  );
};

export default BarChart;
