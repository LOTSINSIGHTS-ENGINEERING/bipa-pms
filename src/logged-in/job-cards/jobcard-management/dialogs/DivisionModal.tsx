
import { observer } from "mobx-react-lite";
import DivisionForm from "./DivisionForm";
import { useAppContext } from "../../../../shared/functions/Context";
import { FormEvent, useEffect, useState } from "react";

import { hideModalFromId } from "../../../../shared/functions/ModalShow";
import MODAL_NAMES from "../../../dialogs/ModalName";
import { IDivision, defaultDivision } from "../../../../shared/models/job-card-model/Division";

const DivisionModal = observer(() => {
  const { api, store } = useAppContext();

  const [division, setDivision] = useState<IDivision>({
    ...defaultDivision
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true); // start loading

    const dev = division;
    // if selected businessUnit, update
    const selected = store.jobcard.division.selected;

    if (selected) await update(dev);
    else await create(dev);
    setLoading(false); // stop loading

    onCancel();
  };

  const update = async (division: IDivision) => {
    try {
      await api.jobcard.division.update(division);
    } catch (error) {
      console.log("Failed to update> Error: ", error);
    }
  };

  const create = async (division: IDivision) => {
    try {
      await api.jobcard.division.create(division);
    } catch (error) {
      console.log("Failed to create> Error: ", error);
    }
  };

  const onCancel = () => {
    // clear selected business unit
    store.businessUnit.clearSelected();
    // reset form
    setDivision({ ...defaultDivision });
    // hide modal
    hideModalFromId(MODAL_NAMES.ADMIN.BUSINESS_UNIT_MODAL);
  };

  // if selected businessUnit, set form values
  useEffect(() => {
    if (store.jobcard.division.selected) {
      setDivision(store.jobcard.division.selected);
    }
  }, [store.jobcard.division.selected]);

  return (
    <div className="business-unit-modal uk-modal-dialog uk-modal-body uk-margin-auto-vertical">
      <button
        className="uk-modal-close-default"
        type="button"
        data-uk-close></button>

      <h3 className="uk-modal-title">Division</h3>

      <div className="dialog-content uk-position-relative">
        <form
          className="uk-form-stacked uk-grid-small"
          data-uk-grid
          onSubmit={handleSubmit}>
          <DivisionForm division={division} setDivision={setDivision} />

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

export default DivisionModal;
