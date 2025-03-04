import {
  faFilePdf,
  faFileExcel,
  faCheck,
  faPaperPlane,
  faCommentDots,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { observer } from "mobx-react-lite";
import React, { useMemo, useState } from "react";
import Dropdown from "../../shared/components/dropdown/Dropdown";
import ErrorBoundary from "../../shared/components/error-boundary/ErrorBoundary";
import Modal from "../../shared/components/Modal";
import { useAppContext } from "../../shared/functions/Context";
import { dataFormat } from "../../shared/functions/Directives";
import showModalFromId from "../../shared/functions/ModalShow";
import {
  ALL_TAB,
  fullPerspectiveName,
  MAP_TAB,
} from "../../shared/interfaces/IPerspectiveTabs";
import MeasureDepartment, { IMeasureDepartment } from "../../shared/models/MeasureDepartment";
import ObjectiveDepartment, { IObjectiveDepartment } from "../../shared/models/ObjectiveDepartment";
import { IScorecardMetadata } from "../../shared/models/ScorecardMetadata";
import { IScorecardReview } from "../../shared/models/ScorecardReview";
import EmptyError from "../admin-settings/EmptyError";
import MeasureDepartmentUpdateQ1ActualModal from "../dialogs/measure-department-update-q1-actual/MeasureDepartmentUpdateQ1ActualModal";
import MeasureDepartmentModal from "../dialogs/measure-department/MeasureDepartmentModal";
import MeasureStatusUpdateDepartmentModal from "../dialogs/measure-status-update-department/MeasureStatusUpdateDepartmentModal";
import MODAL_NAMES from "../dialogs/ModalName";
import NoScorecardData from "../shared/components/no-scorecard-data/NoScorecardData";
import Rating from "../shared/components/rating/Rating";
import Tabs from "../shared/components/tabs/Tabs";
import Toolbar from "../shared/components/toolbar/Toolbar";
import { rateColor } from "../shared/functions/Scorecard";
import { sortByPerspective } from "../shared/utils/utils";
import NoMeasures from "./NoMeasures";
import StrategicMap from "./DepartmentStrategicMap";

interface IMoreButtonProps {
  agreement: IScorecardMetadata;
}
const MoreButton = observer((props: IMoreButtonProps) => {
  const { api, ui, store } = useAppContext();
  const { agreement } = props;

  const me = store.auth.meJson; // TODO: issue!
  const objectives = store.departmentObjective.all; // Not correct. Get only that belong to this department
  const measures = store.departmentMeasure.all; // Not correct. Get only that belong to this department
  const measureAudits = store.departmentMeasureAudit.all; // Not correct. Get only that belong to this department
  const reviewApi = api.departmentScorecardReview.draft;
  const scorecard = store.scorecard.active;

  const status = useMemo(
    () => agreement.quarter1Review.status || "pending",
    [agreement.quarter1Review.status]
  );

  const isDisabled = useMemo(
    () => !scorecard || scorecard.quarter1Review.status !== "in-progress",
    [scorecard]
  );

  const onSubmitReview = async () => {
    if (!me) return;
    const _objectives = objectives.map((o) => o.asJson);
    const _measures = measures.map((m) => m.asJson);
    const _measureAudits = measureAudits.map((m) => m.asJson);

    const $review = reviewApi.transform(
      me,
      _objectives,
      _measures,
      _measureAudits
    );
    const $agreement = agreement;
    $agreement.quarter1Review.status = "submitted";
    $agreement.quarter1Review.submittedOn = new Date().toDateString();

    await onUpdate($agreement, $review);
  };

  const onUpdate = async (
    agreement: IScorecardMetadata,
    review: IScorecardReview
  ) => {
    try {
      await reviewApi.create(review);
      await api.departmentScorecardMetadata.create(agreement);
      ui.snackbar.load({
        id: Date.now(),
        message: "Submitted Q1 progress for review.",
        type: "success",
      });
    } catch (error) {
      ui.snackbar.load({
        id: Date.now(),
        message: "Error! Failed to submit your Q1 progress for review.",
        type: "danger",
      });
    }
  };

  return (
    <ErrorBoundary>
      {status === "in-progress" && (
        <button
          className="kit-dropdown-btn"
          onClick={onSubmitReview}
          disabled={isDisabled}
        >
          <FontAwesomeIcon
            icon={faPaperPlane}
            className="icon uk-margin-small-right"
          />
          Submit Q1 Progress for Review
        </button>
      )}
      {status === "submitted" && (
        <button className="kit-dropdown-btn" disabled>
          <FontAwesomeIcon
            icon={faCheck}
            className="icon icon--success uk-margin-small-right"
          />
          Submitted Q1 Progress for Review
        </button>
      )}
      {status === "approved" && (
        <button className="kit-dropdown-btn">
          <FontAwesomeIcon
            icon={faCheck}
            className="icon icon--success uk-margin-small-right"
          />
          View Q1 Performance
        </button>
      )}
    </ErrorBoundary>
  );
});

interface IMeasureTableItemProps {
  canUpdate: boolean;
  isApproved: boolean;
  measure: MeasureDepartment;
}
const MeasureTableItem = (props: IMeasureTableItemProps) => {
  const { store } = useAppContext();
  const { canUpdate, isApproved } = props;

  const measure = props.measure.asJson;

  const rateCss = rateColor(
    Number(measure.q1Rating || measure.q1AutoRating),
    measure.isUpdated
  );

  const handleEditComments = () => {
    store.departmentMeasure.select(measure); // select measure
    showModalFromId(MODAL_NAMES.EXECUTION.DEPARTMENT_MEASURE_COMMENTS_MODAL);
  };

  const handleUpdateMeasureProgress = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.stopPropagation();
    store.departmentMeasure.select(measure); // select measure
    showModalFromId(
      MODAL_NAMES.EXECUTION.DEPARTMENT_MEASURE_UPDATE_Q1_ACTUAL_MODAL
    );
  };

  return (
    <tr className="row">
      <td>
        <div className={`status ${rateCss}`}></div>
      </td>
      <td>
        {measure.description}
        <button
          className="comments-btn btn-text uk-margin-small-left"
          onClick={handleEditComments}
          data-uk-icon="icon: commenting; ratio: 1"
        ></button>
      </td>

      <td className="no-whitespace">
        {dataFormat(measure.dataType, measure.baseline, measure.dataSymbol)}
      </td>
      <td className="no-whitespace">
        {dataFormat(measure.dataType, measure.annualTarget, measure.dataSymbol)}
      </td>
      <td className="no-whitespace">
        {dataFormat(
          measure.dataType,
          measure.quarter1Target,
          measure.dataSymbol
        )}
      </td>
      <td className="no-whitespace">
        {dataFormat(
          measure.dataType,
          measure.quarter2Target,
          measure.dataSymbol
        )}
      </td>
      <td className="no-whitespace">
        {dataFormat(
          measure.dataType,
          measure.quarter3Target,
          measure.dataSymbol
        )}
      </td>
      <td className="no-whitespace">
        {dataFormat(
          measure.dataType,
          measure.quarter4Target,
          measure.dataSymbol
        )}
      </td>
      <td className="no-whitespace">
        {dataFormat(
          measure.dataType,
          measure.quarter1Actual,
          measure.dataSymbol
        )}
      </td>
      <td className={`no-whitespace actual-value ${rateCss}`}>
        {measure.q1AutoRating}
      </td>
      {canUpdate && (
        <td>
          <div className="controls">
            <button
              className="btn-icon"
              onClick={handleUpdateMeasureProgress}
              title="Update progress"
            >
              <span data-uk-icon="pencil"></span>
            </button>
          </div>
        </td>
      )}
      {isApproved && (
        <td className={`no-whitespace actual-value ${rateCss}`}>
          {measure.q1Rating || measure.q1AutoRating || "-"}
        </td>
      )}
    </tr>
  );
};

interface IMeasureTableProps {
  measures: MeasureDepartment[];
  agreement: IScorecardMetadata;
  hasAccess: boolean;
}
const MeasureTable = (props: IMeasureTableProps) => {
  const { measures, agreement, hasAccess } = props;

  const isApproved = useMemo(
    () => agreement.quarter1Review.status === "approved",
    [agreement]
  );

  const canUpdate = useMemo(() => {
    const statusCondition = agreement.quarter1Review.status === "in-progress";
    return statusCondition && hasAccess;
  }, [agreement.quarter1Review.status, hasAccess]);

  return (
    <div className="measure-table">
      {measures.length !== 0 && (
        <table className="measure-table uk-table uk-table-small uk-table-middle uk-table-hover uk-table-divider">
          <thead className="header">
            <tr>
              <th></th>
              <th className="uk-width-expand@s">Measure/KPI</th>
              <th>Baseline</th>
              <th>Annual Target</th>
              <th>Q1 Target</th>
              <th>Q2 Target</th>
              <th>Q3 Target</th>
              <th>Q4 Target</th>
              <th>Progress</th>
              <th>Q1 E-Rating</th>
              {canUpdate && <th></th>}
              {isApproved && <th>Q1 S-Rating</th>}
            </tr>
          </thead>
          <tbody>
            {measures.map((measure) => (
              <MeasureTableItem
                key={measure.asJson.id}
                measure={measure}
                canUpdate={canUpdate}
                isApproved={isApproved}
              />
            ))}
          </tbody>
        </table>
      )}

      {measures.length === 0 && <NoMeasures />}
    </div>
  );
};

interface IObjectiveItemProps {
  objective: ObjectiveDepartment;
  measures: MeasureDepartment[];
  children?: React.ReactNode;
}
const ObjectiveItem = (props: IObjectiveItemProps) => {
  const { children, objective,measures } = props;


  const { description, perspective, weight } = objective.asJson;
  const { rate, isUpdated } = objective.q1Rating;
  //get all the measusres in that objective and average them the mu
  console.log("My measures in this objective", measures);

  const sumMeasures = measures.reduce((acc, measure) => acc + measure.asJson.q1AutoRating, 0);  // Summing up all measures
  const averageMeasure = sumMeasures / measures.length;  // Calculating the average measure
  
  // Assuming objectiveWeight is a value between 0 and 1, representing the percentage weight of this objective
  const objectiveRating = averageMeasure * (objective.asJson.weight/100);  // Applying the weight to the average
  
  console.log("Objective Rating: ", objectiveRating);
  console.log("Objective Rating: ", averageMeasure);
  

  return (
    <div className="objective uk-card uk-card-default uk-card-small uk-card-body uk-margin">
      <div className="uk-flex uk-flex-middle">
        <div className="uk-margin-right">
          <Rating rate={averageMeasure} isUpdated={isUpdated} />
        </div>
        <h3 className="objective-name uk-width-1-1">
          {description}
          <span className="objective-persepctive uk-margin-small-left">
            {fullPerspectiveName(perspective)}
          </span>
          <span className="objective-weight">Weight: {weight || 0}%</span>
        </h3>
      </div>

      <div className="uk-margin">{children}</div>
    </div>
  );
};

interface IStrategicListProps {
  agreement: IScorecardMetadata;
  objectives: ObjectiveDepartment[];
  hasAccess: boolean;
}
const StrategicList = observer((props: IStrategicListProps) => {
  const { agreement, objectives, hasAccess } = props;

  return (
    <div className="objective-table uk-margin">
      {objectives.map((objective) => (
        <ErrorBoundary key={objective.asJson.id}>
          <ObjectiveItem objective={objective} measures={objective.measures}>
            <MeasureTable
              measures={objective.measures}
              agreement={agreement}
              hasAccess={hasAccess}
            />
          </ObjectiveItem>
        </ErrorBoundary>
      ))}

      {!objectives.length && <EmptyError errorMessage="No objective found" />}
    </div>
  );
});

interface IProps {
  agreement: IScorecardMetadata;
  objectives: ObjectiveDepartment[];
  hasAccess: boolean;
  handleExportPDF: () => Promise<void>;
  handleExportExcel: () => Promise<void>;
  handleFeedback: () => void;
}
const DepartmentScorecardQ1Cycle = observer((props: IProps) => {
  const {
    agreement,
    objectives,
    hasAccess,
    handleExportExcel,
    handleExportPDF,
    handleFeedback,
  } = props;

  const [tab, setTab] = useState(ALL_TAB.id);
  const { store } = useAppContext();


  const measures = store.departmentMeasure.all
  const filteredObjectivesByPerspective = useMemo(() => {
    const sorted = objectives.sort(sortByPerspective);
    return tab === ALL_TAB.id
      ? sorted
      : sorted.filter((o) => o.asJson.perspective === tab);
  }, [objectives, tab]);



 
  
  const allObjectives = objectives.map((o) => o.asJson);

  const allMeasures = measures.map((o) => o.asJson);

  const CalculateOverallRatingsDepartment = (
    measures:IMeasureDepartment[],
    objectives:  IObjectiveDepartment[]
  ): number => {
    // Store the total weighted score
    let totalWeightedScore = 0;

    objectives.forEach((objective) => {
      const objectiveId = objective.id;
      const objectiveWeight = objective.weight || 0; // Objective weight

      // Get all measures related to the current objective
      const objectiveMeasures = measures.filter(
        (measure) => measure.objective === objectiveId
      );


      // Step 1: Calculate the average of the measure ratings for the objective
      const totalMeasureRating = objectiveMeasures.reduce((sum, measure) => {
        const finalRating = measure.q1AutoRating || 0;
        return sum + finalRating;
      }, 0);

      // If no measures, the average is 0
      const averageMeasureScore =
        objectiveMeasures.length > 0
          ? totalMeasureRating / objectiveMeasures.length
          : 0;

      // Step 2: Calculate the weighted score for the objective
      const weightedScore = averageMeasureScore * (objectiveWeight / 100);
    

      // Accumulate the weighted score to the total
      totalWeightedScore += weightedScore;
    });

    return parseFloat(totalWeightedScore.toFixed(2)) // Return the total weighted score
    
  };
  
  if (agreement.agreementDraft.status !== "approved")
    return (
      <ErrorBoundary>
        <NoScorecardData
          title="Department scorecard is not approved."
          subtitle="You cannot view Quarter 1 tab if the department scorecard is not yet approved."
          instruction="Please ensure that the Department Scorecard has been uploaded, and approved."
        />
      </ErrorBoundary>
    );

  return (
    <ErrorBoundary>
      <div className="department-plan-view-page uk-section uk-section-small">
        <div className="uk-container uk-container-xlarge">
          <ErrorBoundary>
            <Toolbar
              leftControls={<Tabs tab={tab} setTab={setTab} />}
              rightControls={
                <ErrorBoundary>
                  <div className="uk-inline">
                    <button className="btn btn-primary">
                      More <span data-uk-icon="icon: more; ratio:.8"></span>
                    </button>

                    <Dropdown pos="bottom-right">
                      {hasAccess && (
                        <li>
                          <ErrorBoundary>
                            <MoreButton agreement={agreement} />
                          </ErrorBoundary>
                        </li>
                      )}
                      <li>
                        <button
                          className="kit-dropdown-btn"
                          onClick={handleExportPDF}
                          title="Export your scorecard as PDF."
                        >
                          <FontAwesomeIcon
                            icon={faFilePdf}
                            size="lg"
                            className="icon uk-margin-small-right"
                          />
                          Export PDF
                        </button>
                      </li>
                      <li>
                        <button
                          className="kit-dropdown-btn"
                          onClick={handleExportExcel}
                          title="Export your scorecard as EXCEL."
                        >
                          <FontAwesomeIcon
                            icon={faFileExcel}
                            size="lg"
                            className="icon uk-margin-small-right"
                          />
                          Export Excel
                        </button>
                      </li>
                      <li>
                        <button
                          className="kit-dropdown-btn"
                          onClick={handleFeedback}
                          title="Read Comments"
                        >
                          <FontAwesomeIcon
                            icon={faCommentDots}
                            size="lg"
                            className="icon uk-margin-small-right"
                          />
                          Feedback
                        </button>
                      </li>
                    </Dropdown>
                  </div>
                </ErrorBoundary>
              }
            />
          </ErrorBoundary>
          <ErrorBoundary>
            <Toolbar
              leftControls={
                <ErrorBoundary>
                  <h6 className="uk-title">OVERALL RATING:  {CalculateOverallRatingsDepartment(allMeasures,allObjectives)}</h6>
                </ErrorBoundary>
              }
              rightControls={
                <ErrorBoundary>
                  <div className="uk-inline"></div>
                </ErrorBoundary>
              }
            />
          </ErrorBoundary>
          <ErrorBoundary>
            <div className="uk-margin">
              {tab === MAP_TAB.id && <StrategicMap />}
              {tab !== MAP_TAB.id && (
                <StrategicList
                  agreement={agreement}
                  objectives={filteredObjectivesByPerspective}
                  hasAccess={hasAccess}
                />
              )}
            </div>
          </ErrorBoundary>
        </div>
      </div>

      <ErrorBoundary>
        {/* Modals */}
        <Modal modalId={MODAL_NAMES.EXECUTION.DEPARTMENT_MEASURE_MODAL}>
          <MeasureDepartmentModal />
        </Modal>
        <Modal
          modalId={
            MODAL_NAMES.EXECUTION.DEPARTMENT_MEASURE_UPDATE_Q1_ACTUAL_MODAL
          }
        >
          <MeasureDepartmentUpdateQ1ActualModal />
        </Modal>
        <Modal
          modalId={MODAL_NAMES.EXECUTION.DEPARTMENT_MEASURE_COMMENTS_MODAL}
        >
          <MeasureStatusUpdateDepartmentModal />
        </Modal>
      </ErrorBoundary>
    </ErrorBoundary>
  );
});

export default DepartmentScorecardQ1Cycle;
