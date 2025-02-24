import React, { useState, useEffect } from "react";
import "react-datepicker/dist/react-datepicker.css";
import "./CustomisedTemplates.scss";

import { observer } from "mobx-react-lite";

import MODAL_NAMES from "../../../logged-in/dialogs/ModalName";
import { LoadingEllipsis } from "../../../shared/components/loading/Loading";
import { useAppContext } from "../../../shared/functions/Context";
import showModalFromId from "../../../shared/functions/ModalShow";
import { ITemplates } from "../../../shared/models/three-sixty-feedback-models/Templates";
import CreateNewTemplateModal from "../modals/CreateTemplateModal";
import AdminQuestionnaireBox from "./AdminTemplateQuestionnaire";
import Modal from "../../../shared/components/Modal";

const TemplateCard = ({ template, onClick }: { template: ITemplates; onClick: (template: ITemplates) => void }) => (
  <div className="template-card" onClick={() => onClick(template)}>
    <div className="content">
      <h4>{template.title}</h4>
      <div className="statements-container">
        {template.statements.map((statement, index) => (
          <p key={index}>{statement.statement}</p>
        ))}
      </div>
    </div>
    <div className="triangles"></div>
  </div>
);

const Templates = observer(() => {
  const { api, store } = useAppContext();
  const [view, setView] = useState<ITemplates | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGridView, setIsGridView] = useState(true);

  const templates = store.templates.all.map((template) => template.asJson);

  const filteredTemplates = templates.filter((template) =>
    template.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      await api.user.getAll();
      await api.templates.getAll();
      setLoading(false);
    };
    fetchTemplates();
  }, [api.user, api.templates]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleCardClick = (template: ITemplates) => {
    setView(template);
    setIsModalOpen(true);
  };

  const onCreateTemplate = () => {
    showModalFromId(MODAL_NAMES.THREE_SIXTY_FEEDBACK.CREATE_TEMPLATE_MODAL);
  };

  const handleCloseView = () => {
    setView(null);
    setIsModalOpen(false);
  };

  return (
    <>
      {loading ? (
        <div className="loading">
          <LoadingEllipsis />
          <span className="loading-text">Loading templates...</span>
        </div>
      ) : (
        <div className="templates-container">
          <div className="top-row">
            <h3>Customized Templates</h3>
            <div className="search-container">
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="search-input"
              />
            </div>
            <button className="create-template-button" onClick={onCreateTemplate}>
              <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24" height="1.5em" width="1.5em">
                <path stroke="none" d="M0 0h24v24H0z" />
                <path d="M5 4 H19 A1 1 0 0 1 20 5 V7 A1 1 0 0 1 19 8 H5 A1 1 0 0 1 4 7 V5 A1 1 0 0 1 5 4 z" />
                <path d="M5 12 H9 A1 1 0 0 1 10 13 V19 A1 1 0 0 1 9 20 H5 A1 1 0 0 1 4 19 V13 A1 1 0 0 1 5 12 z" />
                <path d="M14 12h6M14 16h6M14 20h6" />
              </svg>
              Create a Template
            </button>

            <div className="layout-toggle">
              <button
                className={`toggle-button ${isGridView ? "active" : ""}`}
                onClick={() => setIsGridView(true)}
              >
                <svg
                   viewBox="0 0 24 24"
                   fill="currentColor"
                   height="1em"
                   width="1em"
                 >
                   <path d="M10 3H4a1 1 0 00-1 1v6a1 1 0 001 1h6a1 1 0 001-1V4a1 1 0 00-1-1zM9 9H5V5h4v4zm5 2h6a1 1 0 001-1V4a1 1 0 00-1-1h-6a1 1 0 00-1 1v6a1 1 0 001 1zm1-6h4v4h-4V5zM3 20a1 1 0 001 1h6a1 1 0 001-1v-6a1 1 0 00-1-1H4a1 1 0 00-1 1v6zm2-5h4v4H5v-4zm8 5a1 1 0 001 1h6a1 1 0 001-1v-6a1 1 0 00-1-1h-6a1 1 0 00-1 1v6zm2-5h4v4h-4v-4z" />
                </svg>
              </button>
              <button
                className={`toggle-button ${!isGridView ? "active" : ""}`}
                onClick={() => setIsGridView(false)}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  height="1em"
                  width="1em"
                >
                  <path d="M4 6h2v2H4zm0 5h2v2H4zm0 5h2v2H4zm16-8V6H8.023v2H18.8zM8 11h12v2H8zm0 5h12v2H8z" />
                </svg>
              </button>
            </div>
          </div>
          <Modal modalId={MODAL_NAMES.THREE_SIXTY_FEEDBACK.CREATE_TEMPLATE_MODAL}>
            <CreateNewTemplateModal />
          </Modal>
          <div style={{ marginTop: "2rem" }}>
            {view && (
              <div>
                <button className="close-view-button" onClick={handleCloseView}>
                  <svg viewBox="0 0 1024 1024" fill="currentColor" height="2em" width="2em">
                    <path d="M685.4 354.8c0-4.4-3.6-8-8-8l-66 .3L512 465.6l-99.3-118.4-66.1-.3c-4.4 0-8 3.5-8 8 0 1.9.7 3.7 1.9 5.2l130.1 155L340.5 670a8.32 8.32 0 00-1.9 5.2c0 4.4 3.6 8 8 8l66.1-.3L512 564.4l99.3 118.4 66 .3c4.4 0 8-3.5 8-8 0-1.9-.7-3.7-1.9-5.2L553.5 515l130.1-155c1.2-1.4 1.8-3.3 1.8-5.2z" />
                    <path d="M512 65C264.6 65 64 265.6 64 513s200.6 448 448 448 448-200.6 448-448S759.4 65 512 65zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z" />
                  </svg>
                </button>
                <AdminQuestionnaireBox key={view.id} template={view} />
              </div>
            )}
            {!isModalOpen && (
              <div className={`template-cards-container ${isGridView ? "grid-view" : "list-view"}`}>
                {filteredTemplates.map((template) => (
                  <TemplateCard key={template.id} template={template} onClick={handleCardClick} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
});

export default Templates;
