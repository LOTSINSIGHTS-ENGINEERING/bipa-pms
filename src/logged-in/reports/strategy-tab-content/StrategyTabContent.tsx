import { observer } from "mobx-react-lite";
import { useAppContext } from "../../../shared/functions/Context";
import Objectives from "./Objectives";
import Measures from "./Measures";
import "./StrategyTabContent.scss";

const StrategyTabContent = observer(() => {
  const { store } = useAppContext();

  return (
    <div className="strategy-tab-content">
      <div
        className="uk-grid-small uk-child-width-1-1@m uk-grid-match"
        data-uk-grid
      >
        {/* TODO: Read company objectives */}
        <div>
          <Objectives objectives={store.companyObjective.all} />
        </div>

        {/* TODO: Read company measures. */}
        <div>
          <Measures measures={store.companyMeasure.all} />
        </div>
      </div>

      {/* <div className="uk-card uk-card-default uk-card-body uk-margin">
        <h4>Strategy Tab </h4>
        <hr />
        <ul>
          <li>Objectives</li>
          ------------------------------
          <li>Due measures</li>
        </ul>
      </div> */}
    </div>
  );
});

export default StrategyTabContent;
