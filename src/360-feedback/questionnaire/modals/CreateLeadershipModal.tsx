import { observer } from "mobx-react-lite";
import { FormEvent, useMemo, useState } from "react";
import makeAnimated from "react-select/animated";
import MODAL_NAMES from "../../../logged-in/dialogs/ModalName";
import { useAppContext } from "../../../shared/functions/Context";
import { hideModalFromId } from "../../../shared/functions/ModalShow";
import { ILeadership, defaultLeadership } from "../../../shared/models/three-sixty-feedback-models/Leadership";


const NewLeadershipModal = observer(() => {
  const animatedComponents = makeAnimated();
  const { api, store } = useAppContext();
  const me = store.auth.meJson;
  const [leadership, setLeadership] = useState<ILeadership>(defaultLeadership);

  const [loading, setLoading] = useState(false);

  const [statements, setStatements] = useState<
  { id: string; statement: string; rating: number }[]
>([
  { id: new Date().toISOString(), statement: "", rating: 0 },
  { id: new Date().toISOString(), statement: "", rating: 0 },
  { id: new Date().toISOString(), statement: "", rating: 0 },
]);

const handleStatementChange = (index: number, statement: string) => {
  const updatedStatements = [...statements];
  updatedStatements[index].statement = statement;
  setStatements(updatedStatements);
};

const addStatement = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.preventDefault();
  const newStatement = {
    id: new Date().toISOString(),
    statement: "",
    rating: 0, // Include default rating
  };
  setStatements([...statements, newStatement]);
};

const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setLoading(true);

  // Ensure updatedLeadership includes rating
  const updatedLeadership = {
    ...leadership,
    statements: statements.map(statement => ({
      ...statement,
      rating: statement.rating ?? 0, // Ensure rating is always included
    })),
  };

  if (!me) return;
  await create(updatedLeadership);
  console.log("Leadership, ", updatedLeadership);
  setLoading(false);
  onCancel();
};

  const create = async (leadership: ILeadership) => {
    try {
      await api.leadership.create(leadership);
    } catch (error) {
      console.error("Error creating leadership:", error);
    }
  };

  const onCancel = () => {
    setLeadership({ ...defaultLeadership });
    hideModalFromId(MODAL_NAMES.THREE_SIXTY_FEEDBACK.CREATE_LEADERSHIP_MODAL);
  };

  return (
    <div
      className="user-modal uk-modal-dialog uk-modal-body uk-margin-auto-vertical"
      data-uk-overflow-auto
    >
      <button
        className="uk-modal-close-default"
        type="button"
        data-uk-close
      ></button>
      <h3 className="uk-modal-title">New Criteria</h3>
      <div className="dialog-content uk-position-relative">
        <form onSubmit={handleSubmit}>
          <fieldset className="uk-fieldset">
            <div className="uk-margin">
              <input
                className="uk-margin"
                type="text"
                placeholder="New Criteria"
                value={leadership.criteriaName}
                onChange={(e) =>
                  setLeadership({
                    ...leadership,
                    criteriaName: e.target.value,
                  })
                }
              />
            </div>
            <div className="dimension-view">
              <div className="uk-margin">
                {statements.map((statement, index) => (
                  <div
                    key={statement.id}
                    style={{ display: "flex", flexDirection: "row", marginBottom: "1rem" }}
                  >
                    <input
                      className="uk-input uk-form-small"
                      type="text"
                      placeholder={`Enter Statement ${index + 1}`}
                      value={statement.statement}
                      onChange={(e) =>
                        handleStatementChange(index, e.target.value)
                      }
                    />
                    <button
                      className="delete-statement"
                      onClick={() => {
                        const updatedStatements = statements.filter((_, i) => i !== index);
                        setStatements(updatedStatements);
                      }}
                      style={{ marginLeft: "1rem" }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                        <path d="M5 20a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8h2V6h-4V4a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v2H3v2h2zM9 4h6v2H9zM8 8h9v12H7V8z"></path>
                        <path d="M9 10h2v8H9zm4 0h2v8h-2z"></path>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              <button className="add-statement" onClick={addStatement}>
                Add Statement
              </button>
            </div>
            <div className="uk-width-1-1 uk-text-right">
              <button
                className="btn-text uk-margin-right"
                type="button"
                onClick={onCancel}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                type="submit"
                disabled={loading}
              >
                Save {loading && <div data-uk-spinner="ratio: .5"></div>}
              </button>
            </div>
          </fieldset>
        </form>
      </div>
    </div>
  );
});

export default NewLeadershipModal;
