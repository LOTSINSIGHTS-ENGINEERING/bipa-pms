import { observer } from "mobx-react-lite";
const UserMetrics = observer(() => {
  return (
    <div className="metrics-block ">
      <div>
      <p>Select the rating 01 being least and 05 being the best</p>
      </div>
      <div>
        <img src={process.env.PUBLIC_URL + "/icons/Vector.png"} alt="image" />
      </div>
      <div>
        <img
          src={process.env.PUBLIC_URL + "/icons/Group 550.png"}
          alt="image"
        />
      </div>
    </div>
  );
});
export default UserMetrics;
