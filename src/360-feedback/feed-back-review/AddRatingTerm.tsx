import { observer } from "mobx-react-lite";

import { FormEvent, useEffect, useState } from "react";


import "./Ratings.scss";
import MODAL_NAMES from "../../logged-in/dialogs/ModalName";
import { useAppContext } from "../../shared/functions/Context";
import { hideModalFromId } from "../../shared/functions/ModalShow";
import { IRateAssignment, defaultRatingAssignment } from "../../shared/models/three-sixty-feedback-models/RateAssignments";

const AddTermRating = observer(() => {
  const { api, store } = useAppContext();

  const [rateAssignment, setRateAssignment] = useState<IRateAssignment>({ ...defaultRatingAssignment });
  const [loading, setLoading] = useState(false);
  const [activeTerm, setActiveTerm] = useState(false);

  useEffect(() => {
    const checkActiveTerm = async () => {
      const active = await api.ratingAssignments.hasActiveTerm();
      setActiveTerm(active);
    };
    checkActiveTerm();
  }, [api.ratingAssignments]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (activeTerm) {
      alert("A term is already in progress. Please complete the current term before starting a new one.");
      return;
    }

    setLoading(true);

    const selected = store.ratingAssignments.selected;

    if (selected) await update(rateAssignment);
    else await create(rateAssignment);

    setLoading(false);
    onCancel();
  };

  const update = async (rateAssignment: IRateAssignment) => {
    try {
      await api.ratingAssignments.update(rateAssignment);
    } catch (error) {
      console.log("Failed to update:", error);
    }
  };

  const create = async (rateAssignment: IRateAssignment) => {
    try {
      await api.ratingAssignments.create(rateAssignment);
    } catch (error) {
      console.log("Failed to create:", error);
    }
  };

  const onCancel = () => {
    store.ratingAssignments.clearSelected();
    setRateAssignment({ ...defaultRatingAssignment });
    hideModalFromId(MODAL_NAMES.THREE_SIXTY_FEEDBACK.CREATE_RATING_TERM);
  };

  return (
    <div
      className="user-modal uk-modal-dialog uk-modal-body uk-margin-auto-vertical"
      style={{ width: "600px" }}>
      <button
        className="uk-modal-close-default"
        type="button"
        data-uk-close></button>

      <h3 className="uk-modal-title">Feedback Term</h3>

      <div className="dialog-content uk-position-relative">
        <form onSubmit={handleSubmit}>
          <div className="uk-width-1-1">
            <label className="uk-form-label" htmlFor="business-unit-fname">
              Term
            </label>
            <div className="uk-form-controls">
              <input
                className="uk-input uk-form-small"
                id="business-unit-fname"
                type="text"
                placeholder="Name e.g. '2020-2021'"
                value={rateAssignment.description}
                onChange={(e) =>
                  setRateAssignment({
                    ...rateAssignment,
                    description: e.target.value,
                    midtermReview: {
                      ...rateAssignment.midtermReview,
                      status: "Not Started",
                    },
                  })
                }
              />
            </div>
          </div>
          <button
            className="small-button uk-button-primary"
            type="submit"
            disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
});

export default AddTermRating;
