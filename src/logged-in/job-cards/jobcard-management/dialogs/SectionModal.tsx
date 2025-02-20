import { observer } from "mobx-react-lite";
import { FormEvent, useEffect, useState } from "react";
import { useAppContext } from "../../../../shared/functions/Context";
import { IDepartment, defaultDepartment } from "../../../../shared/models/Department";
import { hideModalFromId } from "../../../../shared/functions/ModalShow";
import MODAL_NAMES from "../../../dialogs/ModalName";
import SectionForm from "./SectionForm";
import { ISection, defaultSection } from "../../../../shared/models/job-card-model/Section";

const SectionModal = observer(() => {
  const { api, store } = useAppContext();

  const [section, setSection] = useState<ISection>({
    ...defaultSection,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true); // start loading

    const sec = section;
    // if selected department, update
    const selected = store.jobcard.section.selected

    if (selected) await update(sec);
    else await create(sec);
    setLoading(false); // stop loading

    onCancel();
  };

  const update = async (section: ISection) => {
    try {
      await api.jobcard.section.update(section);
    } catch (error) {
      console.log("Failed to update> Error: ", error);
    }
  };

  const create = async (section: ISection) => {
    try {
      await api.jobcard.section.create(section);
    } catch (error) {
      console.log("Failed to create> Error: ", error);
    }
  };

  const onCancel = () => {
    // clear selected department
    store.jobcard.section.clearSelected();
    // reset form
    setSection({ ...defaultSection });
    // hide modal
    hideModalFromId(MODAL_NAMES.ADMIN.DEPARTMENT_MODAL);
  };

  // if selected department, set form values
  useEffect(() => {
    if (store.jobcard.section.selected) {
      setSection(store.jobcard.section.selected);
    }
  }, [store.jobcard.section.selected]);

  return (
    <div className="department-modal uk-modal-dialog uk-modal-body uk-margin-auto-vertical">
      <button
        className="uk-modal-close-default"
        type="button"
        data-uk-close></button>

      <h3 className="uk-modal-title">Department</h3>

      <div className="dialog-content uk-position-relative">
        <form
          className="uk-form-stacked uk-grid-small"
          onSubmit={handleSubmit}
          data-uk-grid>
          <SectionForm section={section} setSection={setSection} />

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

export default SectionModal;
