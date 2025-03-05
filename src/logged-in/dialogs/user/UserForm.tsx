import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import SingleSelect from "../../../shared/components/single-select/SingleSelect";
import { USER_ROLES } from "../../../shared/functions/CONSTANTS";
import { useAppContext } from "../../../shared/functions/Context";
import { IFeatureAccess, IUser } from "../../../shared/models/User";
import "./UserForm.scss";

interface IProps {
  user: IUser;
  setUser: React.Dispatch<React.SetStateAction<IUser>>;
}

const UserForm = observer((props: IProps) => {
  const { store } = useAppContext();
  const { user, setUser } = props;
  const [UserFeature, setUserFeature] = useState<IFeatureAccess[]>(
    user.feature || []
  );

  useEffect(() => {
    setUserFeature(user.feature || []);
  }, [user.feature]);

  const departmentOptions = store.department.all.map((deprt) => ({
    label: deprt.asJson.name,
    value: deprt.asJson.id,
  }));

  const handleFeatureChange = (
    featureName: string,
    permission: string,
    checked: boolean
  ) => {
    const updatedFeatures = UserFeature.map((feature) => {
      if (feature.featureName === featureName) {
        return {
          ...feature,
          [permission]: checked,
        };
      }
      return feature;
    });

    // Update local state and the parent component's user state
    setUserFeature(updatedFeatures);
    setUser({ ...user, feature: updatedFeatures });
  };

  const userOptions = store.user.all.map((user) => ({
    label:
      user.asJson.displayName ||
      `${user.asJson.firstName} ${user.asJson.lastName}`,
    value: user.asJson.uid,
  }));

  userOptions.push({
    label: "None",
    value: "none",
  });

  return (
    <div className="user-form">
      <h2>User Details</h2>

      <div className="form-group">
        <label className="form-label" htmlFor="user-fname">
          Full name
        </label>
        <input
          className="form-input"
          id="user-fname"
          type="text"
          placeholder="Full name"
          value={user.displayName || ""}
          onChange={(e) =>
            setUser({ ...user, displayName: e.target.value })
          }
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="user-email">
          Email
        </label>
        <input
          className="form-input"
          id="user-email"
          type="email"
          placeholder="Email"
          value={user.email || ""}
          onChange={(e) => setUser({ ...user, email: e.target.value })}
          required
          disabled={store.user.selected ? true : false}
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="user-job-title">
          Job Title
        </label>
        <input
          className="form-input"
          id="user-job-title"
          type="text"
          placeholder="Job title"
          value={user.jobTitle || ""}
          onChange={(e) => setUser({ ...user, jobTitle: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="user-reporting-to">
          Reporting to
        </label>
        <SingleSelect
          
          options={userOptions}
          name="user-reporting-to"
          value={user.supervisor}
          onChange={(value) => setUser({ ...user, supervisor: value })}
          placeholder="Select a supervisor"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="add-to-reports">
          Add to reports
        </label>
        <div className="form-switch">
          <input
            type="checkbox"
            id="add-to-reports"
            checked={user.onReports}
            onChange={(e) =>
              setUser({ ...user, onReports: e.target.checked })
            }
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="user-department">
          Department
        </label>
        <SingleSelect
          
          options={departmentOptions}
          name="user-department"
          value={user.department}
          onChange={(value) => setUser({ ...user, department: value })}
          placeholder="Select a department"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="user-role">
          Role
        </label>
        <select
          className="form-select"
          id="user-role"
          value={user.role}
          onChange={(e) => setUser({ ...user, role: e.target.value })}
          required
        >
          <option value={USER_ROLES.DIRECTOR_USER}>
            Board of Director
          </option>
          <option value={USER_ROLES.MD_USER}>CEO/Managing Director</option>
          <option value={USER_ROLES.SUPER_USER}>Super User</option>
          <option value={USER_ROLES.EXECUTIVE_USER}>Executive</option>
          <option value={USER_ROLES.ADMIN_USER}>
            System Administrator
          </option>
          <option value={USER_ROLES.MANAGER_USER}>
            Manager/Supervisor
          </option>
          <option value={USER_ROLES.EMPLOYEE_USER}>Employee</option>
          <option value={USER_ROLES.GUEST_USER}>
            Guest User (Minimum Access)
          </option>
        </select>
      </div>
    </div>
  );
});

export default UserForm;
