import { useEffect, useState } from "react";

import "./UserQuestionnaireBox.scss";

import SavedAlertModal from "../../shared-components/SavedAlertModal";

import InfoIcon from "@mui/icons-material/Info";
import IconButton from "@mui/material/IconButton";

import {
  updateRatedUsersPerAssignmentLeadership,
  updateRatedUsersPerAssignmentValues,
} from "../../ratings/functions";

import MODAL_NAMES from "../../../logged-in/dialogs/ModalName";
import { useAppContext } from "../../../shared/functions/Context";
import showModalFromId, { hideModalFromId } from "../../../shared/functions/ModalShow";
import { ILeadership } from "../../../shared/models/three-sixty-feedback-models/Leadership";
import { ILeadershipRating, defaultLeadershipRating } from "../../../shared/models/three-sixty-feedback-models/LeadershipRating";
import { IRateAssignment } from "../../../shared/models/three-sixty-feedback-models/RateAssignments";
import { IValueRating, defaultValueRating } from "../../../shared/models/three-sixty-feedback-models/ValueRating";
import { IValue } from "../../../shared/models/three-sixty-feedback-models/Values";
import Modal from "../../../shared/components/Modal";
interface IProps {
  value: (IValue | ILeadership)[];
  ratee?: string;
  rater?: string;
  description: string;
  rating?: string;
}

export const QuestionnaireBoxResubmission: React.FC<IProps> = ({
  value,
  ratee,
  rater,
  description,
  rating,
}) => {
  const { api, store } = useAppContext();
  const myUid = store.auth.meJson?.uid;
  console.log("My UID NOW " + myUid);
  const user = store.user.all.find((d) => d.asJson.uid === ratee);
  console.log("user", user);
  const me = rater !== undefined && rater !== "" ? rater : myUid ?? "";
  const [startValue, setStartValue] = useState("");
  const [stopValue, setStopValue] = useState("");
  const [continueValue, setContinueValue] = useState("");
  const [additionalComment, setAdditionalComment] = useState("");
  const [loading, setLoading] = useState<Boolean>(false);
  const [showNotification, setShowNotification] = useState(false);
  const [leadershipRating, setLeadershipRating] = useState<ILeadershipRating>({
    ...defaultLeadershipRating,
  });
  const [valueRating, setValueRating] = useState<IValueRating>({
    ...defaultValueRating,
  });
  const [isCheckedMap, setIsCheckedMap] = useState<
    Record<string, Record<number, boolean>>
  >({});
  const ratingAssignments = store.ratingAssignments.all.find(
    (r) => r.asJson.isActive === true
  )?.asJson;
  function isValue(item: IValue | ILeadership): item is IValue {
    return "valueName" in item;
  }
  const updateRatingAssignment = async (ratingAssignment: IRateAssignment) => {
    await api.ratingAssignments.update(ratingAssignment);
  };

 

  const onSubmit = async () => {
    try {
      setLoading(true);
      const requiredFieldsFilled =
        startValue.trim() !== "" &&
        stopValue.trim() !== "" &&
        continueValue.trim() !== "" &&
        Object.values(isCheckedMap).every((map) => {
          const checkedCount = Object.values(map).filter(
            (isChecked) => isChecked
          ).length;
          return checkedCount === 1;
        });

      if (!requiredFieldsFilled) {
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 5000);
        return;
      }
      let updatedRating;

      if (value.some(isValue)) {
        updatedRating = prepareValueRating();

       

        if (updatedRating) {
          await api.valueRating.create(
            updatedRating,
            ratee ?? "",
            description ?? ""
          );
        }

        if (rating){
          const checkInstore = store.valueRating.getItemById(rating)?.asJson;
          if (checkInstore) {
            console.log("in store ", checkInstore);
            const updatedOldRating: IValueRating = {
              ...checkInstore,
              resubmission: "Closed",
            };
            console.log("old has been updated", updatedOldRating);
  
            await api.valueRating.update(
              updatedOldRating,
              updatedRating.rateeId,
              description
            );
  
            
          }
        }
     
        if (updatedRating && ratingAssignments !== undefined) {
          const updateAlreadyrated = updateRatedUsersPerAssignmentValues(
            me ?? "",
            ratee ?? "",
            ratingAssignments
          );
          console.log("my Already Updated values", updateAlreadyrated);
          updateRatingAssignment(updateAlreadyrated);
        }
      
        handleSuccessfulSubmission();
      } else {
        updatedRating = prepareLeadershipRating();
        await api.leadershipRating.create(
          updatedRating,
          ratee ?? "",
          description ?? ""
        );

        if (rating){
          const checkInstore = store.leadershipRating.getItemById(rating)?.asJson;
          if (checkInstore) {
            console.log("in store ", checkInstore);
            const updatedOldRating: ILeadershipRating = {
              ...checkInstore,
              resubmission: "Closed",
            };
          
  
            await api.leadershipRating.update(
              updatedOldRating,
              updatedRating.rateeId,
              description
            );
  
            
          }
        }
     
        if (updatedRating && ratingAssignments !== undefined) {
          const updateAlreadyrated = updateRatedUsersPerAssignmentLeadership(
            me ?? "",
            ratee ?? "",
            ratingAssignments
          );
         
          updateRatingAssignment(updateAlreadyrated);
        }
        handleSuccessfulSubmission();
      }
      // if (!validateDataStructure(updatedRating)) {
      //   throw new Error("Invalid data structure");
      // }
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false); // Stop loading indicator
    }
  };


  const prepareValueRating = () => {
 
      const updatedValueRating = { ...valueRating };
      updatedValueRating.date = Date.now();
      updatedValueRating.rateeId = ratee ?? "";
      updatedValueRating.dimension = "Values";
      updatedValueRating.raterId = me;
      updatedValueRating.department = user?.asJson.department ?? "";
      updatedValueRating.values = {
        [me ?? ""]: {
          ...updatedValueRating.values[me ?? ""],
          additionalComment,
          stopDoing: stopValue,
          startDoing: startValue,
          continueDoing: continueValue,
          ratings: { ...updatedValueRating.values[me ?? ""]?.ratings },
        },
      };
    

      return updatedValueRating;
  
  };

  const prepareLeadershipRating = () => {
    const updatedLeadershipRating = { ...leadershipRating };
    updatedLeadershipRating.date = Date.now();
    updatedLeadershipRating.rateeId = ratee ?? "";
    updatedLeadershipRating.dimension = "Leadership";
    updatedLeadershipRating.raterId = me;
    updatedLeadershipRating.criteria = {
      [me ?? ""]: {
        additionalComment,
        stopDoing: stopValue,
        startDoing: startValue,
        continueDoing: continueValue,
        ratings: { ...updatedLeadershipRating.criteria[me ?? ""]?.ratings },
      },
    };
    return updatedLeadershipRating;
  };

  const handleSuccessfulSubmission = () => {
    setIsCheckedMap({});
    setStopValue("");
    setStartValue("");
    setContinueValue("");
    setAdditionalComment("");
    setValueRating(defaultValueRating);
    setLeadershipRating(defaultLeadershipRating);
    // Show success modal
    showSuccessModal();
  };

  const showSuccessModal = () => {
    showModalFromId(
      MODAL_NAMES.THREE_SIXTY_FEEDBACK.SUCCESSFULLY_SUBMITTED_MODAL
    );
    setTimeout(() => {
      hideModalFromId(
        MODAL_NAMES.THREE_SIXTY_FEEDBACK.SUCCESSFULLY_SUBMITTED_MODAL
      );
    }, 3000);
  };

  const handleError = (error: any) => {
    console.error(error);
    if (error.response) {
      const statusCode = error.response.status;
      const errorMessage = error.response.data.message || "Unknown error";
      alert(`Submission failed. Error (${statusCode}): ${errorMessage}`);
    } else if (error.request) {
      alert(
        "Network error. Please check your internet connection and try again."
      );
    } else {
      // Handle other types of errors
      alert("Fill in all required fields");
    }
  };

  // Validate data structure before submission
  const validateDataStructure = (rating: IValueRating | ILeadershipRating) => {
    const defaultRating = value.some(isValue)
      ? defaultValueRating
      : defaultLeadershipRating;

    return deepCompare(defaultRating, rating);
  };

  const deepCompare = (obj1: any, obj2: any) => {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
      return false;
    }

    for (let key of keys1) {
      const val1 = obj1[key];
      const val2 = obj2[key];

      if (
        typeof val1 === "object" &&
        typeof val2 === "object" &&
        val1 !== null &&
        val2 !== null
      ) {
        if (!deepCompare(val1, val2)) {
          return false;
        }
      } else {
        if (val1 !== val2) {
          return false;
        }
      }
    }

    return true;
  };

  const handleCheckboxChange = (
    valueIndex: number,
    statementIndex: number,
    ratingIndex: number,
    isChecked: boolean
  ) => {
    setIsCheckedMap((prevState) => {
      const setKey = `${valueIndex}-${statementIndex}`;

      // Ensure that the state for the current setKey is initialized
      const newState = { ...(prevState || {}) };
      newState[setKey] = newState[setKey] || {};

      // Uncheck all checkboxes in the same statement
      for (let i = 0; i < 5; i++) {
        newState[setKey][i] = false;
      }

      // Check the clicked checkbox
      newState[setKey][ratingIndex] = isChecked;

      return newState;
    });

    const currentItem = value[valueIndex];
    if ("valueName" in currentItem) {
      // Handle the Value case
      const valueItem = currentItem as IValue;
      setValueRating((prevRating) => ({
        ...prevRating,
        values: {
          ...prevRating.values,
          [me ?? ""]: {
            additionalComment: additionalComment,
            stopDoing: stopValue,
            startDoing: startValue,
            continueDoing: continueValue,
            ratings: {
              ...prevRating.values[me ?? ""]?.ratings,
              [valueItem.valueName]: {
                ...prevRating.values[me ?? ""]?.ratings?.[valueItem.valueName],
                [valueItem.statements[statementIndex].statement]: isChecked
                  ? 5 - ratingIndex
                  : 0,
              },
            },
          },
        },
      }));
    } else {
      // Handle the Leadership case
      const leadershipItem = currentItem as ILeadership;
      setLeadershipRating((prevRating) => ({
        ...prevRating,
        criteria: {
          ...prevRating.criteria,
          [me ?? ""]: {
            // Use me?.uid as the key if available, otherwise use "default"
            additionalComment: additionalComment,
            stopDoing: stopValue,
            startDoing: startValue,
            continueDoing: continueValue,
            ratings: {
              ...prevRating.criteria[me ?? ""]?.ratings,
              [leadershipItem.criteriaName]: {
                ...prevRating.criteria[me ?? ""]?.ratings?.[
                  leadershipItem.criteriaName
                ],
                [leadershipItem.statements[statementIndex].statement]: isChecked
                  ? 5 - ratingIndex
                  : 0,
              },
            },
          },
        },
      }));
    }
  };
  useEffect(() => {
    const load = async () => {
      await api.ratingAssignments.getAll();
      await api.user.getAll();
    };
    load();
  }, [api.ratingAssignments, api.user]);

  return (
    <div>
      {value.map((item, index) => (
        <div className="blue-curved-container" key={index}>
          <div className="criteria-box">
            <div className="criteria">
              {!isValue(item) && (
                <>
                  <div className="white-strip">
                    <div className="criteria">
                      <h3>{item.criteriaName}</h3>
                    </div>
                  </div>
                  <div className="statement">
                    {(item as ILeadership).statements.map(
                      (statement, statementIndex) => (
                        <div className="statement" key={statementIndex}>
                          <p>
                            {statement.statement}
                            <span style={{ color: "red" }}>*</span>
                          </p>
                          <div className="rating-container">
                            <div className="rating">
                              {Array.from({ length: 5 }).map(
                                (_, ratingIndex) => {
                                  const setKey = `${index}-${statementIndex}`; // Generate unique key for each set
                                  const isChecked =
                                    isCheckedMap[setKey]?.[ratingIndex] ||
                                    false;
                                  return (
                                    <label
                                      key={ratingIndex}
                                      className="rating-label"
                                    >
                                      <input
                                        type="checkbox"
                                        className={`rating-checkbox ${
                                          isChecked ? "checked" : ""
                                        }`}
                                        onChange={(e) =>
                                          handleCheckboxChange(
                                            index,
                                            statementIndex,
                                            ratingIndex,
                                            e.target.checked
                                          )
                                        }
                                        checked={isChecked}
                                        value={`${ratingIndex + 1}`}
                                        required
                                      />
                                      <span className="checkbox-custom">
                                        {isChecked && (
                                          <svg
                                            viewBox="0 0 512 512"
                                            fill="currentColor"
                                            height="30px"
                                            width="30px"
                                          >
                                            <path d="M470.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L192 338.7l233.4-233.3c12.5-12.5 32.8-12.5 45.3 0z" />
                                          </svg>
                                        )}
                                      </span>
                                      {/* Rating text */}
                                      <span className="rating-text">
                                        {ratingIndex + 1}
                                      </span>

                                      {/* Rating comment */}
                                      <span className="rating-comment">
                                        {ratingIndex + 1 === 1
                                          ? "Very Bad"
                                          : ratingIndex + 1 === 2
                                          ? "Bad"
                                          : ratingIndex + 1 === 3
                                          ? "Better"
                                          : ratingIndex + 1 === 4
                                          ? "Good"
                                          : "Excellent"}
                                      </span>

                                      {/* ******************** Ratings from 5 to 1 *****************/}

                                      {/* <span className="rating-text">
                                        {5 - ratingIndex}
                                      </span>
                                      <span className="rating-comment">
                                           {5 - ratingIndex === 5 ? " Excellent"
                                          : 5 - ratingIndex === 4 ? " Good"
                                          : 5 - ratingIndex === 3 ? " Better"
                                          : 5 - ratingIndex === 2 ? " Bad"
                                          : " Very Bad"}
                                      </span> */}
                                    </label>
                                  );
                                }
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </>
              )}
              {isValue(item) && (
                <>
                  <div className="white-strip">
                    <div className="criteria">
                      <h3>{item.valueName}</h3>{" "}
                    </div>
                  </div>
                  <div className="statement">
                    {(item as IValue).statements.map(
                      (statement, statementIndex) => (
                        <div className="statement" key={statementIndex}>
                          <p>
                            {statement.statement}
                            <span style={{ color: "red" }}>*</span>
                          </p>
                          <div className="rating-container">
                            <div className="rating">
                              {Array.from({ length: 5 }).map(
                                (_, ratingIndex) => {
                                  const setKey = `${index}-${statementIndex}`; // Generate unique key for each set
                                  const isChecked =
                                    isCheckedMap[setKey]?.[ratingIndex] ||
                                    false;
                                  return (
                                    <label
                                      key={ratingIndex}
                                      className="rating-label"
                                    >
                                      <input
                                        type="checkbox"
                                        className="rating-checkbox"
                                        onChange={(e) =>
                                          handleCheckboxChange(
                                            index,
                                            statementIndex,
                                            ratingIndex,
                                            e.target.checked
                                          )
                                        }
                                        checked={isChecked}
                                        value={`${ratingIndex + 1}`}
                                        required
                                      />
                                      <span className="checkbox-custom">
                                        {isChecked && (
                                          <svg
                                            viewBox="0 0 512 512"
                                            fill="currentColor"
                                            height="30px"
                                            width="30px"
                                          >
                                            <path d="M470.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L192 338.7l233.4-233.3c12.5-12.5 32.8-12.5 45.3 0z" />
                                          </svg>
                                        )}
                                      </span>
                                      <span className="rating-text">
                                        {ratingIndex + 1}
                                      </span>
                                      {/* <span className="rating-comment">
                                      {5 - ratingIndex === 5
                                        ? " Excellent"
                                        : 5 - ratingIndex === 4
                                        ? " Good"
                                        : 5 - ratingIndex === 3
                                        ? " Better"
                                        : 5 - ratingIndex === 2
                                        ? " Bad"
                                        : " Very Bad"}
                                    </span> */}
                                      <span className="rating-comment">
                                        {ratingIndex + 1 === 1
                                          ? "Very Bad"
                                          : ratingIndex + 1 === 2
                                          ? "Bad"
                                          : ratingIndex + 1 === 3
                                          ? "Better"
                                          : ratingIndex + 1 === 4
                                          ? "Good"
                                          : "Excellent"}
                                      </span>
                                    </label>
                                  );
                                }
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
      <div className="required-inputs">
        <div className="input-group">
          <h4>
            Start <span style={{ color: "red" }}>*</span>
          </h4>
          <div className="input-container">
            <div className="blue-container">
              <div className="icon-banner">
                <IconButton data-uk-tooltip="e.g What behaviors or practices should the individual start doing to improve their performance?">
                  <InfoIcon />
                </IconButton>
              </div>
              <textarea
                className="blue-textarea"
                value={startValue}
                maxLength={200}
                onChange={(e) => setStartValue(e.target.value)}
                required
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
                <IconButton data-uk-tooltip="e.g What behaviors or practices should the individual stop doing as they hinder their performance or the team's effectiveness?">
                  <InfoIcon />
                </IconButton>
              </div>
              <textarea
                className="blue-textarea"
                value={stopValue}
                maxLength={200}
                onChange={(e) => setStopValue(e.target.value)}
                required
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
                <IconButton data-uk-tooltip="e.g What behaviors or practices should the individual continue doing as they contribute positively to their performance and the team's success?">
                  <InfoIcon />
                </IconButton>
              </div>
              <textarea
                className="blue-textarea"
                value={continueValue}
                maxLength={200}
                onChange={(e) => setContinueValue(e.target.value)}
                required
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
            ></textarea>
          </div>
        </div>
      </div>
      <button className="questionnaire-submit-button" onClick={onSubmit}>
        Submit 
      </button>
      <Modal
        modalId={MODAL_NAMES.THREE_SIXTY_FEEDBACK.SUCCESSFULLY_SUBMITTED_MODAL}
      >
        <SavedAlertModal />
      </Modal>
    </div>
  );
};
export default QuestionnaireBoxResubmission;
