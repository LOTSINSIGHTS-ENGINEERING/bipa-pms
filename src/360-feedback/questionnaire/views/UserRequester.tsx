import { useEffect, useState } from "react";

import "../components/UserQuestionnaireBox.scss";


import IconButton from "@mui/material/IconButton";
import InfoIcon from "@mui/icons-material/Info";

import { useNavigate } from "react-router-dom";
import React from "react";
import RequestSubmittedAlertModal from "../../shared-components/RequestSubmittedModal";

import MODAL_NAMES from "../../../logged-in/dialogs/ModalName";
import { useAppContext } from "../../../shared/functions/Context";
import { IProject } from "../../../shared/models/Project";
import { ICommittee } from "../../../shared/models/three-sixty-feedback-models/Committee";
import { ICommitteeRating, defaultCommitteeRating } from "../../../shared/models/three-sixty-feedback-models/CommitteeRating";
import { IProjectRating, defaultProjectRating } from "../../../shared/models/three-sixty-feedback-models/ProjectRating";
import { IServiceRating, defaultServiceRating } from "../../../shared/models/three-sixty-feedback-models/ServiceRating";
import { IService } from "../../../shared/models/three-sixty-feedback-models/Services";
import Modal from "../../../shared/components/Modal";


interface IProps {
  value: (IService | IProject | ICommittee)[];
  ratee?: string;
}

export const UserRequesterQuestionnaireBox: React.FC<IProps> = ({
  value,
  ratee,
}) => {
  const { api, store } = useAppContext();
  const currentlyLoggedIn = store.auth.meJson;
  const me = store.auth.meJson?.uid;
  const [startValue, setStartValue] = useState("");
  const [stopValue, setStopValue] = useState("");
  const [continueValue, setContinueValue] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [additionalComment, setAdditionalComment] = useState("");
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();
  const [serviceRating, setServiceRating] = useState<IServiceRating>({
    ...defaultServiceRating,
  });
  const [projectRating, setProjectRating] = useState<IProjectRating>({
    ...defaultProjectRating,
  });
  const [committeeRating, setCommitteeRating] = useState<ICommitteeRating>({
    ...defaultCommitteeRating,
  });
  const [isCheckedMap, setIsCheckedMap] = useState<
    Record<string, Record<number, boolean>>
  >({});

  function isService(item: IService | IProject | ICommittee): item is IService {
    return "serviceName" in item;
  }

  function isServiceOrProjectOrCommittee(
    item: IService | IProject | ICommittee
  ): item is IService | IProject | ICommittee {
    return (
      "serviceName" in item || "projectName" in item || "committeeName" in item
    );
  }
  const handleCheckboxChange = (
    valueIndex: number,
    statementIndex: number,
    ratingIndex: number,
    isChecked: boolean
  ) => {
    setIsCheckedMap((prevState) => {
      return {
        ...prevState,
        [`${valueIndex}-${statementIndex}`]: {
          ...prevState[`${valueIndex}-${statementIndex}`],
          [ratingIndex]: isChecked,
        },
      };
    });
    const currentItem = value[valueIndex];

    if ("serviceName" in currentItem) {
      // Handle the Service case
      const serviceItem = currentItem as IService;
      setServiceRating((prevRating) => ({
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
              [serviceItem.serviceName]: {
                ...prevRating.values[me ?? ""]?.ratings?.[
                  serviceItem.serviceName
                ],
                [serviceItem.statements[statementIndex].statement]: isChecked
                  ? 5 - ratingIndex
                  : 0,
              },
            },
          },
        },
      }));
    } else if ("projectName" in currentItem) {
      // Handle the Project case
      const projectItem = currentItem as IProject;
      setProjectRating((prevRating) => ({
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
              [projectItem.projectName]: {
                ...prevRating.values[me ?? ""]?.ratings?.[
                  projectItem.projectName
                ],
                [projectItem.statements[statementIndex].statement]: isChecked
                  ? 5 - ratingIndex
                  : 0,
              },
            },
          },
        },
      }));
    } else if ("committeeName" in currentItem) {
      // Handle the Committee case
      const committeeItem = currentItem as ICommittee;
      setCommitteeRating((prevRating) => ({
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
              [committeeItem.committeeName]: {
                ...prevRating.values[me ?? ""]?.ratings?.[
                  committeeItem.committeeName
                ],
                [committeeItem.statements[statementIndex].statement]: isChecked
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
      await api.template.getAll();
    };
    load();
  }, [api.ratingAssignments]);

  return (
    <div>
      {value.map((item, index) => (
        <div className="blue-curved-container" key={index}>
          <div className="criteria-box">
            <div className="criteria">
              {!isService(item) && (
                <>
                  <div className="statement">
                    {(item as IProject | ICommittee).statements.map(
                      (statement, statementIndex) => (
                        <div className="statement" key={statementIndex}>
                          <div className="white-strip">
                            {
                              <div className="criteria">
                                <h3>
                                  {"projectName" in item &&
                                    (item as IProject).projectName}
                                  {"committeeName" in item &&
                                    (item as ICommittee).committeeName}
                                </h3>{" "}
                              </div>
                            }
                          </div>
                          <p>
                            {statement.statement}
                            <span style={{ color: "red" }}>*</span>
                          </p>
                          <div className="rating-container">
                            <div className="rating">
                              {Array.from({ length: 5 }).map(
                                (_, ratingIndex) => {
                                  const setKey = `${index}-${statementIndex}`;
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
                                        disabled
                                        onChange={(e) =>
                                          handleCheckboxChange(
                                            index,
                                            statementIndex,
                                            ratingIndex,
                                            e.target.checked
                                          )
                                        }
                                        checked={isChecked}
                                        value={`${5 - ratingIndex}`}
                                      />
                                      {/* Rating text */}
                                      <span className="rating-text">
                                        {5 - ratingIndex}
                                      </span>
                                      {/* Rating comment */}
                                      <span className="rating-comment">
                                        {5 - ratingIndex === 5
                                          ? " Excellent"
                                          : 5 - ratingIndex === 4
                                          ? " Good"
                                          : 5 - ratingIndex === 3
                                          ? " Better"
                                          : 5 - ratingIndex === 2
                                          ? " Bad"
                                          : " Very Bad"}
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
              {isService(item) && (
                <>
                  <div className="white-strip">
                    <div className="criteria">
                      <h3>{item.serviceName}</h3>
                    </div>
                  </div>
                  <div className="statement">
                    {(item as IService).statements.map(
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
                                  const setKey = `${index}-${statementIndex}`;
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
                                        disabled
                                        onChange={(e) =>
                                          handleCheckboxChange(
                                            index,
                                            statementIndex,
                                            ratingIndex,
                                            e.target.checked
                                          )
                                        }
                                        checked={isChecked}
                                        value={`${5 - ratingIndex}`}
                                      />
                                      {/* Rating text */}
                                      <span className="rating-text">
                                        {5 - ratingIndex}
                                      </span>
                                      {/* Rating comment */}
                                      <span className="rating-comment">
                                        {5 - ratingIndex === 5
                                          ? " Excellent"
                                          : 5 - ratingIndex === 4
                                          ? " Good"
                                          : 5 - ratingIndex === 3
                                          ? " Better"
                                          : 5 - ratingIndex === 2
                                          ? " Bad"
                                          : " Very Bad"}
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
                disabled
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
                disabled
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
                disabled
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
      <div className="input-group2">
        <h4>Additional Comments</h4>
        <div className="input-container2">
          <div className="blue-container2">
            <textarea
              className="blue-textarea2"
              placeholder=""
              value={additionalComment}
              maxLength={200}
              rows={4}
              onChange={(e) => setAdditionalComment(e.target.value)}
              disabled
            ></textarea>
          </div>
        </div>
      </div>
      <Modal
        modalId={MODAL_NAMES.THREE_SIXTY_FEEDBACK.SUCCESSFULLY_REQUESTED_MODAL}
      >
        <RequestSubmittedAlertModal />
      </Modal>
    </div>
  );
};
export default UserRequesterQuestionnaireBox;
