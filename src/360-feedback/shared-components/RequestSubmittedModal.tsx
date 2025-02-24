import { observer } from "mobx-react-lite";
import "./SavedAlert.scss";
const RequestSubmittedAlertModal = observer(() => {
  return (
    <div className="saved-alert">
      <div style={{justifyContent:"center",alignItems:"center"}}>
        <img src={process.env.PUBLIC_URL + "/icons/Frame 27.png"} alt="image" />
        <h3>Request Submitted</h3>
      </div>
    </div>
  );
});

export default RequestSubmittedAlertModal;
