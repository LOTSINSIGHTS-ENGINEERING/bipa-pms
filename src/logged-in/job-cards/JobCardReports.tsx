import { FC, useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { CircularProgressbar } from "react-circular-progressbar";
import "gantt-task-react/dist/index.css";
// import "../styles/statistics.style.scss";
import "../../logged-in/project-management/styles/statistics.style.scss";
import { useAppContext } from "../../shared/functions/Context";
import Loading from "../../shared/components/loading/Loading";
import {  projectRiskStatistics } from "../project-management/utils/common";

import { IProject } from "../../shared/models/ProjectManagement";
import { BarChart } from "./charts/BarChart";

const JobCardReports: FC = observer(() => {
  const { api, store } = useAppContext();
  const me = store.auth.meJson;

  const firstRenderRef = useRef(true);
  const [count, setCount] = useState(5);
  const [projectId, setProjectId] = useState("");
  const [loading, setLoading] = useState(false);

 



const jobcardData = store.jobcard.jobcard.all.map((r)=>r.asJson);

  const totalJobcards = store.jobcard.jobcard.all.length;

  const allocatedJobCards = store.jobcard.jobcard.all
    .map((job) => job.asJson)
    .filter((job) => job.isAllocated);
  //stats
  //filter using
  const pendingJobcards = store.jobcard.jobcard.all.filter((job) => {
    return job.asJson.status === "Not Started";
  });
  const totalPendingJobCards = pendingJobcards.length
  const totalAllocatedJobcards = allocatedJobCards.length;

  const completedJobcards = store.jobcard.jobcard.all.filter((job) => {
    return job.asJson.status === "Completed";
  });
  const totalCompletedJobcards = completedJobcards.length;

  const onChangeProject = (projectId: string) => {
    setProjectId(projectId);
  };


  useEffect(() => {
  
  }, []);
  //new code
  // Calculate the percentage value
  const value = totalCompletedJobcards / totalJobcards;
  
  const percentage = Math.round(value* 100)
 
  useEffect(() => {
    setLoading(true);
    const loaData = async () => {
      if (!me) return;
      await api.projectManagement.getUserProjects(me.uid);
      await api.projectManagement.getTasks(projectId);
      await api.projectManagement.getRisks(projectId);
    };
    loaData();
    setLoading(false);
  }, [api.projectManagement, projectId, me]);

  if (loading) return <Loading />;

  return (
    <>
      {" "}
      <div className="individual-project-statistics">
        <div className="uk-width-1-1@s" style={{ marginLeft: "40px" }}>
          <div className="uk-grid uk-child-width-1-2">
            <div className="uk-card uk-card-default uk-card-body uk-width-1-2@s">
              <h4 className="uk-text-center uk-font-bold">
                Job Card Section and Costs
              </h4>
              <BarChart jobCard={jobcardData} />
            </div>
            <div className="uk-card uk-card-default uk-card-body uk-width-1-2@s uk-flex uk-flex-center">
              {/* Second column content */}

              <div>
                <h3>Percentage completion</h3>
                <div className="item-content">
                  <div className="risk">
                    <section className="r-top">
                      <div
                        className="inner"
                        style={{ width: "150px", height: "150px" }}>
                        {" "}
                        {/* Adjust the width and height as needed */}
                        {/* Use the CircularProgressbar component */}
                        <CircularProgressbar
                          value={percentage}
                          maxValue={1}
                          text={`${percentage} % Resolved`} // Display the original value as percentage
                          styles={{
                            text: { fontSize: ".6rem" },
                          }}
                        />
                      </div>
                    </section>
                    <section className="r-bottom">
                      <section>
                        <span style={{ fontSize: "1.2rem" }}>
                          <b>Status</b>
                        </span>

                        <ul className="uk-list">
                          <li style={{ color: "#dc3545" }}>
                            Not Started: <b>{totalPendingJobCards}</b>
                          </li>
                          <li style={{ color: "#faa05a" }}>
                            In progress: <b>{totalAllocatedJobcards}</b>
                          </li>
                          <li style={{ color: "#4bb543" }}>
                            Resolved: <b>{totalCompletedJobcards}</b>
                          </li>
                        </ul>
                      </section>
                    </section>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="uk-width-1-1@s" style={{ marginLeft: "40px" }}>
          <div className="uk-grid uk-child-width-1-2">
            <div className="uk-card uk-card-default uk-card-body uk-width-1-2@s">
              <div className="people-tab-content uk-card uk-card-default uk-card-body uk-card-small">
                <div className="header uk-margin">
                  <h4 className="title kit-title">
                    Employees &#38; with the most Completed Job Cards{" "}
                  </h4>

                  <select
                    id="count"
                    className="uk-select uk-form-small uk-margin-left"
                    name="count"
                    value={count}
                    onChange={(e) => setCount(parseInt(e.target.value))}>
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={"All"}>All</option>
                  </select>
                </div>
{/* 
                <table className="kit-table uk-table uk-table-small uk-table-striped">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Employee</th>
                      <th>email</th>
                      <th>Number of Job cards</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobcardData.map((user, index) => (
                      <tr key={user.id}>
                        <td>{index + 1}</td>
                        <td>{user.clientFullName}</td>
                        <td>{user.clientEmail}</td>
                        <td>{user.clientMobileNumber}</td>
                      </tr>
                    ))}
                  </tbody>
                </table> */}
              </div>
            </div>
            <div className="uk-card uk-card-default uk-card-body uk-width-1-2@s uk-flex uk-flex-center">
              {/* Second column content */}

              <div>
                <h3> NOT DEVELOPED YET</h3>
                <div className="item-content">
                  <div className="risk">
                    <section className="r-bottom"></section>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

export default JobCardReports;