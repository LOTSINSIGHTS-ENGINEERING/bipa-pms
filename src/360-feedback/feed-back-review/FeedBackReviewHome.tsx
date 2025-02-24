import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";

import AddRatingTerm from "./AddRatingTerm";
import FeedbackTermTable from "./FeedbackTermTable";

import "./FeedbackReview.scss";
import Toolbar from "../../logged-in/shared/components/toolbar/Toolbar";

import MODAL_NAMES from "../../logged-in/dialogs/ModalName";
import ErrorBoundary from "../../shared/components/error-boundary/ErrorBoundary";
import { useAppContext } from "../../shared/functions/Context";
import showModalFromId, { hideModalFromId } from "../../shared/functions/ModalShow";
import Modal from "../../shared/components/Modal";


const FeedbackReviewHome = observer(() => {
  const { api, store } = useAppContext();
  const [loading, setLoading] = useState<boolean>(false);

  const assignments = store.ratingAssignments.all.map(
    (assignment) => assignment.asJson
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([api.user.getAll(), api.ratingAssignments.getAll()]);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false); // Ensure loading state is properly managed
      }
    };

    setLoading(true); // Set loading state when data loading starts
    loadData();
  }, [api.user, api.ratingAssignments]);

  const addRatingTerm = () => {
    showModalFromId(MODAL_NAMES.THREE_SIXTY_FEEDBACK.CREATE_RATING_TERM);
  };

  const onCancel = () => {
    hideModalFromId(MODAL_NAMES.THREE_SIXTY_FEEDBACK.QUESTIONNAIRE_PREVIEW);
  };

  return (
    <ErrorBoundary>
      <div className="ratings-container uk-container uk-container-large">
        <div className="uk-card uk-card-default uk-margin-top-10">
          <h3>Feedback Review Terms</h3>
          <Toolbar
            rightControls={
              <button onClick={addRatingTerm} className="feedback-button">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  className="icon">
                  <path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z"></path>
                </svg>
                <span>Add Rating Term</span>
              </button>
            }
          />
          <FeedbackTermTable data={assignments} />
        </div>
      </div>

      <Modal modalId={MODAL_NAMES.THREE_SIXTY_FEEDBACK.CREATE_RATING_TERM}>
        <AddRatingTerm />
      </Modal>
    </ErrorBoundary>
  );
});

export default FeedbackReviewHome;
