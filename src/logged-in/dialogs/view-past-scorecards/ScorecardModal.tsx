import { observer } from "mobx-react-lite";
import { Fragment, useCallback, useEffect, useState } from "react";
import { LoadingEllipsis } from "../../../shared/components/loading/Loading";
import { useAppContext } from "../../../shared/functions/Context";
import { hideModalFromId } from "../../../shared/functions/ModalShow";
import useTitle from "../../../shared/hooks/useTitle";
import { IScorecardBatch } from "../../../shared/models/ScorecardBatch";
import EmptyError from "../../admin-settings/EmptyError";
import MODAL_NAMES from "../ModalName";
import ScorecardItem from "./ScorecardItem";
import { useNavigate } from "react-router-dom";

const ScorecardModal = observer(() => {
  const { api, store } = useAppContext();
  const [title, setTitle] = useTitle();
  const [loading, setLoading] = useState(false);
  const me = store.auth.meJson;
  console.log("Me in modal ", me);

  const navigate = useNavigate();

  const onSelect = (scorecard: IScorecardBatch) => {
    store.user.select(me);
    console.log("select user", store.user.selected);

    const id = scorecard.id;
    navigate(`/c/scorecards/my/history/${id}`); // Navigate to the history route
    console.log("selected Id", id);
  };

  const onCancel = () => {
    hideModalFromId(MODAL_NAMES.EXECUTION.SCORECARD_MODAL);
  };

  // load scorecard batch from db
  const loadAll = useCallback(async () => {
    setLoading(true); // start loading
    try {
      await api.scorecard.getAll();
    } catch (error) {
      console.log("Failed to load scorecard batch> Error: ", error);
    }
    setLoading(false); // stop loading
  }, [api.scorecard]);

  useEffect(() => {
    loadAll();

    return () => {};
  }, [loadAll]);

  return (
    <div className="scorecard-modal uk-modal-dialog uk-modal-body uk-margin-auto-vertical">
      <button
        className="uk-modal-close-default"
        type="button"
        data-uk-close
      ></button>

      <h3 className="uk-modal-title">Past Scorecards</h3>

      <div className="dialog-content uk-position-relative">
        {!loading &&
          store.scorecard.all.map((batch) => (
            <Fragment key={batch.asJson.id}>
              <ScorecardItem
                activeScorecard={store.scorecard.active}
                scorecard={batch.asJson}
                onSelect={onSelect}
              />
            </Fragment>
          ))}

        {/* Empty & not loading */}
        {!store.scorecard.all.length && !loading && (
          <EmptyError errorMessage="No scorecards found" />
        )}

        {/* Loading */}
        {loading && <LoadingEllipsis />}

        <div className="uk-text-right">
          <button className="btn btn-primary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
});

export default ScorecardModal;
