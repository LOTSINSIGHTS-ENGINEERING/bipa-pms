import { Bar } from "react-chartjs-2";
import { IJobCard } from "../../../shared/models/job-card-model/Jobcard";
import { useAppContext } from "../../../shared/functions/Context";
import { FC, useEffect } from "react";

interface JobCardProps {
  jobCard: IJobCard[];
}

export const BarChart: FC<JobCardProps> = ({ jobCard }) => {
  const { api, store } = useAppContext();

  useEffect(() => {
    api.department.getAll();
  }, [api.department]);

  const check = store.department.all;
  console.log("check in chart", check);

  const getDepartmentName = (deptId) => {
    const dept = store.department.all.find(
      (user) => user.asJson.businessUnit === deptId
    );
    return dept ? dept.asJson.name : "Unknown";
  };

  if (!store.department.all || store.department.all.length === 0) {
    return <div>Loading...</div>;
  }

  const options = {
    elements: {
      bar: {
        borderWidth: 1,
      },
    },
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Department",
        },
      },
      y: {
        title: {
          display: true,
          text: "Cost in NAD",
        },
        beginAtZero: true,
      },
    },
  };

  const labels = jobCard.map((item) => getDepartmentName(item.division));

  const data1 = {
    labels,
    datasets: [
      {
        label: "Job Card Costs",
        data: jobCard.map((p) => p.jobcardCost),
        backgroundColor: "#84cbe9",
        barPercentage: 0.2,
      },
    ],
  };

  return <Bar options={options} data={data1} />;
};
