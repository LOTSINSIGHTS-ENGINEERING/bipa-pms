import React, { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";

import "./UserQuestionnaireBox.scss";
import IconButton from "@mui/material/IconButton";
import InfoIcon from "@mui/icons-material/Info";

import SavedAlertModal from "../../shared-components/SavedAlertModal";

import { useNavigate } from "react-router-dom";

import MODAL_NAMES from "../../../logged-in/dialogs/ModalName";
import { LoadingEllipsis } from "../../../shared/components/loading/Loading";
import { useAppContext } from "../../../shared/functions/Context";
import showModalFromId from "../../../shared/functions/ModalShow";
import { RatingStatus } from "../../../shared/models/three-sixty-feedback-models/CommitteeRating";
import { ITemplateRating } from "../../../shared/models/three-sixty-feedback-models/TemplateRating";
import { ITemplates, defaultTemplate } from "../../../shared/models/three-sixty-feedback-models/Templates";
import Modal from "../../../shared/components/Modal";

const TemplateQuestionnaireBox: React.FC = observer(() => {
  const { api, store } = useAppContext();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<ITemplateRating[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [session, setSession] = useState<ITemplateRating | null>(null);
  const [startValue, setStartValue] = useState("");
  const [stopValue, setStopValue] = useState("");
  const [template, setTemplate] = useState<ITemplates>(defaultTemplate);
  const [showNotification, setShowNotification] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [additionalComment, setAdditionalComment] = useState("");
  const [continueValue, setContinueValue] = useState("");
  const me = store.auth.meJson?.uid;
  const allSessions = store.templateRating.all.map((session) => session.asJson);
  const rateeSessions = allSessions.filter((s) => s.raterId === me);
  const [isCheckedMap, setIsCheckedMap] = useState<
    Record<string, Record<number, boolean>>
  >({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); // Start loading
        await api.templateRating.getAll();
        await api.template.getAll();
        await api.user.getAll();
      } catch (error) {
        console.error("Error fetching data:", error);
        // Optionally set an error state here to display an error message
      } finally {
        setLoading(false); // Stop loading
      }
    };
    fetchData();
  }, [api]);
  
  useEffect(() => {
    if (store.templateRating.selected) {
      const selectedSession = store.templateRating.selected;
      setSession(selectedSession);
      if (selectedSession) {
        handleSessionClick(selectedSession.id);
      }
    }
  }, [store.templateRating.selected]);

  const updateCheckedMapFromSession = (selectedSession: ITemplateRating | null) => {
    if (selectedSession) {
      const newCheckedMap: Record<string, Record<number, boolean>> = {};
      const raterId = me ?? "";
      const ratings = selectedSession.values[raterId]?.ratings;

      if (ratings) {
        Object.entries(ratings[template.title] || {}).forEach(([statement, score]) => {
          const statementIndex = template.statements.findIndex(s => s.statement === statement);
          if (statementIndex !== -1) {
            const ratingIndex = 5 - score;
            newCheckedMap[statementIndex] = { [ratingIndex]: true };
          }
        });
      }

      setIsCheckedMap(newCheckedMap);
    }
  };

  const handleSessionClick = async (sessionId: string) => {
    const selectedSession = allSessions.find(
      (session) => session.id === sessionId
    );
    if (selectedSession) {
      const templateId = selectedSession.templateId;
      const allTemplates = store.templates.all.map((temp) => temp.asJson);
      const foundTemplate = allTemplates.find((t) => t.id === templateId);
      setTemplate(foundTemplate || defaultTemplate);
      setSession(selectedSession);

      // Set startValue, stopValue, continueValue, and additionalComment
      if (selectedSession.values[me ?? ""]) {
        setStartValue(selectedSession.values[me ?? ""].startDoing || "");
        setStopValue(selectedSession.values[me ?? ""].stopDoing || "");
        setContinueValue(selectedSession.values[me ?? ""].continueDoing || "");
        setAdditionalComment(
          selectedSession.values[me ?? ""].additionalComment || ""
        );
      } else {
        setStartValue("");
        setStopValue("");
        setContinueValue("");
        setAdditionalComment("");
      }

      updateCheckedMapFromSession(selectedSession);
    } else {
      setTemplate(defaultTemplate);
      setStartValue("");
      setStopValue("");
      setContinueValue("");
      setAdditionalComment("");
    }

    setSelectedSessionId(sessionId);
  };

  const handleCheckboxChange = (
    statementIndex: number,
    ratingIndex: number,
    isChecked: boolean
  ) => {
    setIsCheckedMap((prevState) => {
      const newState = { ...(prevState || {}) };
      newState[statementIndex] = { [ratingIndex]: isChecked };

      if (session) {
        const updatedSession = { ...session };
        const ratingValue = ratingIndex + 1;
        const statementText = template.statements[statementIndex].statement;

        if (!updatedSession.values[me ?? ""]) {
          updatedSession.values[me ?? ""] = {
            additionalComment: "",
            stopDoing: "",
            startDoing: "",
            continueDoing: "",
            ratings: {},
          };
        }

        if (!updatedSession.values[me ?? ""].ratings[template.title]) {
          updatedSession.values[me ?? ""].ratings[template.title] = {};
        }

        if (isChecked) {
          updatedSession.values[me ?? ""].ratings[template.title][statementText] = ratingValue;
        } else {
          delete updatedSession.values[me ?? ""].ratings[template.title][statementText];
        }

        setSession(updatedSession);
      }

      return newState;
    });
  };

//   const handleSaveRatings = async () => {
//     console.log("Starting handleSaveRatings...");

 
// if (!startValue || !stopValue || !continueValue) {
//   setShowNotification(true);
//   return;
// }

// // Validate checkbox selections
// let allChecked = true;
// template.statements.forEach((statement, statementIndex) => {
//   const isChecked = Object.values(isCheckedMap[statementIndex] || {}).some(isChecked => isChecked);
//   if (!isChecked) {
//     allChecked = false;
//   }
// });

// if (!allChecked) {
//   setShowNotification(true);
//   return;
// }

//     // setShowNotification(false);
//     console.log("All validations passed.");
// console.log("my session",session);

//     if (session) {
//       const updatedSession = { ...session };

//       if (!updatedSession.values[me ?? ""]) {
//         updatedSession.values[me ?? ""] = {
//           additionalComment: "",
//           stopDoing: "",
//           startDoing: "",
//           continueDoing: "",
//           ratings: {},
//         };
//       }

//       updatedSession.values[me ?? ""] = {
//         ...updatedSession.values[me ?? ""],
//         startDoing: startValue,
//         stopDoing: stopValue,
//         continueDoing: continueValue,
//         additionalComment: additionalComment,
//       };

//       console.log("Updated session: ", updatedSession);

//       setSession(updatedSession);
//       await api.templateRating.update({
//         ...updatedSession,
//         status: "Completed",
//       });

//       console.log("Ratings submitted successfully.");
//       showModalFromId(MODAL_NAMES.THREE_SIXTY_FEEDBACK.SUCCESSFULLY_SUBMITTED_MODAL);
//       navigate(`/c/threesixty/home/overview?tab=surveys-requests`);
//     }
//   };

// const handleSaveRatings = async () => {
//   console.log("Starting handleSaveRatings...");

//   // Validate required text areas for Start, Stop, and Continue inputs
//   if (!startValue || !stopValue || !continueValue) {
//     setShowNotification(true);
//     return;
//   }

//   // Validate checkbox selections for each statement
//   let allChecked = true; // Assume all statements are checked
//   let missingStatements: number[] = []; // Track which statements are missing

//   template.statements.forEach((statement, statementIndex) => {
//     // Check if any checkbox in the statement's row is selected
//     const isChecked = Object.values(isCheckedMap[statementIndex] || {}).some(
//       (checked) => checked
//     );

//     if (!isChecked) {
//       allChecked = false;
//       missingStatements.push(statementIndex); // Track the index of missing statements
//     }
//   });

//   // If any statement is missing a checkbox selection, show an error notification
//   if (!allChecked) {
//     setShowNotification(true);
//     console.log("Missing checkbox selections for statements:", missingStatements);
//     return;
//   }

//   console.log("All validations passed.");

//   if (session) {
//     const updatedSession : ITemplateRating = { ...session };

//     if (!updatedSession.values[me ?? ""]) {
//       updatedSession.values[me ?? ""] = {
//         additionalComment: "",
//         stopDoing: "",
//         startDoing: "",
//         continueDoing: "",
//         ratings: {},
//       };
//     }

//     // Update session with the current text area values
//     updatedSession.values[me ?? ""] = {
//       ...updatedSession.values[me ?? ""],
//       startDoing: startValue,
//       stopDoing: stopValue,
//       continueDoing: continueValue,
//       additionalComment: additionalComment,
//     };

//     console.log("Updated session: ", updatedSession);

//     setSession(updatedSession);
//     await api.templateRating.update({
//       ...updatedSession,
//       status: "Completed",
//     });

//     console.log("Ratings submitted successfully.");
//     showModalFromId(MODAL_NAMES.THREE_SIXTY_FEEDBACK.SUCCESSFULLY_SUBMITTED_MODAL);
//     navigate(`/c/threesixty/home/overview?tab=surveys-requests`);
//   }
// };

const handleSaveRatings = async () => {
  console.log("Starting handleSaveRatings...");

  // Validate required text areas for Start, Stop, and Continue inputs
  if (!startValue || !stopValue || !continueValue) {
    setShowNotification(true);
    return;
  }

  // Validate ratings for each statement
  let allStatementsRated = true; // Assume all statements are rated
  let missingStatements: number[] = []; // Track which statement indices are missing ratings

  // Check if session and template exist
  if (session && template) {
    const raterId = me ?? ""; // Get the rater's ID
    const currentValues = session.values[raterId]?.ratings[template.title] || {};

    // Manually loop through each statement in the template
    template.statements.forEach((statement, statementIndex) => {
      const statementText = statement.statement;

      // Check if the current statement has a corresponding rating value in the session
      if (!(statementText in currentValues) || currentValues[statementText] === undefined) {
        allStatementsRated = false;
        missingStatements.push(statementIndex); // Track the index of missing statements
      }
    });

    // If any statement is missing a rating value, show an error notification
    if (!allStatementsRated) {
      setShowNotification(true);
      console.log("Missing ratings for statements:", missingStatements);
      return;
    }

    console.log("All statements have ratings.");
  } else {
    console.log("Session or Template is missing.");
    return;
  }

  // All validations passed, update the session with the ratings
  if (session) {
    const updatedSession: ITemplateRating = { ...session };
    const raterId = me ?? "";

    // Check if this rater already has values set, if not, initialize the structure
    if (!updatedSession.values[raterId]) {
      updatedSession.values[raterId] = {
        additionalComment: "",
        stopDoing: "",
        startDoing: "",
        continueDoing: "",
        ratings: {},
      };
    }

    // Ensure ratings are initialized for the template title
    if (!updatedSession.values[raterId].ratings[template.title]) {
      updatedSession.values[raterId].ratings[template.title] = {};
    }

    // Update the ratings based on current selections
    template.statements.forEach((statement) => {
      const statementText = statement.statement;

      // If a rating exists in the session, retain it; otherwise, add a default value (if needed)
      // if (!(statementText in updatedSession.values[raterId].ratings[template.title])) {
      //   updatedSession.values[raterId].ratings[template.title][statementText] = 3; // Default rating if needed
      // }
    });

    // Update session with the current text area values
    updatedSession.values[raterId] = {
      ...updatedSession.values[raterId],
      startDoing: startValue,
      stopDoing: stopValue,
      continueDoing: continueValue,
      additionalComment: additionalComment,
    };

    console.log("Updated session: ", updatedSession);

    // Save the session to the state and to the API
    setSession(updatedSession);
    await api.templateRating.update({
      ...updatedSession,
      status: "Completed",
    });

    console.log("Ratings submitted successfully.");
    showModalFromId(MODAL_NAMES.THREE_SIXTY_FEEDBACK.SUCCESSFULLY_SUBMITTED_MODAL);
    navigate(`/c/threesixty/home/overview?tab=surveys-requests`);
  }
};

  const onBack = async () => {
    if (session && session.status === "Completed") {
      navigate(`/c/threesixty/home/overview?tab=surveys-requests`);
    } else if (session) {
      const updatedSession = { ...session };

      if (!updatedSession.values[me ?? ""]) {
        updatedSession.values[me ?? ""] = {
          additionalComment: "",
          stopDoing: "",
          startDoing: "",
          continueDoing: "",
          ratings: {},
        };
      }
      updatedSession.values[me ?? ""] = {
        ...updatedSession.values[me ?? ""],
        startDoing: startValue,
        stopDoing: stopValue,
        continueDoing: continueValue,
        additionalComment: additionalComment,
      };
      console.log("Updated session: ", updatedSession);
      // Update the session state before making the API call
      setSession(updatedSession);
      await api.templateRating.update({
        ...session,
        status: "In Progress" as RatingStatus,
      });
      navigate(`/c/threesixty/home/overview?tab=surveys-requests`);
    }
  };

  return (
    <div>
      {session && template && (
        <>
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
                    <p>
                      {statement.statement}
                      <span style={{ color: "red" }}>*</span>
                    </p>
                    <div className="rating-container">
                      <div className="rating">
                        {Array.from({ length: 5 }).map((_, ratingIndex) => {
                          const setKey = `${statementIndex}`;
                          const isChecked =
                            session?.values[me ?? ""]?.ratings[
                              template.title
                            ]?.[statement.statement] ===
                            ratingIndex + 1;
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
                                    statementIndex,
                                    ratingIndex,
                                    e.target.checked
                                  )
                                }
                                checked={isChecked}
                                value={`${ratingIndex + 1}`}
                                required
                                disabled={session?.status === "Completed"}
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
                                        {ratingIndex + 1 === 1 ? "Very Bad"
                                        : ratingIndex + 1 === 2 ? "Bad"
                                        : ratingIndex + 1 === 3 ? "Better"
                                        : ratingIndex + 1 === 4 ? "Good"
                                        : "Excellent"}
                                      </span>
                              {/* Rating comment */}
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
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="required-inputs">
          <div className="input-group">
            <h4>
              Start <span style={{ color: "red" }}>*</span>
            </h4>
            <div className="input-container">
              <div className="icon-banner">
                <IconButton data-uk-tooltip="e.g What behaviors or practices should the individual start doing to improve their performance?">
                  <InfoIcon />
                </IconButton>
              </div>
              <textarea
                className="blue-textarea"
                value= {startValue}
                maxLength={400}
                onChange={(e) => setStartValue(e.target.value)}
                required
                disabled={session?.status === "Completed"}
              ></textarea>
            </div>
          </div>
          <div className="input-group">
            <h4>
              Stop <span style={{ color: "red" }}>*</span>
            </h4>
            <div className="input-container">
              <div className="icon-banner">
                <IconButton data-uk-tooltip="e.g What behaviors or practices should the individual stop doing as they hinder their performance or the team's effectiveness?">
                  <InfoIcon />
                </IconButton>
              </div>
              <textarea
                className="blue-textarea"
                value={stopValue}
                maxLength={400}
                onChange={(e) => setStopValue(e.target.value)}
                required
                disabled={session?.status === "Completed"}
              ></textarea>
            </div>
          </div>
          <div className="input-group">
            <h4>
              Continue <span style={{ color: "red" }}>*</span>
            </h4>
            <div className="input-container">
              <div className="icon-banner">
                <IconButton data-uk-tooltip="e.g What behaviors or practices should the individual continue doing as they contribute positively to their performance and the team's success?">
                  <InfoIcon />
                </IconButton>
              </div>
              {session?.status === "Completed" ? (
                <div className="blue-textarea static-textarea">
                  {continueValue}
                </div>
              ) : (
                <textarea
                  className="blue-textarea"
                  value={continueValue
                  }
                  maxLength={400}
                  onChange={(e) => setContinueValue(e.target.value)}
                  required
                ></textarea>
              )}
            </div>
          </div>
        </div>

        {showNotification && (
          <span className="notification" style={{ color: "red" }}>
            Please fill in all required fields and select exactly one checkbox
            for each statement.
          </span>
        )}

        <div className="input-group2">
          <h4>Additional Comments</h4>
          <div className="input-container" style={{ width: "80%" }}>
            <textarea
              className="blue-textarea"
              placeholder=""
              value={
                session?.values[me ?? ""]?.additionalComment ||
                additionalComment
              }
              maxLength={200}
              rows={4}
              onChange={(e) => setAdditionalComment(e.target.value)}
              disabled={session?.status === "Completed"}
            ></textarea>
          </div>
        </div>
        <button
          onClick={handleSaveRatings}
          style={{ marginRight: "1rem" }}
          className="questionnaire-submit-button"
          disabled={session?.status === "Completed"}
        >
          Submit Ratings
        </button>
        <button className="questionnaire-back-button" onClick={onBack}>
          Back {loading && <LoadingEllipsis />}
        </button>
      </>
    )}
    <Modal
      modalId={MODAL_NAMES.THREE_SIXTY_FEEDBACK.SUCCESSFULLY_SUBMITTED_MODAL}>
      <SavedAlertModal />
    </Modal>
  </div>
);
});

export default TemplateQuestionnaireBox;
