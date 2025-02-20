import { observer } from "mobx-react-lite";
import { useAppContext } from "../../../../shared/functions/Context";
import { FormEvent, useEffect, useState } from "react";
import { IUser, defaultUser } from "../../../../shared/models/User";
import { hideModalFromId } from "../../../../shared/functions/ModalShow";
import MODAL_NAMES from "../../../dialogs/ModalName";
import ClientAccountForm from "./ClientAcountForm";
import { IClient, defaultClient } from "../../../../shared/models/job-card-model/Client";
import MemberForm from "./MemberForm";

import { ITeamMember, defaultTeamMember } from "../../../../shared/models/job-card-model/TeamMember";
import AlertDialog from "../../dialogs/Alert";


const MemberModal = observer(() => {
  const { api, store, ui } = useAppContext();

  const [member, setMember] = useState({ ...defaultTeamMember });
  const [loading, setLoading] = useState(false);

  const [alert, setAlert] = useState({
    open: false,
    message: "",
    onConfirm: null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    setAlert({
      open: true,
      message: "Are you sure you want to save this member?",
      onConfirm: confirmSaveMember,
    });
  };

  const confirmSaveMember = async () => {
    setLoading(true);
    handleCloseAlert();

    const selected = store.jobcard.teamMember.selected;

    try {
      if (selected) {
        await update(member);
        // alert("Member updated successfully!");
      } else {
        await create(member);
        // alert("Member created successfully!");
      }
    } catch (error) {
      // alert("An error occurred while processing your request.");
    } finally {
      setLoading(false);
      onCancel();
    }
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };


  const update = async (member: ITeamMember) => {
    try {
      await api.jobcard.teamMember.update(member);
    } catch (error) {
      ui.snackbar.load({
        id: Date.now(),
        message: "Failed to update user.",
        type: "warning",
      });
    }
  };

  const create = async (member: ITeamMember) => {
    try {
      await api.jobcard.teamMember.create(member);
    } catch (error) {
      ui.snackbar.load({
        id: Date.now(),
        message: "Failed to create user.",
        type: "warning",
      });
    }
  };

  const onCancel = () => {
    // clear selected user
    store.jobcard.member.clearSelected();
    // reset form
    setMember({ ...defaultTeamMember });
    // hide modal
    hideModalFromId(MODAL_NAMES.ADMIN.TEAM_MEMBER_MODAL);
  };

  // if selected user, set form values
  useEffect(() => {
    if (store.jobcard.teamMember.selected)
      setMember({ ...store.jobcard.teamMember.selected });
    else setMember({ ...defaultTeamMember });
  }, [store.jobcard.member.selected, store.jobcard.teamMember.selected]);

  return (
    <div className="user-modal uk-modal-dialog uk-modal-body uk-margin-auto-vertical">
      <button
        className="uk-modal-close-default"
        type="button"
        data-uk-close></button>
      <AlertDialog
        open={alert.open}
        onClose={handleCloseAlert}
        onConfirm={alert.onConfirm}
        message={alert.message}
      />

      <h3 className="uk-modal-title">Member</h3>

      <div className="dialog-content uk-position-relative">
        <form
          className="uk-form-stacked uk-grid-small"
          onSubmit={handleSubmit}
          data-uk-grid>
          <MemberForm member={member} setMember={setMember} />

          <div className="uk-width-1-1 uk-text-right">
            <button
              className="btn-text uk-margin-right"
              type="button"
              onClick={onCancel}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              type="submit"
              disabled={loading}>
              Save {loading && <div data-uk-spinner="ratio: .5"></div>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

export default MemberModal;
