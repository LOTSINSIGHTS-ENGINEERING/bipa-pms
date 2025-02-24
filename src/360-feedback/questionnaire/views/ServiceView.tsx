import { observer } from "mobx-react-lite";

import { useEffect, useState } from "react";
import "./UserLeadershipView.scss";

import UserRequesterQuestionnaireBox from "./UserRequester";
import { useAppContext } from "../../../shared/functions/Context";
import { IUser, defaultUser } from "../../../shared/models/User";

const ServiceView = observer(() => {
  const { api, store, ui } = useAppContext();
  const me = store.auth.meJson;
  const criteria = store.services.all.map((value) => {
    return value.asJson;
  });
  const [ratees, setRatees] = useState<IUser>({ ...defaultUser });
  const users = store.user.all.map((user) => {
    return user.asJson;
  });
  const matches = store.ratingAssignments.all.map((match) => {
    const feedbackAssignments = match.asJson.feedbackAssignments[me?.uid ?? ""];
    return feedbackAssignments;
  });
  const matchingUsers = users
    .filter((user) => matches.flat().includes(user.uid))
    .map((u) => ({ value: u.uid, label: u.displayName + " " + u.lastName }));
  const handleRaterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const ratee = users.find((user) => user.uid === e.target.value);
    if (ratee) setRatees(ratee);
  };
  //console.log("My Values",values);
  useEffect(() => {
    const load = async () => {
      await api.service.getAll();
      await api.value.getAll();
      await api.ratingAssignments.getAll();
      await api.user.getAll();
    };
    load();
  }, [api.service, api.value]);

  return (
    <div
      className="value-page uk-card uk-card-default uk-card-body uk-card-small uk-margin-bottom"
      style={{
        display: "flex",
        justifyContent: "flex-end",
        flexDirection: "column",
      }}
    >
      {/* <div className="value-parent-container"> */}
      {criteria !== undefined && (
        <UserRequesterQuestionnaireBox value={criteria} ratee={ratees.uid} />
      )}
    </div>
  );
});
export default ServiceView;
