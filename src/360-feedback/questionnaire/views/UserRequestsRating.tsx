import { useState, useEffect} from "react";
import "react-datepicker/dist/react-datepicker.css";
import "../components/Templates.scss";

import { useParams, useNavigate } from "react-router-dom";


import TemplateQuestionnaireBox from "../components/TemplateQuestionnaireBox";
import { useAppContext } from "../../../shared/functions/Context";
import { ITemplates } from "../../../shared/models/three-sixty-feedback-models/Templates";
import { IUser } from "../../../shared/models/User";

export default function UserRequestsRating() {
  const navigate = useNavigate();
  const { api, store } = useAppContext();
  const { rateeId, sessionId } = useParams();
  const me = store.auth.meJson;
 
  const [initials, setInitials] = useState<string>("");
  const [userData, setUserData] = useState<IUser | null>(null);
  const [template, setTemplate] = useState<ITemplates[]>([]);
  const ratingSession = store.templateRating.all.find(
    (s) => s.asJson.templateId === sessionId
  )?.asJson;

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          api.user.getAll(),
          api.template.getAll(),
          api.department.getAll(),
          api.templateRating.getAll(),
        ]);

        const foundUser = store.user.all.find(
          (user) => user.asJson.uid === rateeId
        );
        const userData = foundUser ? foundUser.asJson : null;
        setUserData(userData);
        const templates = store.templates.all
          .filter((r) => r.asJson.id === ratingSession?.templateId)
          .map((r) => r.asJson as ITemplates);
        setTemplate(templates);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [api, store, rateeId, sessionId]);

  useEffect(() => {
    if (userData) {
      const name = userData.displayName || " ";
      const calculatedInitials = name
        .split(" ")
        .map((name) => name[0])
        .join("");
      setInitials(calculatedInitials);
    }
  }, [userData]);

  const getDepartmentName = (depId: string): string => {
    const department = store.department.all.find(
      (dep) => dep.asJson.id === depId
    )?.asJson;
    return department ? department.name || "" : "";
  };

  return (
    <div className="value-page">
      
      <div className="user-rating-container">
        <div className="user-block">
          {/* <h3>
            Hi <span>{me?.displayName}</span>, You are about to rate{" "}
            <span>{userData?.displayName}</span> on{" "}
            {template.map((t) => t.title).join(", ")}
          </h3> */}
          {userData && (
            <div className="user-information">
              <div className="image">
                <h2 className="avatar-initials">{initials}</h2>
              </div>
              <div className="user-detail-block">
                <p>You are rating</p>
                <h4>{userData.displayName}</h4>
              </div>
              <div className="user-detail-block">
                <p>Department</p>
                <h4>{getDepartmentName(userData.department)}</h4>
              </div>
              <div className="user-detail-block">
                <p>Position</p>
                <h4>{userData.jobTitle}</h4>
              </div>
                  <div>
                   <div className="temp-container">
                     <h3>Description</h3>
                     <div className="temp-input">
                       <input
                         type="text"
                         id="templateDescription"
                         value={ratingSession?.description}
                         disabled
                       />
                     </div>
                   </div>
                   <div className="temp-container">
                     <h3>Reasons for Requests</h3>
                     <div className="temp-input">
                       <input
                         type="text"
                         id="reasonsForRequest"
                         value={ratingSession?.reasonForRequest}
                         disabled
                       />
                     </div>
                   </div>
                 </div>
            </div>
          )}
        </div>

      </div>
      <div className="questionnaire-container">
        <TemplateQuestionnaireBox />
      </div>
    </div>
  );
}
