import { observer } from "mobx-react-lite";
import BarGraph from "../../../shared/components/graph-components/BarGraph";
import { useAppContext } from "../../../shared/functions/Context";
import "./ExecutionTabContent.scss";

const ExecutionTabContent = observer(() => {
  const { store } = useAppContext();

  const labels = ["Rating 1", "Rating 2", "Rating 3", "Rating 4", "Rating 5"];
  // user data
  const userData = store.report.allUserPerformanceData;
  console.log("User data", userData);
  


  const executionRate = userData.reduce((acc, user) => {
    const rate = user.asJson.finalRating >= 1 ? user.asJson.finalRating : 1;
    
    
    const finalRating = Math.floor(rate);
    const pos = finalRating - 1;
    acc[pos] = acc[pos] + 1; // increment
    return acc;
  },
    [0, 0, 0, 0, 0]
  );

  const divideGroups = executionRate.map((rates) => {
    return rates / 5;
  });

  return (
    <div className="people-tab-content">
      <div className="uk-grid-small uk-child-width-1-1@l" data-uk-grid>
        <div>
          <div
            className="uk-card uk-card-default uk-card-small uk-card-body"
            style={{ height: 500 }}
          >
            <BarGraph
              title="Execution Rate"
              ylabel="Rate"
              labels={labels}
              data={divideGroups}
              scales={{ y: { min: 0, max: 100 } }}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

export default ExecutionTabContent;
