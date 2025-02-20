import { observer } from "mobx-react-lite";
import React from "react";

import { useAppContext } from "../../../../shared/functions/Context";
import SingleSelect from "../../../../shared/components/single-select/SingleSelect";
import { ISection } from "../../../../shared/models/job-card-model/Section";


interface IProps {
  section: ISection;
  setSection: React.Dispatch<React.SetStateAction<ISection>>;
}
const SectionForm = observer((props: IProps) => {
  const { store } = useAppContext();

  const { section, setSection } = props;

  const buOptions = store.jobcard.division.all.map((bu) => ({
    label: bu.asJson.name,
    value: bu.asJson.id,
  }));

  return (
    <>
      <div className="uk-width-1-1">
        <label className="uk-form-label" htmlFor="department-fname">
          Name
        </label>
        <div className="uk-form-controls">
          <input
            className="uk-input uk-form-small"
            id="department-fname"
            type="text"
            placeholder="Name e.g. ICT"
            value={section.name}
            onChange={(e) => setSection({ ...section, name: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="uk-width-1-1">
        <label className="uk-form-label" htmlFor="department-business-unit">
          Division
        </label>
        <div className="uk-form-controls">
          <SingleSelect
            options={buOptions}
            name="department-business-unit"
            value={section.division}
            onChange={(value) =>
              setSection({ ...section, division: value })
            }
            placeholder="Select a business unit"
            required
          />
        </div>
      </div>
    </>
  );
});

export default SectionForm;
