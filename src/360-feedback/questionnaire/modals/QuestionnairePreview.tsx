import { observer } from "mobx-react-lite";

import { FormEvent, useEffect, useState } from "react";
import React from "react";
import CriteriaBox from "../components/CriteriaBox";

import { distributeAndSendFeedback } from "../../ratings/functions";



import SavedAlertModal from "../../shared-components/SavedAlertModal";

import MODAL_NAMES from "../../../logged-in/dialogs/ModalName";
import { dateFormat_YY_MM_DY } from "../../../logged-in/shared/utils/utils";
import ErrorBoundary from "../../../shared/components/error-boundary/ErrorBoundary";
import { useAppContext } from "../../../shared/functions/Context";
import { hideModalFromId } from "../../../shared/functions/ModalShow";
import { IRateAssignment, defaultRatingAssignment } from "../../../shared/models/three-sixty-feedback-models/RateAssignments";
import { IUser } from "../../../shared/models/User";
import Modal from "../../../shared/components/Modal";



const QuestionnairePreview = observer(() => {
  const { api, store, ui } = useAppContext();
  const [ratingAssignments, setRatingAssignments] = useState<IRateAssignment>({
    ...defaultRatingAssignment,
  });
  //!TEST EMAIL FUNCTION
  // const getEmail = (users: IUser) => {
  //   // const user = users.find((user) => user.uid === raterId);
  //   let emails: string[] = [];
  //   if (users?.email === "dinahmasule@gmail.com")
  //     emails.push("dinahmasule@gmail.com" || "");
  //   return emails;
  // };
  // const getEmail = (users: IUser[]) => {
  //   const foundUser = users.find((user) => user.uid === raterId);
  //   return foundUser ? [foundUser.email] : [];
  // };

  //!OFFICIAL FUNCTION
  const getEmail = (raterId: string, user: IUser) => {
    let emails: string[] = [];
    if (raterId === user.uid) {
      emails.push(user.email || "");
    }
    return emails;
  };

  const valueCriteria = store.value
    ? store.value.all.map((value) => {
        return value.asJson;
      })
    : [];
  const leadershipCriteria = store.leadership.all.map((criteria) => {
    return criteria.asJson;
  });
  const [onNext, setNext] = useState<Boolean>(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevents the default form submission behavior
    alert("Send link to users");
  };
  const onBack = () => {
    setNext(false);
  };
  const toggleNext = () => {
    setNext(true);
  };
  const onCancel = () => {
    hideModalFromId(MODAL_NAMES.THREE_SIXTY_FEEDBACK.QUESTIONNAIRE_PREVIEW);
  };
  // const handlePeriodChange = (value: FeedbackPeriod) => {
  //   setRatingAssignments((prevState) => ({
  //     ...prevState,
  //     period: value,
  //   }));
  // };

  useEffect(() => {
    const saveRatingAssignments = async () => {
      try {
        await api.ratingAssignments.create(ratingAssignments);
      } catch (error) {
        console.log(error);
      }
    };

    if (
      ratingAssignments.isActive !== false &&
      Object.keys(ratingAssignments.feedbackAssignments).length !== 0
    ) {
      saveRatingAssignments();
    }
  }, [ratingAssignments]);

  useEffect(() => {
    const load = () => {
      return new Promise(async (reject) => {
        try {
          await api.value.getAll();
          await api.leadership.getAll();
          await api.user.getAll();
        } catch (error) {
          reject(error); // Reject the promise if an error occurs
        }
      });
    };
    load()
      .then(() => {
        console.log("Data loaded successfully!");
        // Additional actions after data loading
      })
      .catch((error) => {
        console.log("Error loading data:", error);
        // Handle error as needed, e.g., show a message to the user
      });
  }, []);

  return (
    <div
      className="user-modal uk-modal-dialog uk-modal-body uk-margin-auto-vertical"
      data-uk-overflow-auto
      style={{
        width: "80%",
        maxWidth: "800px",
        height: "90%",
        maxHeight: "800px",
        padding: "2rem",
      }}>
      <button
        className="uk-modal-close-default"
        type="button"
        data-uk-close></button>
      <div className="uk-card uk-card-small">
        <h4>Questionnaire</h4>
        {/* Conditionally render CriteriaBox if store.value is truthy */}
        <div style={{ marginBottom: "1rem" }}>
          {" "}
          {/* <select
            className="uk-select uk-form-small"
            id="kpi-draft-select"
            value={ratingAssignments.midtermReview.}
            onChange={(e) =>
              handlePeriodChange(e.target.value as FeedbackPeriod)
            }
          >
            <option disabled>--Select a Period--</option>
            <option value="FeedbackPeriod.Midterm">Midterm Review</option>
            <option value="FeedbackPeriod.Final">
              Final Assessment Review
            </option>
          </select> */}
        </div>
        <div className="uk-form-controls" style={{ marginBottom: "1rem" }}>
          <label>Select Start Date</label>
          <input
            id="kpi-target"
            className="uk-input uk-form-small"
            placeholder="KPI Annual Target"
            type="date"
            value={dateFormat_YY_MM_DY(
              ratingAssignments.midtermReview.startDate || "yyyy/mm/dd"
            )}
            onChange={(e) =>
              setRatingAssignments((prevRatingAssignments) => ({
                ...prevRatingAssignments,
                midtermReview: {
                  ...prevRatingAssignments.midtermReview,
                  startDate: new Date(e.target.value).toISOString(),
                },
              }))
            }
            required
          />
        </div>
        <div className="uk-form-controls" style={{ marginBottom: "1rem" }}>
          <label>Select End Date</label>
          <input
            id="kpi-target"
            className="uk-input uk-form-small"
            placeholder="KPI Annual Target"
            type="date"
            value={dateFormat_YY_MM_DY(
              ratingAssignments.midtermReview.endDate || "yyyy/mm/dd"
            )}
            onChange={(e) =>
              setRatingAssignments((prevRatingAssignments) => ({
                ...prevRatingAssignments,
                midtermReview: {
                  ...prevRatingAssignments.midtermReview,
                  endDate: new Date(e.target.value).toISOString(),
                },
              }))
            }
            required
          />
        </div>

        {!onNext ? (
          <ErrorBoundary>
            <h3 style={{ color: "black" }}>Values</h3>
            <CriteriaBox value={valueCriteria} />
          </ErrorBoundary>
        ) : (
          <>
            <h3 style={{ color: "black" }}>Leadership</h3>
            <CriteriaBox value={leadershipCriteria} />
            <button
              className="uk-button uk-button-small uk-button-mute"
              onClick={onBack}
              style={{ marginRight: "1rem" }}>
              Back
            </button>
            {/* <button
              className="uk-button uk-button-small uk-button-primary"
              onClick={sendQuestionnaire}
            >
              Send Questionnaire
              {loading && <LoadingEllipsis />}
            </button> */}
          </>
        )}
        {!onNext && (
          <button
            style={{ marginRight: "1rem" }}
            onClick={toggleNext}
            className="template-container uk-button uk-button-small uk-button-primary">
            Next
          </button>
        )}
        <button
          onClick={onCancel}
          className="template-container uk-button uk-button-small uk-button-danger"
          style={{ marginLeft: "1rem" }}>
          Cancel
        </button>
        <Modal
          modalId={
            MODAL_NAMES.THREE_SIXTY_FEEDBACK.SUCCESSFULLY_SUBMITTED_MODAL
          }>
          <SavedAlertModal />
        </Modal>
      </div>
    </div>
  );
});
export default QuestionnairePreview;
