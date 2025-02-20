
import { useRef, useCallback } from "react";
import { observer } from "mobx-react-lite";
import BarGraph from "../../../shared/components/graph-components/BarGraph";
import { useAppContext } from "../../../shared/functions/Context";
import TopPerformers from "./TopPerformers";
import WorstPerformers from "./WorstPerformers";
import "./PeopleTabContent.scss";
import { generateReportPDF } from "../../../shared/functions/scorecard-pdf/GeneratePerformaneAgreementPDF";
import Toolbar from "../../shared/components/toolbar/Toolbar";
import useVM from "../../../shared/hooks/useVM";
import PieChart from "../../../shared/components/graph-components/PieChart";
import { toPng } from 'html-to-image';
import { log } from "console";

const PeopleTabContent = observer(() => {
  const { store, ui } = useAppContext();
  const { vision, mission } = useVM();
  const chartref = useRef<HTMLDivElement>(null);

  // analytics on people per finalRating.
  const labels = ["Rating 1", "Rating 2", "Rating 3", "Rating 4", "Rating 5"];
  // user data
  const userData = store.report.allUserPerformanceData;
console.log("User data",userData);


  // group finalRating
   const groupRating = userData.reduce(
    (acc, user) => {
      const rate = user.asJson.rating >= 1 ? user.asJson.rating : 1;
      const rating = Math.floor(rate);
      const pos = rating - 1;

      acc[pos] = acc[pos] + 1; // increment
      return acc;
    },
    [0, 0, 0, 0, 0]
  );
console.log("groupRating", groupRating);

  // top performers
  // const bestPerformers = userData
  //   .sort((a, b) => b.asJson.finalRating - a.asJson.finalRating)
  //   .filter((user) => user.asJson.finalRating >= 3);
  // top performers
  const topPerformers = userData.filter((user) => user.asJson.rating >= 3);

  console.log("top performers", topPerformers);

  // worst performers
  // worst performers
  const worstPerformers = userData.filter((user) => user.asJson.rating < 3);

  const onExportPNG = useCallback(async () => {
    if (chartref.current === null) {
      return;
    }
    await toPng(chartref.current, { cacheBust: true })
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.download = "Performance Report";
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        ui.snackbar.load({
          id: Date.now(),
          message: "Error! Failed to export.",
          type: "danger",
        });
      });
  }, [chartref, ui.snackbar]);

  const handleExportPDF = async () => {
    if (chartref.current === null) {
      return;
    }
    try {
      await toPng(chartref.current, { cacheBust: true }).then(
        async (dataUrl) => {
          const link = document.createElement("a");
          link.href = dataUrl;
          await generateReportPDF(
            vision,
            mission,
            link,
            topPerformers,
            worstPerformers
          );
        }
      );
    } catch (error) {
      ui.snackbar.load({
        id: Date.now(),
        message: "Error! Failed to export.",
        type: "danger",
      });
    }
  };

  return (
    <div className="people-tab-content">
      <Toolbar
        rightControls={
          <div>
            <button
              className="btn btn-primary uk-margin-left"
              onClick={handleExportPDF}>
              Export PDF
            </button>
            <button
              className="btn btn-primary uk-margin-left"
              onClick={onExportPNG}>
              Export PNG
            </button>
          </div>
        }
      />

      <div
        ref={chartref}
        className="uk-grid-small uk-child-width-1-2@l"
        data-uk-grid>
        <div>
          <div
            className="uk-card uk-card-default uk-card-small uk-card-body"
            style={{ height: 500 }}>
            <BarGraph
              title="Rating"
              ylabel="People"
              labels={labels}
              data={groupRating}
              scales={{ y: { min: 0, max: 100 } }}
            />
          </div>
        </div>
        <div>
          <div
            className="uk-card uk-card-default uk-card-small uk-card-body"
            style={{ height: 500 }}>
            <PieChart
              title="Final Rating"
              ylabel="People"
              labels={labels}
              data={groupRating}
            />
          </div>
        </div>
      </div>
      <div className="uk-grid-small uk-child-width-1-2@l" data-uk-grid>
        <div>
          <TopPerformers
            data={topPerformers}
            departments={store.department.all}
          />
        </div>
        <div>
          <WorstPerformers
            data={worstPerformers}
            departments={store.department.all}
          />
        </div>
      </div>
    </div>
  );
});

export default PeopleTabContent;