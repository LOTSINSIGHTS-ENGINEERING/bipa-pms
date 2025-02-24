import React, { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useAppContext } from "../../../shared/functions/Context";
import { IRatingSession } from "../../../shared/models/three-sixty-feedback-models/RatingSession";
import {
  ITemplates,
  defaultTemplate,
} from "../../../shared/models/three-sixty-feedback-models/Templates";

const RateeView: React.FC = observer(() => {
  const { api, store } = useAppContext();
  const [sessions, setSessions] = useState<IRatingSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [session, setSession] = useState<IRatingSession | null>(null);
  const [template, setTemplate] = useState<ITemplates>(defaultTemplate);

  const me = store.auth.meJson?.uid;
  const allSessions = store.ratingSession.all.map((session) => session.asJson);
  const rateeSessions = allSessions.filter((s) => s.raterId === me);

  useEffect(() => {
    const fetchData = async () => {
      await api.ratingSession.getAll();
      await api.template.getAll();
      await api.user.getAll();
    };
    fetchData();
  }, [api]);

  const handleSessionClick = async (sessionId: string) => {
    const selectedSession = allSessions.find(
      (session) => session.id === sessionId
    );
    setSession(selectedSession || null);

    if (selectedSession) {
      const templateId = selectedSession.templateId;
      const allTemplates = store.templates.all.map((temp) => temp.asJson);
      const foundTemplate = allTemplates.find((t) => t.id === templateId);
      setTemplate(foundTemplate || defaultTemplate);
    } else {
      setTemplate(defaultTemplate);
    }

    setSelectedSessionId(sessionId);
  };

  const handleRatingChange = (questionId: string, rating: number) => {
    if (session) {
      const updatedAnswers = session.answers.map((answer) =>
        answer.questionId === questionId ? { ...answer, rating } : answer
      );
      if (!session.answers.some((answer) => answer.questionId === questionId)) {
        updatedAnswers.push({ questionId, rating });
      }
      setSession({ ...session, answers: updatedAnswers });
    }
  };

  const handleSaveRatings = async () => {
    if (session) {
      await api.ratingSession.update({ ...session, status: "Completed" });
      alert("Ratings submitted successfully.");
    }
  };

  return (
    <div>
      <h1>Ratee View</h1>
      <div>
        <h2>Select Session</h2>
        <ul>
          {rateeSessions.map((session) => (
            <li key={session.id} onClick={() => handleSessionClick(session.id)}>
              {session.id}
            </li>
          ))}
        </ul>
      </div>
      {session && template && (
        <>
          <h2>{template.title}</h2>
          {template.statements.map((question) => {
            const answer = session.answers.find(
              (a) => a.questionId === question.id
            );
            return (
              <div key={question.id} className="blue-curved-container">
                <div className="criteria-box">
                  <div className="criteria">
                    <div className="white-strip">
                      <div className="criteria">
                      
                      </div>
                    </div>
                    <div className="statement">
                      <p>
                        {question.statement}{" "}
                        <span style={{ color: "red" }}>*</span>
                      </p>
                      <div className="rating-container">
                        <div className="rating">
                          {Array.from({ length: 5 }).map((_, ratingIndex) => {
                            const ratingValue = 5 - ratingIndex;
                            return (
                              <label key={ratingIndex} className="rating-label">
                                <input
                                  type="checkbox"
                                  className="rating-checkbox"
                                  value={ratingValue}
                                  checked={
                                    answer
                                      ? answer.rating === ratingValue
                                      : false
                                  }
                                  onChange={(e) =>
                                    handleRatingChange(
                                      question.id,
                                      parseInt(e.target.value, 10)
                                    )
                                  }
                                />
                                <span className="rating-text">
                                  {ratingValue}
                                </span>
                                <span className="rating-comment">
                                        {ratingIndex + 1 === 1 ? "Very Bad"
                                        : ratingIndex + 1 === 2 ? "Bad"
                                        : ratingIndex + 1 === 3 ? "Better"
                                        : ratingIndex + 1 === 4 ? "Good"
                                        : "Excellent"}
                                      </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <button
            onClick={handleSaveRatings}
            className="questionnaire-submit-button">
            Submit Ratings
          </button>
        </>
      )}
    </div>
  );
});

export default RateeView;
