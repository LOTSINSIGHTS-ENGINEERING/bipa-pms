import { observer } from "mobx-react-lite";
import { FormEvent, useMemo, useState } from "react";
import makeAnimated from "react-select/animated";

import "./CreateTemplateModal.scss";
import MODAL_NAMES from "../../../logged-in/dialogs/ModalName";
import { useAppContext } from "../../../shared/functions/Context";
import { hideModalFromId } from "../../../shared/functions/ModalShow";
import { ITemplates, defaultTemplate } from "../../../shared/models/three-sixty-feedback-models/Templates";
import { IOption } from "../../communication/single-select/SlingleSelect";

const CreateNewTemplateModal = observer(() => {
  const animatedComponents = makeAnimated();
  const { api, store } = useAppContext();
  const me = store.auth.meJson;
  const [template, setTemplate] = useState<ITemplates>({ ...defaultTemplate, statements: [] });
  const [loading, setLoading] = useState(false);
  const [statements, setStatements] = useState<{ id: string; statement: string }[]>([
    { id: new Date().toISOString(), statement: "" },
    { id: new Date().toISOString(), statement: "" },
    { id: new Date().toISOString(), statement: "" },
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
    };
    setStatements([...statements, newStatement]);
  };

  const deleteStatement = (index: number) => {
    const updatedStatements = statements.filter((_, i) => i !== index);
    setStatements(updatedStatements);
  };

  const handleSaveTemplate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // Ensure the statements are formatted correctly for the template
    const updatedTemplate: ITemplates = {
      ...template,
      statements: statements.map(({ id, statement }) => ({ id, statement, rating: 0 })),
    };

    if (template.title.trim() !== "" && updatedTemplate.statements.length > 0) {
      await api.templates.create(updatedTemplate);
      setTemplate({ ...defaultTemplate, statements: [] });
      onCancel();
    } else {
      alert("Please add a title and at least one question to the template.");
    }

    setLoading(false);
  };

  const options: IOption[] = useMemo(
    () =>
      store.user.all
        .map((user) => ({
          label: user.asJson.displayName || "",
          value: user.asJson.uid,
        }))
        .filter((user) => user.value !== me?.uid),
    [store.user, me?.uid]
  );

  const onCancel = () => {
    setTemplate({ ...defaultTemplate, statements: [] });
    hideModalFromId(MODAL_NAMES.THREE_SIXTY_FEEDBACK.CREATE_TEMPLATE_MODAL);
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
      <h3 className="uk-modal-title">Template Name</h3>
      <div className="dialog-content uk-position-relative">
        <form onSubmit={handleSaveTemplate}>
          <fieldset className="uk-fieldset">
            <div className="uk-margin">
              <input
                className="uk-margin"
                type="text"
                placeholder="Template Name"
                value={template.title}
                onChange={(e) =>
                  setTemplate({
                    ...template,
                    title: e.target.value,
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
                      onChange={(e) => handleStatementChange(index, e.target.value)}
                    />
                    <button
                      className="delete-statement"
                      onClick={() => deleteStatement(index)}
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

export default CreateNewTemplateModal;
