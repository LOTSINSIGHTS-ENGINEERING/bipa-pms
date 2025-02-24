import React, { useEffect, useState } from "react";

import RequestCard from "./RequestCard";
import "./UserRequests.scss";
import { LoadingEllipsis } from "../../shared/components/loading/Loading";
import { useAppContext } from "../../shared/functions/Context";
import { RatingStatus } from "../../shared/models/three-sixty-feedback-models/CommitteeRating";


const UserRequests = () => {
  const { store, api } = useAppContext();
  const me = store.auth.meJson;
  const assignments = store.templateRating?.all
  .filter(rate => rate.asJson.raterId ===me?.uid , "")
  .map(rate => rate.asJson);
  const [loading,setLoading] = useState(false);
  const toDo = assignments.filter(
    (assignment) =>
      assignment.status === ("Not Started")
  );
  const inProgress = assignments.filter(
    (assignment) =>
      assignment.status === ("In Progress" as RatingStatus)
  );
  const completed = assignments.filter(
    (assignment) => assignment.status === ("Completed")
  );
  console.log("assignments on card view", assignments);
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        await api.templateRating.getAll();
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      setLoading(false)
    };
    fetchData();

  }, [api.templateRating, me?.uid, store.templateRating]);

  return (
    loading ? (
      <LoadingEllipsis />
    ) : (
      <div className="kanban-board">
        <div className="kanban-column">
          <h2>To Do</h2>
          <div>
            {toDo
              .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
              .map((assignment) => (
                <RequestCard key={assignment.id} assignment={assignment} templateId={assignment.templateId} />
              ))}
          </div>
        </div>
        <div className="kanban-column">
          <h2>In Progress</h2>
          <div>
            {inProgress
              .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
              .map((assignment) => (
                <RequestCard key={assignment.id} assignment={assignment} templateId={assignment.templateId} />
              ))}
          </div>
        </div>
        <div className="kanban-column">
          <h2>Completed</h2>
          <div>
            {completed
              .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
              .map((assignment) => (
                <RequestCard key={assignment.id} assignment={assignment} templateId={assignment.templateId} />
              ))}
          </div>
        </div>
      </div>
    )
  );
}
export default UserRequests;
