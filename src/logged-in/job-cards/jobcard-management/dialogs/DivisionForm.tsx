import React from "react";
import { IBusinessUnit } from "../../../../shared/models/BusinessUnit";
import { IDivision } from "../../../../shared/models/job-card-model/Division";

interface IProps {
  division: IDivision;
  setDivision: React.Dispatch<React.SetStateAction<IDivision>>;
}
const DivisionForm = (props: IProps) => {
  const { division, setDivision } = props;

  return (
    <>
      {/* Division Name */}
      <div className="uk-width-1-1">
        <label className="uk-form-label" htmlFor="division-name">
          Division Name
        </label>
        <div className="uk-form-controls">
          <input
            className="uk-input uk-form-small"
            id="division-name"
            type="text"
            placeholder="Name"
            value={division.name}
            onChange={(e) =>
              setDivision({ ...division, name: e.target.value })
            }
            required
          />
        </div>
      </div>

      {/* Division Owner */}
      <div className="uk-width-1-1">
        <label className="uk-form-label" htmlFor="division-owner">
          Division Owner
        </label>
        <div className="uk-form-controls">
          <input
            className="uk-input uk-form-small"
            id="division-owner"
            type="text"
            placeholder="Owner"
            value={division.divisionOwner}
            onChange={(e) =>
              setDivision({ ...division, divisionOwner: e.target.value })
            }
            required
          />
        </div>
      </div>

      {/* Description */}
      <div className="uk-width-1-1">
        <label className="uk-form-label" htmlFor="division-description">
          Description
        </label>
        <div className="uk-form-controls">
          <textarea
            className="uk-textarea uk-form-small"
            id="division-description"
            placeholder="Enter a brief description"
            value={division.description}
            onChange={(e) =>
              setDivision({ ...division, description: e.target.value })
            }
          />
        </div>
      </div>

      {/* Is Active */}
      <div className="uk-width-1-1">
        <label className="uk-form-label" htmlFor="division-is-active">
          Active
        </label>
        <div className="uk-form-controls">
          <input
            className="uk-checkbox"
            id="division-is-active"
            type="checkbox"
            checked={division.isActive}
            onChange={(e) =>
              setDivision({ ...division, isActive: e.target.checked })
            }
          />
        </div>
      </div>
    </>
  );
};


export default DivisionForm;
