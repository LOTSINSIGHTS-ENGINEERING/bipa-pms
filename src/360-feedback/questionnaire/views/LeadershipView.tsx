import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";

import "./ValuesViews.scss";
import { CriteriaBox } from "../components/CriteriaBox";
import NewLeadershipModal from "../modals/CreateLeadershipModal";
import QuestionnairePreview from "../modals/QuestionnairePreview";

import MODAL_NAMES from "../../../logged-in/dialogs/ModalName";
import { useAppContext } from "../../../shared/functions/Context";
import showModalFromId from "../../../shared/functions/ModalShow";
import Modal from "../../../shared/components/Modal";

const LeadershipView = observer(() => {
  const { api, store } = useAppContext();

  const addNewLeadership = () => {
    showModalFromId(MODAL_NAMES.THREE_SIXTY_FEEDBACK.CREATE_LEADERSHIP_MODAL);
  };

  const sendQuestionnaire = () => {
    showModalFromId(MODAL_NAMES.THREE_SIXTY_FEEDBACK.QUESTIONNAIRE_PREVIEW);
  };

  const leadershipCriteria = store.leadership.all.map((item) => item.asJson);

  useEffect(() => {
    const load = async () => {
      try {
        await api.leadership.getAll();
      } catch (error) {
        console.error("Failed to fetch leadership criteria:", error);
      }
    };
    load();
  }, [api.leadership]);

  return (
    <div className="questions-page">

        <div className="button-container">
         <button
           className="create-values-button"
            onClick={addNewLeadership}
         >
           Create Leadership Criteria
         </button>
       
{/* 
        <button
          className="uk-button uk-button-link uk-button-small"
          onClick={sendQuestionnaire}
        >
          View Questionnaire
        </button> */}

      </div>
      {leadershipCriteria.length > 0 ? (
        <CriteriaBox value={leadershipCriteria} />
      ) : (
        <p>No leadership criteria available. Create a new criterion to get started.</p>
      )}
      <Modal modalId={MODAL_NAMES.THREE_SIXTY_FEEDBACK.CREATE_LEADERSHIP_MODAL}>
        <NewLeadershipModal />
      </Modal>
      <Modal modalId={MODAL_NAMES.THREE_SIXTY_FEEDBACK.QUESTIONNAIRE_PREVIEW}>
        <QuestionnairePreview />
      </Modal>
    </div>
  );
});

export default LeadershipView;
