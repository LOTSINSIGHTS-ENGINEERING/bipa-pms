import React, { useState } from "react";
import { ILeadership } from "../../../../shared/models/three-sixty-feedback-models/Leadership";
import { IValue } from "../../../../shared/models/three-sixty-feedback-models/Values";
import EditLeadershipModal from "../modals/EditLeadershipModal";
import Modal from "../../../../shared/components/Modal";
import MODAL_NAMES from "../../../dialogs/ModalName";
import showModalFromId from "../../../../shared/functions/ModalShow";
import { useAppContext } from "../../../../shared/functions/Context";
import EditValueModal from "../modals/EditValueModal";
import DeleteIcon from "@mui/icons-material/Delete";
import "./CriteriaBox.scss";
import IconButton from "@mui/material/IconButton";
import InfoIcon from "@mui/icons-material/Info";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button/Button";

interface IProps {
  value: (IValue | ILeadership)[];
  onRate?: (rating: number) => void;
  inputFeaturesActive?: boolean; // New prop to control input features
}

export const CriteriaBox: React.FC<IProps> = ({
  value,
  onRate,
  inputFeaturesActive = true,
}) => {
  const { api, store } = useAppContext();
  const [selectedItem, setSelectedItem] = useState<IValue | ILeadership | null>(
    null
  );
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false); // State for dialog visibility
  const [itemToDelete, setItemToDelete] = useState<IValue | ILeadership | null>(null); // State to keep track of item to delete
  const [values, setValues] = useState<(IValue | ILeadership)[]>(value); // State to manage items

  const toggleEdit = (item: IValue | ILeadership) => {
    setSelectedItem(item);
    if (isValue(item)) {
      const value = store.value.getItemById(item.id)?.asJson;
      if (value) {
        store.value.select(value);
        showModalFromId(MODAL_NAMES.THREE_SIXTY_FEEDBACK.EDIT_VALUE_MODAL);
      }
    } else {
      const leadership = store.leadership.getItemById(item.id)?.asJson;
      if (leadership) {
        store.leadership.select(leadership);
        showModalFromId(MODAL_NAMES.THREE_SIXTY_FEEDBACK.EDIT_LEADERSHIP_MODAL);
      }
    }
  };

  const toggleDelete = (item: IValue | ILeadership) => {
    setItemToDelete(item); // Set item to delete
    setDeleteConfirmationOpen(true); // Open delete confirmation dialog
  };

  const onDeleteValue = async (valueToDelete: IValue) => {
    try {
      await api.value.delete(valueToDelete);
      setDeleteConfirmationOpen(false); // Close dialog after deletion
      // Update local state to reflect deletion
      const updatedValueList = values.filter((item) => item.id !== valueToDelete.id);
      setValues(updatedValueList);
    } catch (error) {
      console.error("Error deleting value:", error);
    }
  };

  const onDeleteLeadership = async (leadershipToDelete: ILeadership) => {
    try {
      await api.leadership.delete(leadershipToDelete);
      setDeleteConfirmationOpen(false); // Close dialog after deletion
      // Update local state to reflect deletion
      const updatedLeadershipList = values.filter((item) => item.id !== leadershipToDelete.id);
      setValues(updatedLeadershipList);
    } catch (error) {
      console.error("Error deleting leadership:", error);
    }
  };

  function isValue(item: IValue | ILeadership): item is IValue {
    return "valueName" in item;
  }

  return (
    <div>
      {values.map((item, index) => (
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
                          <p>{statement.statement}</p>
                          <div className="rating-container">
                            <div className="rating">
                              {Array.from({ length: 5 }).map(
                                (_, ratingIndex) => (
                                  <button key={ratingIndex}>
                                     {ratingIndex + 1}
                                  </button>
                                )
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
                      <h3>{item.valueName}</h3>
                    </div>
                  </div>
                  <div className="statement">
                    {(item as IValue).statements.map(
                      (statement, statementIndex) => (
                        <div className="statement" key={statementIndex}>
                          <p>{statement.statement}</p>
                          <div className="rating-container">
                            <div className="rating">
                              {Array.from({ length: 5 }).map(
                                (_, ratingIndex) => (
                                  <button key={ratingIndex}>
                                     {ratingIndex + 1}
                                  </button>
                                )
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
            <button className="edit-button" onClick={() => toggleEdit(item)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path d="M4 21a1 1 0 0 0 .24 0l4-1a1 1 0 0 0 .47-.26L21 7.41a2 2 0 0 0 0-2.82L19.42 3a2 2 0 0 0-2.83 0L4.3 15.29a1.06 1.06 0 0 0-.27.47l-1 4A1 1 0 0 0 3.76 21 1 1 0 0 0 4 21zM18 4.41 19.59 6 18 7.59 16.42 6zM5.91 16.51 15 7.41 16.59 9l-9.1 9.1-2.11.52z"></path>
              </svg>
            </button>
            <button className="delete-button" onClick={() => toggleDelete(item)}>
            <svg xmlns="http://www.w3.org/2000/svg" 
               width="24" 
               height="24" 
               viewBox="0 0 24 24">
              <path d="M5 20a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8h2V6h-4V4a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v2H3v2h2zM9 4h6v2H9zM8 8h9v12H7V8z"></path>
              <path d="M9 10h2v8H9zm4 0h2v8h-2z"></path>
            </svg>
            </button>
          </div>
          <Modal
            modalId={
              selectedItem
                ? isValue(selectedItem)
                  ? MODAL_NAMES.THREE_SIXTY_FEEDBACK.EDIT_VALUE_MODAL
                  : MODAL_NAMES.THREE_SIXTY_FEEDBACK.EDIT_LEADERSHIP_MODAL
                : ""
            }
          >
            {selectedItem && isValue(selectedItem) ? (
              <EditValueModal />
            ) : (
              <EditLeadershipModal />
            )}
          </Modal>
        </div>
      ))}
      <div className="required-inputs">
        {/* Your other input fields */}
      </div>

      <Dialog
        open={deleteConfirmationOpen}
        onClose={() => setDeleteConfirmationOpen(false)}
      >
        <DialogTitle>{"Confirm Deletion"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this item?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmationOpen(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() =>
              itemToDelete && isValue(itemToDelete)
                ? onDeleteValue(itemToDelete as IValue)
                : onDeleteLeadership(itemToDelete as ILeadership)
            }
            color="primary"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CriteriaBox;
