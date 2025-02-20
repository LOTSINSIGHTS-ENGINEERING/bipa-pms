import { useEffect, useMemo, useState } from "react";
import useTitle from "../../shared/hooks/useTitle";
import { observer } from "mobx-react-lite";
import { useAppContext } from "../../shared/functions/Context";
import { LoadingEllipsis } from "../../shared/components/loading/Loading";
import { useNavigate} from "react-router-dom";
import useBackButton from "../../shared/hooks/useBack";
import {
  SCORECARD_TAB,
  QUARTER2_TAB,
  QUARTER4_TAB,
} from "../../shared/interfaces/IReviewCycleTabs";
import {
  IReviewCycleStatus,
  IReviewCycleType,
  IScorecardBatch,
} from "../../shared/models/ScorecardBatch";

import ErrorBoundary from "../../shared/components/error-boundary/ErrorBoundary";
import EmployeeReviewDraftCycle from "./EmployeeReviewDraftCycle";
import EmployeeReviewQ2Cycle from "./EmployeeReviewQ2Cycle";
import EmployeeReviewQ4Cycle from "./EmployeeReviewQ4Cycle";
import useIndividualScorecardHistory from "../../shared/hooks/useIndividualScorecardHistory";
import { useParams } from "react-router-dom";



interface IStepStageProps {
  open?: boolean;
  status?: IReviewCycleStatus;
  index: number;
  title: IReviewCycleType;
  setReviewCycle: React.Dispatch<React.SetStateAction<IReviewCycleType>>;
}
const StepStage = (props: IStepStageProps) => {
  const status = props.status || "pending";
  const open = props.open ? "open" : "closed";
  const className = `step--stage step--stage__${status} step--stage__${open}`;

  return (
    <button
      className={className}
      onClick={() => props.setReviewCycle(props.title)}
    >
      <div className="step--stage__bubble">
        <div className="step--stage__bubble__content">
          {status === "pending" && (
            <span className="icon" style={{ fontSize: "1.2rem" }}>
              {" "}
              ◔
            </span>
          )}
          {status === "in-progress" && (
            <span className="icon" style={{ fontSize: "1.2rem" }}>
              {" "}
              ◔
            </span>
          )}
          {status === "submitted" && (
            <span className="icon" style={{ fontSize: "1.2rem" }}>
              {" "}
              ◔
            </span>
          )}
          {(status === "reverted" || status === "cancelled") && (
            <span className="icon" style={{ fontSize: "1.2rem" }}>
              {" "}
              ×
            </span>
          )}
          {status === "approved" && (
            <span className="icon" data-uk-icon="check"></span>
          )}
        </div>
      </div>

      <div className="step--stage__content">
        <p className="label">
          STEP {props.index} {status}
        </p>
        <h6 className="title">{props.title}</h6>
      </div>
    </button>
  );
};

interface IReviewStepProps {
  batch: IScorecardBatch;
  reviewCycle: IReviewCycleType;
  setReviewCycle: React.Dispatch<React.SetStateAction<IReviewCycleType>>;
}
const ReviewCycles = observer((props: IReviewStepProps) => {
  const { reviewCycle, setReviewCycle ,batch} = props;
  const { store, api } = useAppContext();
  const { id } = useParams(); // 'id' must match the dynamic route parameter name
  console.log("selected id", id);

  const uid=store.auth.meJson.uid
  
  // const uid="wqLOfC1pmSSUhKu2o8TRW4B1qPF2"
  const { agreementHistory, loadingHistory } = useIndividualScorecardHistory(id,uid);
  const { agreementDraft, quarter2Review, quarter4Review } = agreementHistory;
  console.log("agreement ReviewCycles",agreementHistory);
  

  const cycle: IReviewCycleType = useMemo(() => {
    // Agreement statues => Draft, Midterm and Final
    const ads = agreementDraft.status;
    const ams = quarter2Review.status;

    // Scorecard
    if (ads === "submitted") return "Scorecard";
    else if (
      ads === "approved" &&
      (ams === "in-progress" || ams === "submitted")
    )
      return "Midterm Reviews";
    else if (ams === "approved") return "Assessment";
    else return "Scorecard";
  }, [agreementDraft.status, quarter2Review.status]);

  useEffect(() => {
    setReviewCycle(cycle);
  }, [cycle, setReviewCycle]);

  if (loadingHistory)
    return (
      <ErrorBoundary>
        <LoadingEllipsis />
      </ErrorBoundary>
    );

  return (
    <div className="step">
      <StepStage
        index={1}
        title={SCORECARD_TAB.name}
        status={agreementDraft.status}
        open={reviewCycle === SCORECARD_TAB.name}
        setReviewCycle={setReviewCycle}
      />
      <StepStage
        index={2}
        title={QUARTER2_TAB.name}
        status={quarter2Review.status}
        open={reviewCycle === QUARTER2_TAB.name}
        setReviewCycle={setReviewCycle}
      />
      <StepStage
        index={3}
        title={QUARTER4_TAB.name}
        status={quarter4Review.status}
        open={reviewCycle === QUARTER4_TAB.name}
        setReviewCycle={setReviewCycle}
      />
    </div>
  );
});

const IndividualScorecardHistory = observer(() => {
  const { store, api } = useAppContext();
  const { id } = useParams(); // 'id' must match the dynamic route parameter name
  console.log("selected id", id);

  const [cycle, setCycle] = useState<IReviewCycleType>(SCORECARD_TAB.name);
  const [loading, setLoading] = useState(false);
  const [_, setTitle] = useTitle(""); // set page title
 
  const navigate = useNavigate();

const uid="pGm6KllbCjfHzsmXSRXJnhi65Zv1"

const scorecards = store.scorecard.all.map((tenant) => tenant.asJson);
const scorecard = scorecards.find(
  (tenant) => tenant.id === id
);


  if (!scorecard) {
    console.error("Scorecard not found for the given ID.");
  }
  console.log("logg scorecard",scorecard);


  useEffect(() => {
    // if (!uid || !user) return;

    const load = async () => {
      
      setLoading(true); // start loading
      if(id && uid){ await api.objective.getAllHistory(id,uid); // load objectives
        await api.measure.getAllHistory(id,uid); // load measures
       }
     
      setLoading(false); // end loading
    };
    load();
  }, [api.measure,api.scorecard, api.objective, uid]);
  useEffect(() => {
    // load scorecard batch from db
    const loadAll = async () => {
      setLoading(true); // start loading
      try {
        await api.scorecard.getAll();
      } catch (error) {
        console.log(error);
      }
      setLoading(false); // stop loading
    };
    loadAll();
  }, [api.scorecard]);
  if (loading) return <LoadingEllipsis fullHeight />;

  return (
    <ErrorBoundary>
      <ErrorBoundary>
        {scorecard && (
          <div className="scorecard-page">
            <ReviewCycles
              batch={scorecard}
              reviewCycle={cycle}
              setReviewCycle={setCycle}
            />
          </div>
        )}
      </ErrorBoundary>

      <ErrorBoundary>
        {cycle === SCORECARD_TAB.name && <EmployeeReviewDraftCycle />}
        {cycle === QUARTER2_TAB.name && <EmployeeReviewQ2Cycle />}
        {cycle === QUARTER4_TAB.name && <EmployeeReviewQ4Cycle />}
      </ErrorBoundary>
    </ErrorBoundary>
  );
});

export default IndividualScorecardHistory;
