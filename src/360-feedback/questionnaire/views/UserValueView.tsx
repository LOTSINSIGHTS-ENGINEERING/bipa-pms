import { observer } from "mobx-react-lite";

import { useEffect, useState } from "react";
import UserQuestionnaireBox from "../components/QuestionnaireBox";
import {
  Card,
  CardContent,
  Grid,
  MenuItem,
  Select,
  Typography,
  SelectChangeEvent,
  Tooltip,
  Button,
} from "@mui/material";

import "./UserLeadershipView.scss";
import { useAppContext } from "../../../shared/functions/Context";
import { IUser, defaultUser } from "../../../shared/models/User";

export let initials = "";

const UserValuesView = observer(() => {
  const { api, store } = useAppContext();
  const me = store.auth.meJson;
  const [ratees, setRatees] = useState<IUser>({ ...defaultUser });
  const [isDetailsShown, setIsDetailsShown] = useState(false);
  const [disableAfterSubmission, setDisableAfterSubmission] = useState(false);
  useEffect(() => {
    const load = async () => {
      await Promise.all([
        api.value.getAll(),
        api.ratingAssignments.getAll(),
        api.department.getAll(),
        api.user.getAll()
      ]);
    };

    load();
  }, [api]);

  const values = store.value.all.map((value) => value.asJson);
  const users = store.user.all.map((user) => user.asJson);
  const departments = store.department.all.map((department) => department.asJson);
  const activeRatingAssignment = store.ratingAssignments.all.find((r) => r.asJson.isActive);
  const rateAssignments = activeRatingAssignment ? activeRatingAssignment.asJson.ratedUsersPerAssignmentValues : {};

  const matches = store.ratingAssignments.all
    .filter((assignment) => assignment.asJson.isActive)
    .map((assignment) => assignment.asJson.feedbackAssignments[me?.uid ?? ""])
    .flat();

  const matchingUsers = users
    .filter((user) => matches.includes(user.uid))
    .map((user) => ({ value: user.uid, label: `${user.displayName} ${user.lastName}` }));

  const alreadyRatedUserIds = rateAssignments[me?.uid ?? ""] || [];
  const actualUsers = matchingUsers.filter((user) => !alreadyRatedUserIds.includes(user.value));

  const name = ratees.displayName || " ";
  initials = name
    .split(" ")
    .map((namePart) => namePart[0])
    .join("");

  const getDepartmentName = (departmentId: string): string => {
    const department = departments.find((dep) => dep.id === departmentId);
    return department ? department.name : "Unknown Department";
  };

  const handleRaterChange = (e: SelectChangeEvent<string>) => {
    const selectedUser = users.find((user) => user.uid === e.target.value);
    if (selectedUser) setRatees(selectedUser);
  };

  const toggleDetails = () => {
    setIsDetailsShown((prev) => !prev);
  };

  return (
    <div className="value-page">
      <Card className="user-block" variant="outlined">
        <CardContent>
          <Typography variant="h5" gutterBottom className="user-greeting">
            Hi <Typography variant="h5" component="span" className="user-name"> {me?.displayName} </Typography>, 
            You are about to provide a rating for Values. Please select a user{" "}
            <span className="select-container">
              <Select
                onChange={handleRaterChange}
                value={ratees.uid || ""}
                displayEmpty
                required
                variant="outlined"
                sx={{ minWidth: 200, height: 40 }}
              >
                <MenuItem value="">Select User</MenuItem>
                {actualUsers.map((user, index) => (
                  <MenuItem key={index} value={user.value}>
                    {user.label}
                  </MenuItem>
                ))}
              </Select>
            </span>
          </Typography>

          {ratees.uid && (
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <div className="avatar-circle">
                  <Typography variant="h4" className="avatar-initials">
                    {initials}
                  </Typography>
                </div>
              </Grid>
              <Grid item>
                <div className="user-information">
                  <Typography variant="body1" className="label">You are rating</Typography>
                  <Typography variant="h6" className="value">{ratees.displayName}</Typography>
                  <Typography variant="body1" className="label">Department</Typography>
                  <Typography variant="h6" className="value">{getDepartmentName(ratees.department)}</Typography>
                  <Typography variant="body1" className="label">Position</Typography>
                  <Typography variant="h6" className="value">{ratees.jobTitle}</Typography>
                </div>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>

      <div className="user-lists">
        <Card className="user-list-card" variant="outlined">
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <div className="list-title-container">
                <Typography variant="h6" className="list-title">Users already rated</Typography>
                <Button onClick={toggleDetails} style={{ padding: 0 }}>
                  {isDetailsShown ? (
                    <svg fill="none" viewBox="0 0 24 24" height="1.5em" width="1.5em">
                      <path fill="currentColor" d="M12 16l-4-4h8l-4 4z" />
                    </svg>
                  ) : (
                    <svg fill="none" viewBox="0 0 24 24" height="1.5em" width="1.5em">
                      <path fill="currentColor" d="M12 8l4 4H8l4-4z" />
                    </svg>
                  )}
                </Button>
              </div>
              {isDetailsShown && (
                <ul>
                  {alreadyRatedUserIds.map((userId) => (
                    <li key={userId}>
                      {users.find((user) => user.uid === userId)?.displayName || "Unknown User"}
                    </li>
                  ))}
                </ul>
              )}
            </Grid>
          </Grid>
        </Card>
      </div>

      <UserQuestionnaireBox
        value={values}
        ratee={ratees.uid}
        description={activeRatingAssignment?.asJson.description || ""}
        disableAfterSubmission={disableAfterSubmission}
        setRatees={setRatees}
      />
    </div>
  );
});

export default UserValuesView;
