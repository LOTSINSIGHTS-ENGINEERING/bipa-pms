import React, { useState } from "react";
import { IconButton} from "@mui/material";

import EditTemplateModal from "../modals/EditTemplateModal";
import MODAL_NAMES from "../../../logged-in/dialogs/ModalName";
import { useAppContext } from "../../../shared/functions/Context";
import showModalFromId from "../../../shared/functions/ModalShow";
import { ITemplates, defaultTemplate } from "../../../shared/models/three-sixty-feedback-models/Templates";
import Modal from "../../../shared/components/Modal";

interface IProps {
  template: ITemplates;
}

export const AdminQuestionnaireBox: React.FC<IProps> = ({ template }) => {
  const { api, store } = useAppContext();
  const [selectedItem, setSelectedItem] = useState<ITemplates>({
    ...defaultTemplate,
  });
  const [startValue, setStartValue] = useState("");
  const [stopValue, setStopValue] = useState("");
  const [continueValue, setContinueValue] = useState("");
  const [additionalComment, setAdditionalComment] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const me = store.auth.meJson;

  const onDeleteTemplate = async (template: ITemplates) => {
    try {
      await api.templates.delete(template);
    } catch (error) {}
  };

  const toggleEdit = (item: ITemplates) => {
    setSelectedItem(item);
    const template = store.templates.getItemById(item.id)?.asJson;
    if (template) {
      store.templates.select(template);
      showModalFromId(MODAL_NAMES.THREE_SIXTY_FEEDBACK.EDIT_TEMPLATE_MODAL);
    }
  };

  const toggleDelete = (item: ITemplates) => {
    setSelectedItem(item);
    if (selectedItem) {
      const template = store.templates.getItemById(item.id)?.asJson;
      if (template) {
        if (window.confirm("Are you sure?")) {
          onDeleteTemplate(template);
        }
      }
    }
  };

  return (
    <div>
      {template !== undefined && (
        <div className="blue-curved-container">
          <div className="criteria-box">
            <div className="criteria">
              <div className="white-strip">
                <div className="criteria">
                  <h3>{template.title}</h3>
                </div>
              </div>
              <div className="statement">
                {template.statements.map((statement, statementIndex) => (
                  <div className="statement" key={statementIndex}>
                    <p>{statement.statement}</p>
                    <div className="rating-container">
                      <div className="rating">
                        {Array.from({ length: 5 }).map((_, ratingIndex) => (
                          <button key={ratingIndex}> {ratingIndex + 1}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {me?.role === "Admin" && (
              <div className="statement-buttons">
                <button
                  className="edit-statement uk-button uk-button-primary uk-button-small"
                  onClick={() => toggleEdit(template)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                  >
                    <path d="M4 21a1 1 0 0 0 .24 0l4-1a1 1 0 0 0 .47-.26L21 7.41a2 2 0 0 0 0-2.82L19.42 3a2 2 0 0 0-2.83 0L4.3 15.29a1.06 1.06 0 0 0-.27.47l-1 4A1 1 0 0 0 3.76 21 1 1 0 0 0 4 21zM18 4.41 19.59 6 18 7.59 16.42 6zM5.91 16.51 15 7.41 16.59 9l-9.1 9.1-2.11.52z" />
                  </svg>
                </button>
                <button
                  className="delete-statement uk-button uk-button-small"
                  onClick={() => toggleDelete(template)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                  >
                    <path d="M5 20a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8h2V6h-4V4a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v2H3v2h2zM9 4h6v2H9zM8 8h9v12H7V8z" />
                    <path d="M9 10h2v8H9zm4 0h2v8h-2z" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          {/* Conditionally render the modal based on user role */}
          {me?.role === "Admin" && (
            <Modal modalId={MODAL_NAMES.THREE_SIXTY_FEEDBACK.EDIT_TEMPLATE_MODAL}>
              <EditTemplateModal />
            </Modal>
          )}
        </div>
      )}
      <div className="required-inputs">
        <div className="input-group">
          <h4>
            Start <span style={{ color: "red" }}>*</span>
          </h4>
          <div className="input-container">
            <div className="blue-container">
              <div className="icon-banner">
                <IconButton
                  data-uk-tooltip="e.g What behaviors or practices should the individual start doing to improve their performance?"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" />
                    <path d="M11 11h2v6h-2zm0-4h2v2h-2z" />
                  </svg>
                </IconButton>
              </div>
              <textarea
                className="blue-textarea"
                value={startValue}
                maxLength={200}
                onChange={(e) => setStartValue(e.target.value)}
                disabled
              ></textarea>
            </div>
          </div>
        </div>

        <div className="input-group">
          <h4>
            Stop <span style={{ color: "red" }}>*</span>
          </h4>
          <div className="input-container">
            <div className="blue-container">
              <div className="icon-banner">
                <IconButton
                  data-uk-tooltip="e.g What behaviors or practices should the individual stop doing as they hinder their performance or the team's effectiveness?"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" />
                    <path d="M11 11h2v6h-2zm0-4h2v2h-2z" />
                  </svg>
                </IconButton>
              </div>
              <textarea
                className="blue-textarea"
                value={stopValue}
                maxLength={200}
                onChange={(e) => setStopValue(e.target.value)}
                disabled
              ></textarea>
            </div>
          </div>
        </div>

        <div className="input-group">
          <h4>
            Continue<span style={{ color: "red" }}>*</span>
          </h4>
          <div className="input-container">
            <div className="blue-container">
              <div className="icon-banner">
                <IconButton
                  data-uk-tooltip="e.g What behaviors or practices should the individual continue doing as they contribute positively to their performance and the team's success?"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" />
                    <path d="M11 11h2v6h-2zm0-4h2v2h-2z" />
                  </svg>
                </IconButton>
              </div>
              <textarea
                className="blue-textarea"
                value={continueValue}
                maxLength={200}
                onChange={(e) => setContinueValue(e.target.value)}
                disabled
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      {showNotification && (
        <span className="notification" style={{ color: "red" }}>
          Please fill in all required fields and select exactly one checkbox for
          each statement.
        </span>
      )}

      <div className="input-group">
        <h4>Additional Comments</h4>
        <div className="input-container" style={{ width: "80%" }}>
          <div className="blue-container">
            <textarea
              className="blue-textarea"
              placeholder=""
              value={additionalComment}
              maxLength={200}
              rows={4}
              onChange={(e) => setAdditionalComment(e.target.value)}
              disabled
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminQuestionnaireBox;
