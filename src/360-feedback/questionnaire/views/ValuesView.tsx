import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import MODAL_NAMES from "../../../dialogs/ModalName";
import { useAppContext } from "../../../../shared/functions/Context";
import showModalFromId from "../../../../shared/functions/ModalShow";
import NewValueModal from "../modals/CreateValueModal";
import Modal from "../../../../shared/components/Modal";
import "./ValuesViews.scss";
import { CriteriaBox } from "../components/CriteriaBox";
import EditValueModal from "../modals/EditValueModal";

const ValuesView = observer(() => {
  const { api, store } = useAppContext();

  const addNewValue = () => {
    showModalFromId(MODAL_NAMES.THREE_SIXTY_FEEDBACK.CREATE_VALUE_MODAL);
  };

  const values = store.value.all.map((value) => value.asJson);

  useEffect(() => {
    const load = async () => {
      try {
        await api.value.getAll();
      } catch (error) {
        console.error("Failed to fetch values:", error);
      }
    };
    load();
  }, [api.value]);

  return (
    <div className="questions-page">

       <div className="button-container">
         <button
           className="create-values-button"
           onClick={addNewValue}
         >
           Create Value
         </button>
       </div>
       
      {values.length > 0 ? (
        <CriteriaBox value={values} />
      ) : (
        <p>No values available. Create a new value to get started.</p>
      )}
      <Modal modalId={MODAL_NAMES.THREE_SIXTY_FEEDBACK.CREATE_VALUE_MODAL}>
        <NewValueModal />
      </Modal>
      <Modal modalId={MODAL_NAMES.THREE_SIXTY_FEEDBACK.EDIT_VALUE_MODAL}>
        <EditValueModal />
      </Modal>
    </div>
  );
});

export default ValuesView;