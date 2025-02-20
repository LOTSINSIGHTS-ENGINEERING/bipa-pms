import { observer } from "mobx-react-lite";
import React from "react";
import SingleSelect from "../../../../shared/components/single-select/SingleSelect";
import { USER_ROLES } from "../../../../shared/functions/CONSTANTS";
import { useAppContext } from "../../../../shared/functions/Context";
import { IUser } from "../../../../shared/models/User";
import { IClient } from "../../../../shared/models/job-card-model/Client";


interface IProps {
  client: IClient;
  setClient: React.Dispatch<React.SetStateAction<IClient>>;
}
const ClientAccountForm = observer((props: IProps) => {
  const { store } = useAppContext();

  const { client, setClient } = props;

  // const departmentOptions = store.department.all.map((deprt) => ({
  //   label: deprt.asJson.name,
  //   value: deprt.asJson.id,
  // }));

  // const userOptions = store.user.all.map((user) => ({
  //   label:
  //     user.asJson.displayName ||
  //     `${user.asJson.firstName} ${user.asJson.lastName}`,
  //   value: user.asJson.uid,
  // }));

  // userOptions.push({
  //   label: "None",
  //   value: "none",
  // });

  return (
    <>
      <div className="uk-width-1-1"></div>
      <div className="uk-width-1-1">
        <label className="uk-form-label" htmlFor="user-fname">
          Full name<span className="uk-text-danger">*</span>
        </label>
        <div className="uk-form-controls">
          <input
            className="uk-input uk-form-small"
            id="user-fname"
            type="text"
            placeholder="First name"
            value={client.name || ""}
            onChange={(e) => setClient({ ...client, name: e.target.value })}
            required
          />
        </div>
      </div>

      {/* Form fields for the first column */}

      <div className="uk-form-controls uk-width-1-2 ">
        <label className="uk-form-label required" htmlFor="client-mobile">
          Cellphone Number <span className="uk-text-danger">*</span>
        </label>
        <input
          type="tel"
          className="uk-input uk-form-small"
          id="client-mobile"
          placeholder="Cellphone"
          value={client.mobileNumber || ""}
          onChange={(e) => {
            const input = e.target.value;
            // Allow only numbers and limit the length to 10 digits
            const sanitizedInput = input.replace(/\D/g, "").slice(0, 10);
            // Apply cellphone number format (e.g., XXX-XXX-XXXX)
            const formattedInput = sanitizedInput.replace(
              /(\d{3})(\d{3})(\d{4})/,
              "$1-$2-$3"
            );
            // Update jobCard state with formatted input
            setClient({
              ...client,
              mobileNumber: formattedInput,
            });
          }}
          pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" // Pattern for cellphone number format
          title="Please enter a valid cellphone number (e.g., XXX-XXX-XXXX)"
          required
        />
      </div>
      <div className="uk-form-controls uk-width-1-2 ">
        <label className="uk-form-label required" htmlFor="client-mobile">
          Cellphone Number (Secondary){" "}
        </label>
        <input
          type="tel"
          className="uk-input uk-form-small"
          id="client-mobile"
          placeholder="Cellphone"
          value={client.secondaryMobile || ""}
          onChange={(e) => {
            const input = e.target.value;
            // Allow only numbers and limit the length to 10 digits
            const sanitizedInput = input.replace(/\D/g, "").slice(0, 10);
            // Apply cellphone number format (e.g., XXX-XXX-XXXX)
            const formattedInput = sanitizedInput.replace(
              /(\d{3})(\d{3})(\d{4})/,
              "$1-$2-$3"
            );
            // Update jobCard state with formatted input
            setClient({
              ...client,
              secondaryMobile: formattedInput,
            });
          }}
          pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" // Pattern for cellphone number format
          title="Please enter a valid cellphone number (e.g., XXX-XXX-XXXX)"
        />
      </div>
      <div className="uk-form-controls uk-width-1-2">
        <label className="uk-form-label" htmlFor="client-address">
          Town<span className="uk-text-danger">*</span>
        </label>
        <input
          type="text" // Change type to "text" for address input
          className="uk-input uk-form-small"
          id="client-address"
          placeholder="Address"
          value={client.city || ""}
      
        />
      </div>
      {/* Add margin-bottom to create spacing */}
      <div className="uk-form-controls uk-width-1-2">
        <label className="uk-form-label" htmlFor="client-address">
          Physical Address <span className="uk-text-danger">*</span>
        </label>
        <input
          type="text" // Change type to "text" for address input
          className="uk-input uk-form-small"
          id="client-address"
          required
          placeholder="Address"
          value={client.physicalAddress || ""}
          onChange={(e) =>
            setClient({ ...client, physicalAddress: e.target.value })
          }
        />
      </div>
      <div className="uk-form-controls uk-width-1-2 ">
        <label className="uk-form-label" htmlFor="">
          Client Email
        </label>
        <input
          type="email"
          className="uk-input uk-form-small"
          id="client-email"
          placeholder="Email"
          value={client.email}
          onChange={(e) =>
            setClient({
              ...client,
              email: e.target.value,
            })
          }
        />
      </div>
    </>
  );
});

export default ClientAccountForm;
