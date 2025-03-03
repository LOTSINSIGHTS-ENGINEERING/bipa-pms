import { observer } from "mobx-react-lite";
import moment from "moment";
import { ChangeEvent, FormEvent, useState, useEffect } from "react";
import { useAppContext } from "../../../shared/functions/Context";
import { hideModalFromId } from "../../../shared/functions/ModalShow";
import { defaultGeneralTask, IGeneralTask, IGeneralTaskStatus } from "../../../shared/models/GeneralTasks";
import { timeFormart } from "../../project-management/utils/common";
import MODAL_NAMES from "../ModalName";

const ViewGeneralTaskModal = observer(() => {

  const { api, store } = useAppContext();
  const me = store.auth.meJson;
  const [task, setTask] = useState<IGeneralTask>({ ...defaultGeneralTask })

  const uploadingStatus: string = store.projectStatus.status;
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    const file = e.target.files?.[0] as File || null;
    if (!file || !task) return;

    setLoading(true);
    try {
      await api.generalTask.uploadTaskFile(task, file);
    } catch (error) { }

    setLoading(false);
  };

  const handleSubmitComments = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!task || !me) return;

    setLoading(true);
    try {
      await api.generalTask.taskComment(task, `${me.displayName} => ${comment}`)
    } catch (error) { }

    setLoading(false)
  };

  // deleteFile
  const deleteFile = async () => {
    setLoading(true);
    try {
      await api.generalTask.deleteFile(task);
    } catch (error) {
      console.log(error);
    }

    setLoading(false);
  }

  const updateStatus = async (e: ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();

    setTask({ ...task, status: e.target.value as IGeneralTaskStatus })

    if (!task) return;

    const _task: IGeneralTask = {
      ...task,
      status: e.target.value as IGeneralTaskStatus,
    }
    setLoading(true);
    try {
      await api.generalTask.updateTask(_task);
    } catch (error) { }
    setLoading(false);
  }

  const onCancel = () => {
    setTask({ ...defaultGeneralTask })
    store.generalTask.clearSelected()
    hideModalFromId(MODAL_NAMES.GENERAL_TASKS.CREATE_GENERAL_TASK);
  };

  useEffect(() => {
    if (store.generalTask.selected) {
      setTask(store.generalTask.selected);
    }
  }, [store.generalTask.selected]);

  if (!task) return (
    <div className=" uk-modal-dialog uk-modal-body uk-margin-auto-vertical uk-width-2-3">
      <button
        onClick={onCancel}
        className="uk-modal-close-default"
        type="button"
        data-uk-close
      ></button>
      <span>Task Not Available</span>
    </div>
  )

  return (
    <div className="general-task-modal uk-modal-dialog uk-modal-body uk-margin-auto-vertical uk-width-2-3" data-uk-overflow-auto>
      <button
        className="uk-modal-close-default"
        type="button"
        data-uk-close
      ></button>
      <div className="updateTask">
        <div>
          <select value={task.status}
            id="status"
            className="uk-select"
            name="status"
            onChange={(value) => updateStatus(value)}>
            <option value={"todo"}>To Do</option>
            <option value={"in-progress"}>In Progress</option>
            <option value={"in-review"}>In Review</option>
            <option value={"done"}>Done</option>
          </select>
        </div>
      </div>
      <h3 className="uk-modal-title">{task.taskName}</h3>
      <div className="dialog-content uk-position-relative modal-content">
        <div className="left flex-item">
          <div className="decription">
            <h5>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="feather feather-align-left">
                <line x1="17" y1="10" x2="3" y2="10"></line>
                <line x1="21" y1="6" x2="3" y2="6"></line>
                <line x1="21" y1="14" x2="3" y2="14"></line>
                <line x1="17" y1="18" x2="3" y2="18"></line>
              </svg>
              &nbsp;&nbsp;
              Description
            </h5>
            <p>{task.description}</p>
          </div>
          <div className="decription">
            <h5>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="feather feather-clock">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              &nbsp;
              Timeline
            </h5>
            <p>{moment(task.startDate).calendar(null, timeFormart)} - {moment(task.endDate).calendar(null, timeFormart)}</p>
          </div>
          <br />
        </div>
        <div className="attachments">
          <h5>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="feather feather-paperclip">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
            </svg>
            &nbsp; Attachments &nbsp;&nbsp;
            {task.files.length === 0 &&
              <div className="upload" data-uk-tooltip="Upload File" data-uk-form-custom>
                <div data-uk-form-custom>
                  <input type="file" onChange={handleFileUpload} />
                  <button className="file-upload" type="button" tabIndex={-1}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="feather feather-upload">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                  </button>
                  {uploadingStatus !== "start" && <div data-uk-spinner="ratio: .9">{uploadingStatus}%</div>}
                </div>
              </div>
            }
          </h5>
          <ul className="uk-list">
            {task.files.map((file, index) => (
              <li key={index}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="feather feather-file">
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                  <polyline points="13 2 13 9 20 9"></polyline>
                </svg>
                &nbsp;&nbsp;
                <a href={file.link}>{file.name} &nbsp;&nbsp;<span data-uk-icon="download"></span></a>
                <span onClick={deleteFile} data-uk-icon="trash"></span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="right flex-item">
        <div className="comments">
          <h5>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="feather feather-message-circle">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
            &nbsp;
            Comments
          </h5>
          <div className="messages">
            <div className="msg-in">
              {task.comments.map((comm, index) => {
                let name = comm.split("=>")[0];
                let text = comm.split("=>")[1];
                return (
                  <p className="msg" style={{ whiteSpace: "pre-line", fontSize: ".8rem" }} key={index}>
                    <span><small>{name}</small></span> <br />
                    {text}
                  </p>
                )
              })}
            </div>
            <form onSubmit={handleSubmitComments} className="comment-form">
              <div className="send-msg">
                <textarea className="uk-textarea" style={{ resize: "none" }} rows={2} placeholder="comment" onChange={(e: any) => setComment(e.target.value)}></textarea>
                <button
                  className="send-btn"
                  type="submit"
                  disabled={loading}
                >
                  {!loading && <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="feather feather-send">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>}
                  {loading && <div data-uk-spinner="ratio: .5"></div>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ViewGeneralTaskModal;
