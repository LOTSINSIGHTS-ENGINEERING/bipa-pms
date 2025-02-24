import { observer } from "mobx-react-lite";

import { useEffect, useState } from "react";
import UserQuestionnaireBox from "../components/QuestionnaireBox";
import "./UserLeadershipView.scss";

import { Card, CardContent, Grid, MenuItem, Select, Typography, SelectChangeEvent, Tooltip, Button } from "@mui/material";
import { useAppContext } from "../../../shared/functions/Context";
import { IUser, defaultUser } from "../../../shared/models/User";

let initials = '';

const UserLeadershipView = observer(() => {
  const { api, store } = useAppContext();
  const me = store.auth.meJson;
  const criteria = store.leadership.all.map((value) => value.asJson);
  
  const [ratees, setRatees] = useState<IUser>({ ...defaultUser });
  const name = ratees ? ratees.displayName || " " : " ";
  initials = name.split(" ").map((name) => name[0]).join("");

  const users = store.user.all.map((user) => user.asJson);
  const departments = store.department.all.map((department) => department.asJson);
  
  const getDepartmentName = (departmentId: string): string => {
    const department = departments.find((department) => department.id === departmentId);
    return department ? department.name : "";
  };

  const matches = store.ratingAssignments.all
    .filter((match) => match.asJson.isActive)
    .map((match) => match.asJson.feedbackAssignments[me?.uid ?? ""])
    .flat();

  const matchingUsers = users
    .filter((user) => matches.includes(user.uid))
    .map((u) => ({ value: u.uid, label: `${u.displayName} ${u.lastName}` }));

  const activeRatingAssignment = store.ratingAssignments.all.find((r) => r.asJson.isActive === true);
  const rateAssignments = activeRatingAssignment ? activeRatingAssignment.asJson.ratedUsersPerAssignmentLeadership : {};
  const [disableAfterSubmission, setDisableAfterSubmission] = useState(false);
  const alreadyRatedUserIds = rateAssignments[me?.uid ?? ""] || [];
  const actualUsers = matchingUsers.filter((user) => !alreadyRatedUserIds.includes(user.value));

  const handleRaterChange = (e: SelectChangeEvent<string>) => {
    const ratee = users.find((user) => user.uid === e.target.value);
    if (ratee) setRatees(ratee);
  };

  useEffect(() => {
    const load = async () => {
      await api.leadership.getAll();
      await api.value.getAll();
      await api.ratingAssignments.getAll();
      await api.department.getAll();
      await api.user.getAll();
    };
    load();
  }, [api]);

  return (
    <div className="value-page">
      <Card className="user-block" variant="outlined">
        <CardContent>
          <Typography variant="h5" gutterBottom className="user-greeting">
            Hi <Typography variant="h5" component="span" className="user-name"> {me?.displayName} </Typography>
            You are about to provide a rating for Leadership. Please select a user{" "}
            <span className="select-container">
              <Select
                onChange={handleRaterChange}
                value={ratees.uid}
                displayEmpty
                required
                variant="outlined"
                sx={{ minWidth: 200, height: 40 }}
              >
                <MenuItem value="">Select User</MenuItem>
                {actualUsers.map((rater, raterIndex) => (
                  <MenuItem key={raterIndex} value={rater.value ?? ""}>
                    {rater.label ?? ""}
                  </MenuItem>
                ))}
              </Select>
            </span>
          </Typography>
          {ratees.uid !== "" && (
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <div className="avatar-circle">
                  <Typography variant="h4" className="avatar-initials">{initials}</Typography>
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
              <Typography variant="h6" className="list-title">
                Users already rated:
                <span className="dropdown-icon">
                  <svg fill="none" viewBox="0 0 24 24" height="2em" width="2em" style={{ marginRight: '8px' }}>
                    <path fill="currentColor" d="M12 16l-4-4h8l-4 4z" />
                  </svg>
                </span>
              </Typography>
              <ul>
                {alreadyRatedUserIds.map((userId) => (
                  <li key={userId}>
                    {users.find((user) => user.uid === userId)?.displayName || "Unknown User"}
                  </li>
                ))}
              </ul>
            </Grid>
          </Grid>
        </Card>
      </div>

      <UserQuestionnaireBox
        value={criteria}
        ratee={ratees.uid}
        description={activeRatingAssignment?.asJson.description || ""}
        disableAfterSubmission={disableAfterSubmission}
        setRatees={setRatees}

      />
    </div>
  );
});

export default UserLeadershipView;
