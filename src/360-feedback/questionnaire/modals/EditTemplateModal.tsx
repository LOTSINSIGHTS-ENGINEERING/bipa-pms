import React, { FormEvent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";

import "./EditTemplateModal.scss";
import MODAL_NAMES from "../../../logged-in/dialogs/ModalName";
import { useAppContext } from "../../../shared/functions/Context";
import { hideModalFromId } from "../../../shared/functions/ModalShow";
import { ITemplates, defaultTemplate } from "../../../shared/models/three-sixty-feedback-models/Templates";

const EditTemplateModal = observer(() => {
  const { api, store } = useAppContext();
  const [template, setTemplate] = useState<ITemplates>({ ...defaultTemplate });
  const [loading, setLoading] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [statements, setStatements] = useState<{
    statement: string;
    id: string;
    rating: number;
    editing: boolean;
  }[]>([]);

  // Add a new statement to the list
  const addStatement = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (questionText.trim() !== "") {
      const newStatement = {
        id: new Date().toISOString(),
        statement: questionText,
        rating: 0,
        editing: false,
      };
      setStatements([...statements, newStatement]);
      setQuestionText("");
    }
  };

  // Save template changes
  const handleSaveTemplate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const updatedTemplate = {
      ...template,
      statements: statements.map((statement) => ({
        ...statement,
        editing: false, // Turn off editing mode when saving
      })),
    };
    
    if (template.title.trim() !== "" && statements.length > 0) {
      try {
        await api.templates.update(updatedTemplate);
        setLoading(false);
        onCancel(); // Reset states and hide modal
      } catch (error) {
        setLoading(false);
        console.error("Error updating template:", error);
        // Handle error appropriately, e.g., show error message to user
      }
    } else {
      setLoading(false);
      alert("Please add a title and at least one statement to the template.");
    }
  };

  // Effect to initialize modal with selected template (if any)
  useEffect(() => {
    if (store.templates.selected) {
      setTemplate({ ...store.templates.selected });
      setStatements(
        store.templates.selected.statements.map((statement) => ({
          ...statement,
          editing: false, // Initialize editing mode as false for existing statements
        }))
      );
    } else {
      setTemplate({ ...defaultTemplate });
      setStatements([]);
      hideModalFromId(MODAL_NAMES.THREE_SIXTY_FEEDBACK.EDIT_TEMPLATE_MODAL);
    }
  }, [store.templates, store.templates.selected]);

  // Cancel changes and reset modal state
  const onCancel = () => {
    setTemplate({ ...defaultTemplate });
    setStatements([]);
    hideModalFromId(MODAL_NAMES.THREE_SIXTY_FEEDBACK.EDIT_TEMPLATE_MODAL);
  };

  // Handle statement text change
  const handleStatementChange = (index: number, value: string) => {
    const updatedStatements = [...statements];
    updatedStatements[index].statement = value;
    setStatements(updatedStatements);
  };

  // Toggle edit mode for a statement
  const toggleEditMode = (index: number) => {
    const updatedStatements = [...statements];
    updatedStatements[index].editing = !updatedStatements[index].editing;
    setStatements(updatedStatements);
  };

  // Delete a statement from the list
  const deleteStatement = (index: number) => {
    const updatedStatements = [...statements];
    updatedStatements.splice(index, 1); // Remove the statement at index
    setStatements(updatedStatements);
  };

  return (
    <div className="user-modal uk-modal-dialog uk-modal-body uk-margin-auto-vertical" data-uk-overflow-auto>
      <button className="uk-modal-close-default">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          style={{ fill: "rgba(0, 0, 0, 1)" }}
        >
          <path d="M9.172 16.242 12 13.414l2.828 2.828 1.414-1.414L13.414 12l2.828-2.828-1.414-1.414L12 10.586 9.172 7.758 7.758 9.172 10.586 12l-2.828 2.828z"></path>
          <path d="M12 22c5.514 0 10-4.486 10-10S17.514 2 12 2 2 6.486 2 12s4.486 10 10 10zm0-18c4.411 0 8 3.589 8 8s-3.589 8-8 8-8-3.589-8-8 3.589-8 8-8z"></path>
        </svg>
      </button>
      <h3 className="uk-modal-title">Edit Template</h3>
      <div className="dialog-content uk-position-relative">
        <form onSubmit={handleSaveTemplate}>
          <fieldset className="uk-fieldset">
            <div className="uk-margin">
              <input
                className="uk-input"
                type="text"
                placeholder="Template Title"
                value={template.title}
                onChange={(e) => setTemplate({ ...template, title: e.target.value })}
              />
            </div>
            <div className="dimension-view">
              <div>
              {statements.map((statement, index) => (
                <li key={statement.id} style={{ marginBottom: "5px" }}>
                  {statement.editing ? (
                    <input
                      className="uk-input"
                      type="text"
                      value={statement.statement}
                      onChange={(e) => handleStatementChange(index, e.target.value)}
                    />
                  ) : (
                    <>
                      <span>
                        {index + 1}. {statement.statement}
                      </span>
                      <div className="statement-buttons">
                        <button className="edit-statement" onClick={() => toggleEditMode(index)}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                            <path d="M4 21a1 1 0 0 0 .24 0l4-1a1 1 0 0 0 .47-.26L21 7.41a2 2 0 0 0 0-2.82L19.42 3a2 2 0 0 0-2.83 0L4.3 15.29a1.06 1.06 0 0 0-.27.47l-1 4A1 1 0 0 0 3.76 21 1 1 0 0 0 4 21zM18 4.41 19.59 6 18 7.59 16.42 6zM5.91 16.51 15 7.41 16.59 9l-9.1 9.1-2.11.52z"></path>
                          </svg>
                        </button>
                        <button className="delete-statement" onClick={() => deleteStatement(index)}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                            <path d="M5 20a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8h2V6h-4V4a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v2H3v2h2zM9 4h6v2H9zM8 8h9v12H7V8z"></path>
                            <path d="M9 10h2v8H9zm4 0h2v8h-2z"></path>
                          </svg>
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}

                <input
                  className="uk-input"
                  type="text"
                  placeholder="New Statement"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                />
                <button className="add-statement" onClick={addStatement}>
                  Add Statement
                </button>
              </div>
            </div>
            <div className="uk-width-1-1 uk-text-right">
              <button className="btn-text uk-margin-right" type="button" onClick={onCancel}>
                Cancel
              </button>
              <button className="btn btn-primary" type="submit" disabled={loading}>
                Save {loading && <div data-uk-spinner="ratio: .5"></div>}
              </button>
            </div>
          </fieldset>
        </form>
      </div>
    </div>
  );
});

export default EditTemplateModal;
