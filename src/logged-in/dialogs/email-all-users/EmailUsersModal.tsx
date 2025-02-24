import { observer } from "mobx-react-lite";
import { FormEvent, useEffect, useState } from "react";
import { USER_ROLES } from "../../../shared/functions/CONSTANTS";
import { useAppContext } from "../../../shared/functions/Context";
import { MAIL_EMAIL } from "../../../shared/functions/mailMessages";
import { hideModalFromId } from "../../../shared/functions/ModalShow";
import User from "../../../shared/models/User";
import MODAL_NAMES from "../ModalName";

const EmailUsersModal = observer(() => {
  const { api, store, ui } = useAppContext();

  const [subject, setSubject] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [closing, setClosing] = useState<string>("");
  const [signature, setSignature] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const $message = [message.split(".").join(`.<br/><br/>`)];
  const WELCOME_BODY = [`${$message}`, "", `${closing},`, `${signature}`];
  const $MESSAGE = WELCOME_BODY.join("<br/>");

  const filterAccess = () => {
    let users: User[] = [];
    users = store.user.all.filter((u) => {
      return (
        u.asJson.role !== USER_ROLES.BOARD_MEMBER_USER ||
        u.asJson.role !== USER_ROLES.GUEST_USER ||
        !u.asJson.devUser
      );
    });
    return users;
  };

  const getEmail = () => {
    let emails: string[] = [];
    filterAccess().map((u) => {
      if (u.asJson.email) emails.push(u.asJson.email);
    });
    return emails;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.mail.sendMail(getEmail(), MAIL_EMAIL, subject, $MESSAGE);
      ui.snackbar.load({
        id: Date.now(),
        type: "success",
        message: "Email sent.",
        timeoutInMs: 10000,
      });
    } catch (error) {
      console.log("error at sending emails", error);
      ui.snackbar.load({
        id: Date.now(),
        type: "warning",
        message: "Email not sent.",
        timeoutInMs: 10000,
      });
    }
    setLoading(false);
    onCancel();
  };

  const onCancel = () => {
    setSubject("");
    setMessage("");
    setClosing("");
    setSignature("");
    hideModalFromId(MODAL_NAMES.PERFORMANCE_REVIEW.MAIL_ALL_EMPLOYEES_MODAL);
  };

  useEffect(() => {
    const loadAll = async () => {
      try {
        await api.user.getAll();
      } catch (error) { }
    };
    loadAll();
  }, [api.user]);

  return (
    <div className="measure-comments-modal uk-modal-dialog uk-modal-body uk-margin-auto-vertical">
      <button
        className="uk-modal-close-default"
        type="button"
        data-uk-close
      ></button>

      <div className="dialog-content uk-position-relative">
        <form
          className="uk-form-stacked uk-grid-small"
          data-uk-grid
          onSubmit={handleSubmit}
        >
          <div className="uk-width-1-1">
            <label className="uk-form-label" htmlFor="folder-fname-sub">
              Subject
            </label>
            <div className="uk-form-controls">
              <input
                className="uk-input uk-form-small"
                id="folder-fname-sub"
                type="text"
                placeholder="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="uk-width-1-1">
            <label className="uk-form-label" htmlFor="kpi-comments-messages">
              Message
            </label>
            <textarea
              className={"uk-textarea uk-form-small"}
              id="kpi-comments-messages"
              rows={10}
              placeholder="Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <div className="uk-width-1-1">
            <label className="uk-form-label" htmlFor="folder-fname-closing">
              Closing
            </label>
            <div className="uk-form-controls">
              <input
                className="uk-input uk-form-small"
                id="folder-fname-closing"
                type="text"
                placeholder="Regards"
                value={closing}
                onChange={(e) => setClosing(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="uk-width-1-1">
            <label className="uk-form-label" htmlFor="folder-fname-signature">
              Signature
            </label>
            <div className="uk-form-controls">
              <input
                className="uk-input uk-form-small"
                id="folder-fname-signature"
                type="text"
                placeholder="Sender name"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="uk-width-1-1 uk-text-right">
            <button
              className="btn-text uk-margin-right"
              type="button"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              type="submit"
              disabled={loading}
            >
              Send {loading && <div data-uk-spinner="ratio: .5"></div>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

export default EmailUsersModal;
