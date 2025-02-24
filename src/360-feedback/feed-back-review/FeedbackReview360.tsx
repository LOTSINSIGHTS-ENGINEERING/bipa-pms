import React, { FormEvent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";


import { distributeAndSendFeedback } from "../ratings/functions";


import { useNavigate, useParams } from "react-router-dom";
import { Tab } from "../tabs/Tabs";

import "./FeedbackReview.scss";

import MODAL_NAMES from "../../logged-in/dialogs/ModalName";
import ErrorBoundary from "../../shared/components/error-boundary/ErrorBoundary";
import { useAppContext } from "../../shared/functions/Context";
import { MAIL_EMAIL } from "../../shared/functions/mailMessages";
import showModalFromId, { hideModalFromId } from "../../shared/functions/ModalShow";
import { IRateAssignment, defaultRatingAssignment, FeedbackStatus } from "../../shared/models/three-sixty-feedback-models/RateAssignments";
import { IUser } from "../../shared/models/User";
import Toolbar from "../../logged-in/shared/components/toolbar/Toolbar";
import Modal from "../../shared/components/Modal";
import { dateFormat_YY_MM_DD } from "../../logged-in/shared/utils/utils";
import EmailUsersModal from "../../logged-in/dialogs/email-all-users/EmailUsersModal";

const FeedbackReview360Copy = observer(() => {
  const { api, store } = useAppContext();
  const today = new Date().toISOString().split("T")[0]; // Get today's date in 'YYYY-MM-DD' format

  const [session, setSession] = useState<IRateAssignment>({
    ...defaultRatingAssignment,
  });
  const [loading, setLoading] = useState<Boolean>(false);
  const [activeTab, setActiveTab] = useState("midterm");
  const handleTab = (label: string) => {
    setActiveTab(label);
  };
  const navigate = useNavigate();
  const generateFeedbackLink = (raterId: string) => {
    // Generate a unique link for the ratee
    return `https://ecbdevelopment-9eafc.web.app/questionnaire/combined/${raterId}`;
    // return `http://localhost:3000/questionnaire/combined/${raterId}`;
  };
  const term = useParams();
  const termId = term.termId;
  console.log("SESSION ON LOAD", session);
  const getEmail = (raterId: string, user: IUser) => {
    let emails: string[] = [];
    if (raterId === user.uid) {
      emails.push(user.email || "");
    }
    return emails;
  };
  let processedEmails: string[] = [];
  const sendFeedbackLink = async (
    raterId: string,
    feedbackLink: string,
    users: IUser
  ) => {
    const emails = getEmail(raterId, users);

    for (const email of emails) {
      if (!processedEmails.includes(email)) {
        // Construct the email message
        const message = `Welcome to 360-Feedback! Click the following link to participate: ${feedbackLink}`;
        const subject = `ECB-360-Feedback Participation Invitation`;
        try {
          // Send the email
          console.log("Sending email to:", email);
          await api.mail.sendMail1([email], MAIL_EMAIL, subject, message);

          // Add the email to the list of processed emails
          processedEmails.push(email);
        } catch (error) {
          console.log("Error sending email:", error);
        }
      }
    }
    console.log("Proccessed", processedEmails);
  };

  const date = Date.now();

  const users = store.user.all.map((user) => {
    return user.asJson;
  });
  const usersIds = store.user.all.map((user) => {
    return user.asJson.uid;
  });

  const [submitType, setSubmitType] = useState<
    "UPDATE_SESSION" | "START_SESSION" | "END_SESSION" | "DELETE_SESSION"
  >("START_SESSION");


  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitType === "START_SESSION") {
      onStartSession();
    } else if (submitType === "END_SESSION") {
      onEndSession();
    } else if (submitType === "UPDATE_SESSION") {
      onUpdateSession();
    } else if (submitType === "DELETE_SESSION") {
      onDeleteSession();
    }
  };

  const onDeleteSession = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this session?This will also parmenantly delete the value rating nad leadership ratings"
    );
    if (!confirmDelete) {
      return; // Exit the function if the user cancels the deletion
    }

    try {
      await api.ratingAssignments.delete(session); // Update DB
      if (session.description) {
        await api.leadershipRating.deleteAllLeadershipRatings(
          usersIds,
          session.description
        );
        await api.valueRating.deleteAllValueRatings(
          usersIds,
          session.description
        );
        const templateResponse = await api.templateRating.deleteAll();
      }
    } catch (error) {
      console.log("Error deleting session:", error);
    }
  };

  const onUpdateSession = async () => {
    try {
      await api.ratingAssignments.update(session); // update db.
      store.ratingAssignments.all.map(
        (session) => session.asJson.isActive === true
      ); // set active.
    } catch (error) {
      console.log("Error starting session:", error);
    }
  };
  const sendQuestionnaire = async () => {
    setLoading(true);
    const feedbackData = await distributeAndSendFeedback(users);
    console.log("Feedback data", feedbackData);
    if (feedbackData) {
      console.log("Feedback data", feedbackData);
      setSession((prevState) => ({
        ...prevState,
        // isActive: true,
        feedbackAssignments: feedbackData,
      }));
      for (const raterId in feedbackData) {
        const rateesId = feedbackData[raterId];
        for (const rateeId of rateesId) {
          // const foundUser = users.find((user) => user.uid === raterId);
          const foundUser = users.find(
            (user) => user.uid === "RHvrsIM1OkaDyQ9biHmPI9zjU5x1"
          );
          const feedbackLink = generateFeedbackLink(raterId);
          if (foundUser)
            await sendFeedbackLink(raterId, feedbackLink, foundUser);
        }
      }
      setLoading(false);
      setTimeout(() => {
        showModalFromId(
          MODAL_NAMES.THREE_SIXTY_FEEDBACK.SUCCESSFULLY_SUBMITTED_MODAL
        );

        setTimeout(() => {
          hideModalFromId(
            MODAL_NAMES.THREE_SIXTY_FEEDBACK.SUCCESSFULLY_SUBMITTED_MODAL
          );
        }, 1000); // Adjust the delay as needed
      }, 1000);
      onCancel();
    } else {
      console.error("No feedback assignments returned.");
    }
  };
  const onCancel = () => {
    hideModalFromId(MODAL_NAMES.THREE_SIXTY_FEEDBACK.QUESTIONNAIRE_PREVIEW);
  };
  const onStartSession = async () => {
    console.log("My Session onStartnSession", session);
    if (activeTab === "midterm") {
      sendQuestionnaire();
      setSession((prevSession) => ({
        ...prevSession,
        midtermReview: {
          ...prevSession.midtermReview,
          status: "In Progress",
        },
        isActive: true,
        status: "In Progress",
      }));

      try {
        console.log("Updating Session 2024", session);
        await api.ratingAssignments.update(session);
        store.ratingAssignments.all.map(
          (session) => session.asJson.isActive === true
        ); // set active.
        showModalFromId(
          MODAL_NAMES.THREE_SIXTY_FEEDBACK.SUCCESSFULLY_SUBMITTED_MODAL
        );
        setTimeout(() => {
          hideModalFromId(
            MODAL_NAMES.THREE_SIXTY_FEEDBACK.SUCCESSFULLY_SUBMITTED_MODAL
          );
        }, 3000);
      } catch (error) {
        console.log("Error starting session:", error);
      }
    } else if (activeTab === "final") {
      //  sendQuestionnaire();
      setSession((prevSession) => ({
        ...prevSession,
        finalAssessment: {
          ...prevSession.finalAssessment,
          status: "In Progress",
        },
        isActive: true,
        status: "In Progress",
      }));

      try {
        console.log("Updating Session 2024", session);
        await api.ratingAssignments.update(session);
        store.ratingAssignments.all.map(
          (session) => session.asJson.isActive === true
        ); // set active.
        showModalFromId(
          MODAL_NAMES.THREE_SIXTY_FEEDBACK.SUCCESSFULLY_SUBMITTED_MODAL
        );
        setTimeout(() => {
          hideModalFromId(
            MODAL_NAMES.THREE_SIXTY_FEEDBACK.SUCCESSFULLY_SUBMITTED_MODAL
          );
        }, 3000);
      } catch (error) {
        console.log("Error starting session:", error);
      }
    }
  };
  const onBack = () => {
    navigate("/c/threesixty/home/feedback/reviews");
  };

  const onEndSession = async () => {
    if (activeTab === "midterm") {
      setSession((prevSession) => ({
        ...prevSession,
        midtermReview: {
          ...prevSession.midtermReview,
          status: "Completed",
        },
        isActive: false,
        status: "Completed",
      }));
      const updatedSession = {
        ...session,
        midtermReview: {
          ...session.midtermReview,
          status: "Completed" as FeedbackStatus,
        },
        isActive: false,
        status: "Completed" as FeedbackStatus,
      };
      console.log("Completed", updatedSession);
      try {
        await api.ratingAssignments.update(updatedSession);
        store.ratingAssignments.all.map(
          (session) => session.asJson.isActive === true
        );
      } catch (error) {
        console.log("Error starting session:", error);
      }
    } else if (activeTab === "final") {
      setSession((prevSession) => ({
        ...prevSession,
        finalAssessment: {
          ...prevSession.finalAssessment,
          status: "Completed",
        },
        isActive: false,
        status: "Completed",
      }));
      const updatedSession = {
        ...session,
        midtermReview: {
          ...session.finalAssessment,
          status: "Completed" as FeedbackStatus,
        },
        isActive: false,
        status: "Completed" as FeedbackStatus,
      };
      try {
        await api.ratingAssignments.update(updatedSession); // update db.
        console.log("Session Ended ", updatedSession);
        store.ratingAssignments.all.map(
          (session) => session.asJson.isActive === true
        ); // set active.
      } catch (error) {
        console.log("Error starting session:", error);
      }
    }
  };
  useEffect(() => {
    const saveRatingAssignments = async () => {
      try {
        await api.ratingAssignments.update(session);
      } catch (error) {
        console.log(error);
      }
    };

    if (
      session.status === "In Progress" &&
      Object.keys(session.feedbackAssignments).length !== 0
    ) {
      saveRatingAssignments();
    }
  }, [session]);

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedStartDate = e.target.value;

    if (selectedStartDate < today) {
      alert("Start date cannot be in the past.");
      return;
    }

    // setSession({
    //   ...session,
    //   midtermReview: {...(session.midtermReview || {}),
    //     startDate: selectedStartDate,
    //   },
    // });
    setSession({
      ...session,
      midtermReview: {
        ...(session.midtermReview || {}), // Preserve existing values
        startDate: selectedStartDate,
        status: session.midtermReview?.status || "Not Started", // Ensure 'status' is present
        endDate: session.midtermReview?.endDate ||session.midtermReview?.endDate, // Ensure 'endDate' is present
      },
    });
    
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedEndDate = e.target.value;

    if (
      session.midtermReview?.startDate &&
      selectedEndDate <= session.midtermReview.startDate
    ) {
      alert("End date cannot be earlier or equal the start date.");
      return;
    }

    setSession({
      ...session,
      midtermReview: {
        ...session.midtermReview,
        endDate: selectedEndDate,
      },
    });
  };
  useEffect(() => {
    const load = async () => {
      try {
        await api.user.getAll();
        await api.ratingAssignments.getAll();

        const assignments = store.ratingAssignments.all.find(
          (s) => s.asJson.id === termId
        );
        if (assignments !== undefined) {
          setSession(assignments.asJson);
        }
      } catch (error) {
        console.log("Error loading data:", error);
        // Handle error as needed
      }
    };

    load();

    return () => {
      // Clean up if necessary
    };
  }, [termId]);

  return (
    <ErrorBoundary>
      <Toolbar
        leftControls={
          <div style={{ marginLeft: "2.5rem" }}>
            <Tab
              label="Midterm Review"
              isActive={activeTab === "midterm"}
              onClick={() => handleTab("midterm")}
            />
            <Tab
              label="Final Assessment"
              isActive={activeTab === "final"}
              onClick={() => handleTab("final")}
            />
          </div>
        }
        rightControls={
          <div style={{ marginRight: "2.5rem" }}>
            <button className="feedback-button" onClick={onBack}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path d="M21 11H6.414l5.293-5.293-1.414-1.414L2.586 12l7.707 7.707 1.414-1.414L6.414 13H21z"></path>
              </svg>
              Back
            </button>
          </div>
        }
      ></Toolbar>

      <div
        className="uk-container uk-container-large uk-card uk-card-default"
        style={{ width: "94%" }}
      >
        {activeTab === "midterm" && (
          <div className="midterm-view ">
            <form
              className="review-info"
              onSubmit={onSubmit}
              style={{
                width: "80%",
                justifyContent: "center",
                marginTop: "1rem",
                marginLeft: "4rem",
              }}
            >
              <h3 className="title">
                Date &#38; Status Settings for Feedback Midterm Review
              </h3>
              <div className="uk-grid-small" data-uk-grid>
                {/* <div className="uk-width-1-2@s uk-width-1-4@m">
                  <div>
                    <label className="uk-form-label" htmlFor="user-fname">
                      New Start Date
                    </label>
                    <div className="uk-form-controls">
                      <input
                        className="uk-input uk-form-small"
                        type="date"
                        name="startDate"
                        value={session.midtermReview?.startDate || ""}
                        onChange={(e) =>
                          setSession({
                            ...(session || {}),
                            midtermReview: {
                              ...session.midtermReview,
                              startDate: e.target.value,
                            },
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="uk-width-1-2@s uk-width-1-3@m">
                  <div>
                    <label className="uk-form-label" htmlFor="user-fname">
                      New End Date
                    </label>
                    <div className="uk-form-controls">
                      <input
                        className="uk-input uk-form-small"
                        type="date"
                        name="endDate"
                        value={session.midtermReview?.endDate || ""}
                        onChange={(e) =>
                          setSession({
                            ...session,
                            midtermReview: {
                              ...(session.midtermReview || {}),
                              endDate: e.target.value,
                            },
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                </div> */}

                <div className="uk-width-1-2@s uk-width-1-4@m">
                  <div>
                    <label className="uk-form-label" htmlFor="user-fname">
                      New Start Date
                    </label>
                    <div className="uk-form-controls">
                      <input
                        className="uk-input uk-form-small"
                        type="date"
                        name="startDate"
                        value={session.midtermReview?.startDate || ""}
                        onChange={handleStartDateChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="uk-width-1-2@s uk-width-1-3@m">
                  <div>
                    <label className="uk-form-label" htmlFor="user-fname">
                      New End Date
                    </label>
                    <div className="uk-form-controls">
                      <input
                        className="uk-input uk-form-small"
                        type="date"
                        name="endDate"
                        value={session.midtermReview?.endDate || ""}
                        onChange={handleEndDateChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="uk-width-1-2@s uk-width-1-4@m">
                  <div>
                    <label className="uk-form-label" htmlFor="user-status">
                      New Status
                    </label>
                    <div className="uk-form-controls">
                      <select
                        className="uk-select uk-form-small"
                        name="status"
                        value={session?.status || ""}
                        onChange={(e) =>
                          setSession({
                            ...session,
                            midtermReview: {
                              ...session.midtermReview,
                              status: e.target.value as FeedbackStatus,
                            },
                          })
                        }
                        disabled
                      >
                        <option value={"In Progress"}>In Progress</option>
                        <option value={"Not Started"}>Not Started</option>
                        <option value={"Completed"}>Completed</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="uk-text-right uk-margin">
                <>
                  {session?.midtermReview?.status === "Not Started" && (
                    <button
                      className="btn btn-primary uk-margin-right"
                      type="submit"
                      style={{ width: "200px", padding: "10px 20px" }}
                      onClick={() => setSubmitType("START_SESSION")}
                    >
                      Start Session
                    </button>
                  )}
                  {session?.midtermReview?.status === "In Progress" && (
                    <button
                      className="btn btn-primary uk-margin-right"
                      type="submit"
                      style={{ width: "200px", padding: "10px 20px" }}
                      onClick={() => setSubmitType("UPDATE_SESSION")}
                    >
                      Update Session
                    </button>
                  )}
                  <button
                    className="btn btn-danger uk-margin-right"
                    type="submit"
                    style={{ width: "200px", padding: "10px 20px" }}
                    disabled={session?.midtermReview?.status === "Not Started"}
                    onClick={() => setSubmitType("END_SESSION")}
                  >
                    End Session
                  </button>
                  <button
                    className="btn btn-danger"
                    type="submit"
                    style={{ width: "200px", padding: "10px 20px" }}
                    disabled={session?.midtermReview?.status === "Not Started"}
                    onClick={() => setSubmitType("DELETE_SESSION")}
                  >
                    Delete Session
                  </button>
                </>
              </div>
            </form>
          </div>
        )}
        {activeTab === "final" && (
          <form
            className="review-info uk-card uk-card-default uk-card-body uk-card-small"
            onSubmit={onSubmit}
            style={{
              width: "80%",
              justifyContent: "center",
              marginTop: "1rem",
              marginLeft: "4rem",
            }}
          >
            <h3 className="title">
              Date &#38; Status Settings for Feedback Final Assessment
            </h3>
            <div className="uk-grid-small" data-uk-grid>
              <div className="uk-width-1-2@s uk-width-1-4@m">
                <div>
                  <label className="uk-form-label" htmlFor="user-fname">
                    New Start Date
                  </label>
                  <div className="uk-form-controls">
                    <input
                      className="uk-input uk-form-small"
                      type="date"
                      name="startDate"
                      value={session?.finalAssessment?.startDate || ""}
                      onChange={(e) =>
                        setSession({
                          ...session ,
                          finalAssessment: {
                            ...session.finalAssessment,
                            startDate: e.target.value,
                          },
                        })
                      }
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="uk-width-1-2@s uk-width-1-3@m">
                <div>
                  <label className="uk-form-label" htmlFor="user-fname">
                    New End Date
                  </label>
                  <div className="uk-form-controls">
                    <input
                      className="uk-input uk-form-small"
                      type="date"
                      name="endDate"
                      value={session?.finalAssessment?.endDate || ""}
                      onChange={(e) =>
                        setSession({
                          ...session ,
                          finalAssessment: {
                            ...session.finalAssessment,
                            endDate: e.target.value,
                          },
                        })
                      }
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="uk-width-1-2@s uk-width-1-4@m">
                <div>
                  <label className="uk-form-label" htmlFor="user-status">
                    New Status
                  </label>
                  <div className="uk-form-controls">
                    <select
                      className="uk-select uk-form-small"
                      name="status"
                      value={session?.status || ""}
                      onChange={(e) =>
                        setSession({
                          ...session,
                          status: e.target.value as FeedbackStatus,
                        })
                      }
                      disabled
                    >
                      <option value={"In Progress"}>In Progress</option>
                      <option value={"Not Started"}>Not Started</option>
                      <option value={"Completed"}>Completed</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="uk-text-right uk-margin">
              <>
                <button
                  className="btn btn-primary uk-margin-right"
                  type="submit"
                  disabled={!("In Progress" === session?.status)}
                  onClick={() => setSubmitType("START_SESSION")}
                >
                  Start Session
                </button>
                <button
                  className="btn btn-primary uk-margin-right"
                  type="submit"
                  disabled={"In Progress" === session?.status}
                  onClick={() => setSubmitType("UPDATE_SESSION")}
                >
                  Update Session
                </button>
                <button
                  className="btn btn-danger"
                  type="submit"
                  disabled={"In Progress" === session?.status}
                  onClick={() => setSubmitType("END_SESSION")}
                >
                  End Session
                </button>
              </>
            </div>
          </form>
        )}
      </div>
      <Modal modalId={MODAL_NAMES.PERFORMANCE_REVIEW.MAIL_ALL_EMPLOYEES_MODAL}>
        <EmailUsersModal />
      </Modal>
    </ErrorBoundary>
  );
});

export default FeedbackReview360Copy;
