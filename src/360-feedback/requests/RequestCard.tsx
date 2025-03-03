import React from "react";
import { Card, CardContent, Typography, Button } from "@mui/material";
import { observer } from "mobx-react-lite";

import { Link, useNavigate } from "react-router-dom";
import { dateFormat_YY_MM_DY } from "../../logged-in/shared/utils/utils";
import { useAppContext } from "../../shared/functions/Context";
import { FeedbackStatus } from "../../shared/models/three-sixty-feedback-models/RateAssignments";
import { ITemplateRating } from "../../shared/models/three-sixty-feedback-models/TemplateRating";

interface IProp {
  assignment: ITemplateRating;
  templateId: string;
}

const RequestCard = observer(({ assignment }: IProp) => {
  const navigate = useNavigate();
  const { store } = useAppContext();
  const users = store.user.all.map((user) => user.asJson);
  const departments = store.department.all.map((dep) => dep.asJson);

  const getUserName = (userId: string): string => {
    const user = users.find((user) => user.uid === userId);
    return user?.displayName ?? "";
  };

  const getDepartmentName = (depId: string): string => {
    const department = departments.find((dep) => dep.id === depId);
    return department?.name ?? "";
  };

  const handleClick = (rateeId: string, sessionId: string) => {
    store.templateRating.select(assignment);
    navigate(`/c/questionnaire/competencies/${rateeId}/${sessionId}`);
  };

  // Determine outline color based on status
  let outlineColor = "#ffffff";
  switch (assignment.status) {
    case "In Progress" as FeedbackStatus:
      outlineColor = "#FFD700"; // Yellow
      break;
    case "Completed":
      outlineColor = "#90EE90"; // Green
      break;
    case "Not Started":
      outlineColor = "#FF6961"; // Red
      break;
    default:
      break;
  }

  return (
    <Card
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: "300px",
        padding: 20,
        backgroundColor: "#fdfdfd",
        borderRadius: 12,
        overflow: "hidden",
        position: "relative",
        zIndex: 1,
        transition: "transform 0.3s ease",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
        minWidth: 255,
        margin: "10px",
        height: "100%",
        border: `2px solid ${outlineColor}`,
      }}
    >
      <CardContent
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100%",
        }}
      >
        <div
          style={{
            fontFamily: "Lexend, sans-serif",
            marginBottom: 10,
          }}
        >
          <Typography variant="h5" component="div">
            {getUserName(assignment.rateeId)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Date Requested:</strong>{" "}
            {dateFormat_YY_MM_DY(assignment.dateRequested ?? 0)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Description:</strong> {assignment.heading}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Due Date:</strong>{" "}
            {dateFormat_YY_MM_DY(assignment.dueDate)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Status:</strong> {assignment.status}
          </Typography>
        </div>
        {assignment.status !== "Completed" && (
          <Button
            onClick={() => handleClick(assignment.rateeId, assignment.templateId)}
            variant="contained"
            color="primary"
            style={{ backgroundColor: "#2EBDA6", color: "#fff", marginTop: 10 }}
          >
            Rate
          </Button>
        )}
        {assignment.status === "Completed" && (
          <Button
            onClick={() => handleClick(assignment.rateeId, assignment.templateId)}
            variant="contained"
            color="primary"
            style={{ backgroundColor: "#2EBDA6", color: "#fff", marginTop: 10 }}
          >
            View
          </Button>
        )}
      </CardContent>
    </Card>
  );
});

export default RequestCard;







