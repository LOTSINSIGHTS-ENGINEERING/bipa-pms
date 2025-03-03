import React, { useState, useEffect, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { useAppContext } from "../../shared/functions/Context";
import { ITemplateRating, defaultTemplateRating } from "../../shared/models/three-sixty-feedback-models/TemplateRating";
import SingleSelect, { IOption } from "../communication/single-select/SlingleSelect";


const RequestRating: React.FC = observer(() => {
  const { api, store } = useAppContext();
  const [rateeId, setRateeId] = useState("");
  const [selectedRaterId, setSelectedRaterId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [session, setSession] = useState<ITemplateRating>({
    ...defaultTemplateRating,
  });
  const [raters, setRaters] = useState<string[]>([]);
  const me = store.auth.meJson?.uid;
  const users = store.user.all;
  const templateRatings = store.templateRating.all.map((session) => session.asJson);
  const allTemplates = store.templates.all.map((template) => template.asJson);
  useEffect(() => {
    const fetchRaters = async () => {
      await api.user.getAll();
    };
    fetchRaters();
    api.template.getAll();
    api.templateRating.getAll();
  }, [api]);
  const myCompletedSessions = templateRatings.filter(
    (session) => session.rateeId === me && session.status === "Completed"
  );
  const usersOptions: IOption[] = useMemo(
    () =>
      users.map((user) => ({
        label: user.asJson.displayName || "",
        value: user.asJson.uid,
      })),
    [users]
  );
  const templatesOptions: IOption[] = useMemo(
    () =>
      allTemplates.map((template) => ({
        label: template.title,
        value: template.id,
      })),
    [allTemplates]
  );
  const handleChangeRater = (value: string) => {
    setSelectedRaterId(value);
  };
  const handleChangeTemplate = (value: string) => {
    setTemplateId(value);
  };
  const handleRequestRating = async () => {
    if (me && selectedRaterId && templateId) {
      const newSession: ITemplateRating = {
        ...session,
        rateeId: me || "",
        raterId: selectedRaterId,
        templateId: templateId,
        status: "Not Started",
        values:{
          [me ?? ""]: {
        ...session.values[me ?? ""],
        additionalComment:"",
        stopDoing: "",
        startDoing: "",
        continueDoing: "",
        ratings: { ...session.values[me ?? ""]?.ratings },
      },
        }
       
      };
      await api.templateRating.create(newSession,me);
    } else {
      alert("Please fill in all fields.");
    }
  };
  return (
    <div>
      <h1>Request Rating</h1>
      <div className="uk-form-controls">
        <SingleSelect
          name="rater"
          options={usersOptions}
          onChange={handleChangeRater}
          width="200px"
          placeholder="Select Rater"
          value={selectedRaterId}
          required
        />
      </div>
      <SingleSelect
        name="template"
        options={templatesOptions}
        onChange={handleChangeTemplate}
        width="200px"
        placeholder="Select Template"
        value={templateId}
        required
      />
      <button onClick={handleRequestRating}>Request Rating</button>

      <div>
        <h2>Completed Ratings</h2>
        <ul>
          {myCompletedSessions.map((session) => {
            const template = allTemplates.find(
              (t) => t.id === session.templateId
            );
            return (
              <li key={session.id}>
                <div>Session ID: {session.id}</div>
                <div>Rater ID: {session.raterId}</div>
                <div>Template ID: {session.templateId}</div>
                <div>Status: {session.status}</div>
                {template ? (
                  <ul>
                    {/* {template.questions.map((question: { id: React.Key | null | undefined; text: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; }) => {
                      const answer = session.answers.find(
                        (a) => a.questionId === question.id
                      );
                      return (
                        <li key={question.id}>
                          <div>Question: {question.text}</div>
                          <div>
                            Answer: {answer ? answer.rating : "No answer"}
                          </div>
                        </li>
                      );
                    })} */}
                  </ul>
                ) : (
                  <div>Template not found</div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
});

export default RequestRating;
