import { observer } from "mobx-react-lite";
import { useAppContext } from "../../../shared/functions/Context";
import { FormEvent, useEffect, useState } from "react";
import { IJobCard, defaultJobCard } from "../../../shared/models/job-card-model/Jobcard";
import { hideModalFromId } from "../../../shared/functions/ModalShow";
import MODAL_NAMES from "../../dialogs/ModalName";


const AddTeamRatingModal = observer(() => {
  const { api, store } = useAppContext();

  const [jobCard, setJobCard] = useState<IJobCard>({ ...defaultJobCard });
  const [loading, setLoading] = useState(false);

  // Define a function to handle changes to the due date
  const handleRatingChange = (rating: number) => {
  

    setJobCard({
      ...jobCard,
      teamRating: rating,
    });
  };
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true); // start loading
  await api.jobcard.jobcard.update(jobCard)

    setLoading(false); // stop loading

    onCancel();
  };

  const update = async (jobCard: IJobCard) => {
    try {
      //   await api.businessUnit.update(jobCard);
    } catch (error) {
      console.log("Failed to update> Error: ", error);
    }
  };

    const onCancel = () => {
      store.jobcard.jobcard.clearSelected();
      setJobCard({ ...defaultJobCard });
      hideModalFromId(MODAL_NAMES.EXECUTION.TEAM_RATING_MODAL);
    };

  // if selected businessUnit, set form values
  useEffect(() => {
    if (store.jobcard.jobcard.selected) {
      setJobCard(store.jobcard.jobcard.selected);
    }
  }, [store.jobcard.jobcard.selected]);

  return (
    <div className="business-unit-modal uk-modal-dialog uk-modal-body uk-margin-auto-vertical">
      <button
        className="uk-modal-close-default"
        type="button"
        data-uk-close></button>

      <h3 className="uk-modal-title">Team Rating</h3>

      <div className="dialog-content uk-position-relative">
        <form
          className="uk-form-stacked uk-grid-small"
          data-uk-grid
          onSubmit={handleSubmit}>
          <div className="uk-width-1-1">
            <label className="uk-form-label" htmlFor="business-unit-fname">
              Team Rating
            </label>
            <div className="uk-form-controls">
              <input
                className="uk-input uk-form-small"
                id="dueDate"
                type="number"
                name="dueDate"
                value={jobCard.teamRating}
                onChange={(e) => handleRatingChange(e.target.valueAsNumber)}
                max={5} // Set the minimum date to today's date
                // required
              />
            </div>
          </div>

          <div className="uk-width-1-1 uk-text-right">
            <button
              className="btn-text uk-margin-right"
              type="button"
              onClick={onCancel}>
              Cancel
            </button>

            <button
              className="btn btn-primary"
              type="submit"
              disabled={loading}>
              Save {loading && <div data-uk-spinner="ratio: .5"></div>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

export default AddTeamRatingModal;
