import { observer } from "mobx-react-lite";

import { useEffect, useState } from "react";

import UserMetrics from "./views/components/UserMetricComponent";
import UserQuestionnaireBox from "./components/QuestionnaireBox";
import { useParams } from "react-router-dom";
import { useAppContext } from "../../shared/functions/Context";
import { IUser, defaultUser } from "../../shared/models/User";

const ValueQuestionnaireView = observer(() => {
  const { api, store, ui } = useAppContext();
  const [disableAfterSubmission, setDisableAfterSubmission] = useState(false);
  //const me = store.auth.meJson;
  const values = store.value.all.map((value) => {
    return value.asJson;
  });
  const { raterId } = useParams();
  const [ratees, setRatees] = useState<IUser>({ ...defaultUser });
  const users = store.user.all.map((user) => {
    return user.asJson;
  });
  const me = users.filter((user) => user.uid === raterId);
  const description =
    store.ratingAssignments.all.find((match) => match.asJson.isActive)?.asJson
      .description || "";

  const matches = store.ratingAssignments.all.map((match) => {
    if (match.asJson.isActive) {
      const feedbackAssignments =
        match.asJson.feedbackAssignments[raterId ?? ""];
      return feedbackAssignments;
    }
  });
  const departments = store.department.all.map((department) => {
    return department.asJson;
  });
  const getDepartmentName = (departmentId: string): string => {
    const department = departments.find(
      (department) => department.id === departmentId
    );
    if (!department) {
      return "";
    }
    return department.name ?? "";
  };
  const matchingUsers = users
    .filter((user) => matches.flat().includes(user.uid))
    .map((u) => ({ value: u.uid, label: u.displayName + " " + u.lastName }));


  const handleRaterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const ratee = users.find((user) => user.uid === e.target.value);
    if(ratee){  setDisableAfterSubmission(false)}
    if (ratee) setRatees(ratee);

  
  };

  useEffect(() => {
    const load = async () => {
      await api.value.getAll();
      await api.ratingAssignments.getAll();
      await api.department.getAll();
      await api.user.getAll();
    };
    load();
  }, [api.value, api.user, api.ratingAssignments, api.department]);

  return (
    <div
      className="value-page uk-card uk-card-default uk-card-body uk-card-small uk-margin-bottom"
      style={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        padding: "1rem",
        width: "90%",
        margin: "auto",
      }}>
      <div className="user-rating-container">
        <div className="user-block">
          <h4>
            Hi{" "}
            <span>
              {me?.map((user) => {
                return user.displayName;
              })}
            </span>
            , You are about to rate{" "}
            <span>
              <select onChange={handleRaterChange} value={ratees.uid} required>
                <option value="">Select Rater</option>
                {matchingUsers.map((rater, raterIndex) => (
                  <option key={raterIndex} value={rater.value ?? ""}>
                    {rater.label ?? ""}
                  </option>
                ))}
              </select>
            </span>{" "}
            on Company Values
          </h4>
          <div className="user-information">
            <div className="image">
              <img
                src={process.env.PUBLIC_URL + "/icons/Ellipse 105.png"}
                alt="image"
              />
            </div>
            <div className="user-detail-block">
              <p>You are rating</p>
              <h4>{ratees.displayName}</h4>
            </div>
            <div className="user-detail-block">
              <p>Department</p>
              <h4>{getDepartmentName(ratees.department)}</h4>
            </div>
            <div className="user-detail-block">
              <p>Position</p>
              <h4>{ratees.jobTitle}</h4>
            </div>
          </div>
        </div>
        <div className="metrics-block">
          <UserMetrics />
        </div>
      </div>{" "}
      {/* <div className="value-parent-container"> */}
      <UserQuestionnaireBox
        value={values}
        ratee={ratees.uid}
        rater={raterId}
        description={description}
        disableAfterSubmission={disableAfterSubmission}
       
        setRatees={setRatees}
      />
      {/* </div> */}
    </div>
  );
});
export default ValueQuestionnaireView;
