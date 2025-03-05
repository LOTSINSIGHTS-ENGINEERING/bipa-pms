import { observer } from "mobx-react-lite";
import { FormEvent, useEffect, useState } from "react";
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import { useAppContext } from "../../../shared/functions/Context";
import { hideModalFromId } from "../../../shared/functions/ModalShow";
import { defaultGeneralTask, IGeneralTask } from "../../../shared/models/GeneralTasks";

import MODAL_NAMES from "../ModalName";
import { IProjectTaskStatus } from "../../../shared/models/ProjectTasks";

const GeneralTaskModal = observer(() => {
  const animatedComponents = makeAnimated();
  const { api, store } = useAppContext();
  const me = store.auth.meJson;

  const [task, setTask] = useState<IGeneralTask>({ ...defaultGeneralTask })
  const [loading, setLoading] = useState(false);

  const users = store.user.all.map(u => u.asJson).map(user => ({
    value: user.uid,
    label: user.displayName
  })).filter(user => user.value !== me?.uid);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    if (!me) return;
    const _task: IGeneralTask = {
      ...task,
      usersId: [me.uid, ...task.usersId],
      uid: me.uid,
      departmentId: me.department,
    }

    if (store.generalTask.selected)
      await update(_task);
    else await create(_task)

    setLoading(false);
    onCancel();
  };


  const create = async (task: IGeneralTask) => {
    try {
      await api.generalTask.createTask(task);
    } catch (error) { }
  };

  const update = async (task: IGeneralTask) => {
    try {
      await api.generalTask.updateTask(task);
    } catch (error) { }
  };

  const onCancel = () => {
    setTask({ ...defaultGeneralTask })
    hideModalFromId(MODAL_NAMES.GENERAL_TASKS.CREATE_GENERAL_TASK);
  };

  useEffect(() => {
    if (store.generalTask.selected) {
      setTask(store.generalTask.selected);
    }
    setTask({ ...defaultGeneralTask })
  }, [store.generalTask.selected]);

  return (
    <div className="user-modal uk-modal-dialog uk-modal-body uk-margin-auto-vertical" data-uk-overflow-auto>
      <button
        className="uk-modal-close-default"
        type="button"
        data-uk-close
      ></button>
      <h3 className="uk-modal-title">Task</h3>
      <div className="dialog-content uk-position-relative">
        <form onSubmit={handleSubmit}>
          <fieldset className="uk-fieldset">
            <div className="uk-margin">
              <input className="uk-input" required type="text" placeholder="Task name"
                onChange={(e) => setTask({ ...task, taskName: e.target.value })} />
            </div>
            <div className="uk-margin">
              <label className="uk-form-label" htmlFor="status">Status</label>
              <select id="status" className="uk-select" name="status"
                onChange={(e) => setTask({ ...task, status: e.target.value as IProjectTaskStatus })}>
                <option value={"todo"}>To Do</option>
                <option value={"in-progress"}>In Progress</option>
                <option value={"in-review"}>In Review</option>
                <option value={"done"}>Done</option>
              </select>
            </div>
            <div className="uk-margin">
              <label className="uk-form-label" htmlFor="portfolio">Select task members</label>
              <Select
                closeMenuOnSelect={false}
                components={animatedComponents}
                onChange={(value: any) => setTask({ ...task, usersId: value.map((t: any) => t.value) })}
                isMulti
                placeholder="Search user"
                options={users}
              />
            </div>
            <div className="uk-margin">
              <label className="uk-form-label" htmlFor="start">Start Date</label>
              <input id="start"
                required
                className="uk-input"
                type="date"
                placeholder="Start Date"
                onChange={(e) => setTask({ ...task, startDate: e.target.value })} />
            </div>
            <div className="uk-margin">
              <label className="uk-form-label" htmlFor="end">End Date</label>
              <input id="end"
                required
                className="uk-input"
                type="date"
                placeholder="End Date"
                onChange={(e) => setTask({ ...task, endDate: e.target.value })} />
            </div>
            <div className="uk-margin">
              <textarea
                className="uk-textarea"
                rows={2}
                placeholder="Description"
                onChange={(e) => setTask({ ...task, description: e.target.value })}>
              </textarea>
            </div>
          </fieldset>
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
              Save {loading && <div data-uk-spinner="ratio: .5"></div>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

export default GeneralTaskModal;
