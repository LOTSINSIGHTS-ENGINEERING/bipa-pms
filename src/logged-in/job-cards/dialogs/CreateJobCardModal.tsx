// CreateJobCard.jsx

import { observer } from "mobx-react-lite";
import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { useAppContext } from "../../../shared/functions/Context";
import "datatables.net";
import "datatables.net-buttons-bs4";
import "datatables.net-buttons/js/buttons.print.mjs";
import "datatables.net-responsive-bs4";
import "datatables.net-searchbuilder-bs4";
import "datatables.net-searchpanes-bs4";
import "datatables.net-staterestore-bs4";
import {
  IJobCard,
  IUrgency,
  defaultJobCard,
} from "../../../shared/models/job-card-model/Jobcard";
import { hideModalFromId } from "../../../shared/functions/ModalShow";
import MODAL_NAMES from "../../dialogs/ModalName";
import SingleSelect, {
  IOption,
} from "../../../shared/components/single-select/SingleSelect";
import { dateFormat_YY_MM_DY } from "../../shared/utils/utils";
import { IClient, defaultClient } from "../../../shared/models/job-card-model/Client";
import "./CreateModal.css"; // Import your custom styles
import { Alert } from "@mui/material";
import AlertDialog from "./Alert";
const CreateJobCardModal = observer(() => {
  const [loading, setLoading] = useState(false);
  const { api, store } = useAppContext();
  const [jobCard, setJobCard] = useState<IJobCard>({ ...defaultJobCard });

 
 const [addNewClient, setAddNewClient] = useState(false);
  const [client, setClient] = useState<IClient>({ ...defaultClient });

  const generateUniqueId = () => {
    const existingUid = store.jobcard.jobcard.all;

    // Extract the unique IDs from the existing job cards
    const existingUniqueIds = existingUid.map(
      (employee) => employee.asJson.uniqueId
    );

    let idCounter = 1;
    // Generate a unique ID and check for uniqueness
    let nextUniqueId = `N${idCounter.toString().padStart(3, "0")}`;
    while (existingUniqueIds.includes(nextUniqueId)) {
      idCounter++;
      nextUniqueId = `N${idCounter.toString().padStart(3, "0")}`;
    }

    return nextUniqueId;
  };

  // Get today's date in the format YYYY-MM-DD
  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      // const uniqueId = generateUniqueId();
      const updatedJobCard = {
        ...jobCard,
        uniqueId: uniqueId,
        dateIssued: Date.now(),
      };
      setJobCard(updatedJobCard);
      await api.jobcard.jobcard.create(updatedJobCard);

      // store.jobcard.jobcard.select(jobCard);
      store.jobcard.jobcard.select(updatedJobCard);
    } catch (error) {
    } finally {
      onCancel();
      setLoading(false);
    }
  };
  const onCancel = () => {
    store.jobcard.jobcard.clearSelected();
    setJobCard({ ...defaultJobCard });
    hideModalFromId(MODAL_NAMES.EXECUTION.CREATEJOBCARD_MODAL);
  };

  //filter users 
    const users = store.user.all

  const clients = store.jobcard.client.all.filter(
    (clients) => clients.asJson.status !== "Archived"
  );

 const clientOptions: IOption[] = useMemo(
   () =>
     clients.map((bu) => {
       return {
         label: bu.asJson.name || "",
         value: bu.asJson.id,
       };
     }),
   [clients]
 );
  
    const division = store.jobcard.division.all;

    //  const filteredUsers = users.filter(
    //    (users) => users.asJson.department === jobCard.section
    //  );


  //Naftal comments
  
  const divisionOptions: IOption[] = useMemo(
    () =>
      division.map((bu) => {
        return {
          label: bu.asJson.name || "",
          value: bu.asJson.id,
        };
      }),
    [division]
  );

   const userOptions: IOption[] = useMemo(
     () =>
       users.map((bu) => {
         return {
           label: bu.asJson.displayName || "",
           value: bu.asJson.uid,
         };
       }),
     [users]
   );

//  const handleMarkAsCompleted = () => {

//   setAddNewClient(true)
//     // const UpdateJobCard: IJobCard = {
//     //   ...jobCard,
//     //   status: "Completed",
//     //   dateCompleted: Date.now(),
//     // };

//     // try {
//     //   await api.jobcard.jobcard.update(UpdateJobCard);
//     //   console.log("Completed", UpdateJobCard);
//     // } finally {
//     //   onCancel();
//     // }
//   };
  const handleDivisionOptions = (value: string) => {
    setJobCard({ ...jobCard, division: value });
    // Additional logic if needed
  };
   const handleUserOptions = (value: string) => {
     setJobCard({ ...jobCard, assignedTo: value });
   
     // Additional logic if needed
   };
   const handleSelectedAccount = (value: string) => {
    setJobCard({ ...jobCard, clientId: value });
    const selectedClient= store.jobcard.client.getById(value).asJson

     setClient(selectedClient);
     // Additional logic if needed
   };


  const section = store.jobcard.section.all

  // Filter departments based on jobCard.division value
  const filteredSection = section.filter(
    (section) => section.asJson.division === jobCard.division
  );

  const sectionOptions: IOption[] = useMemo(
    () =>
      filteredSection.map((dept) => {
        return {
          label: dept.asJson.name || "",
          value: dept.asJson.id,
        };
      }),
    [filteredSection]
  );
  const handleSectionOptions = (value: string) => {
    setJobCard({ ...jobCard, section: value });
    // Additional logic if needed
  };

  const uniqueId = generateUniqueId();
  useEffect(() => {
    // if (store.jobcard.jobcard.selected) {
    //   setJobCard(store.jobcard.jobcard.selected);
    // }
  }, [store.jobcard.jobcard.selected]);

  useEffect(() => {
    const loadData = async () => {
      await api.user.getAll();
      await api.jobcard.jobcard.getAll();
      await api.user.getAll();
      await api.jobcard.client.getAll()
      await api.department.getAll();
    };
    loadData();
  }, [api.user, api.jobcard, api.department]);

  useEffect(() => {
    // load data from db
    const loadAll = async () => {
      setLoading(true); // start loading
      try {
        await api.user.getAll();
        await api.department.getAll();
        await api.businessUnit.getAll();
      } catch (error) {
        // console.log("Error: ", error);
      }
      setLoading(false); // stop loading
    };
    loadAll();
  }, [api.businessUnit, api.department, api.scorecard, api.user]);

  const handleUrgencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setJobCard({
      ...jobCard,
      urgency: e.target.value as IUrgency,
    });
  };
  // Define a function to handle changes to the due date
  const handleDateChange = (newDate: number) => {
    console.log("new date", newDate);

    setJobCard({
      ...jobCard,
      dueDate: newDate,
    });
  };
  const handleAddMaterialClient = (event) => {
    event.preventDefault();
    setAddNewClient(true);
  };

   const validateField = (name, value) => {
     let errorMsg = "";
     if (!value) {
       switch (name) {
         case "name":
           errorMsg = "Full Name is required";
           break;
         case "mobileNumber":
           errorMsg = "Cellphone Number is required";
           break;
         case "physicalAddress":
           errorMsg = "Physical Address is required";
           break;
         case "email":
           errorMsg = "Email is required";
           break;
         default:
           break;
       }
     }
     return errorMsg;
   };

    const handleChange = (e) => {
      const { id, value } = e.target;
      setClient((prevClient) => ({
        ...prevClient,
        [id]: value,
      }));
      setErrors((prevErrors) => ({
        ...prevErrors,
        [id]: validateField(id, value),
      }));
    };

   const [errors, setErrors] = useState({ ...defaultClient });
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    onConfirm: null,
  });
// const handleAddClient  = async (event) => {
//   event.preventDefault(); // Prevent default form submission behavior
//    if (
//      !client.name ||
//      !client.mobileNumber ||
//      !client.physicalAddress ||
//      !client.email
//    ) {
//      alert("Please fill out all required fields.");
//      return;
//    }
//   try
//   {await api.jobcard.client.create(client)

//   }
//   catch{}
//   // Add your logic for marking as completed here
//     setAddNewClient(false);
// };
 

  // const handleAddClient = async (event) => {
  //   event.preventDefault(); // Prevent default form submission behavior

  //   const newErrors :IClient= {...client,
  //     name: client.name ? "" : "Full Name is required",
  //     mobileNumber: client.mobileNumber ? "" : "Cellphone Number is required",
  //     secondaryMobile: "",
  //     physicalAddress: client.physicalAddress
  //       ? ""
  //       : "Physical Address is required",
  //     email: client.email ? "" : "Email is required",
  //   };

  //   setErrors(newErrors);

  //   const hasErrors = Object.values(newErrors).some((error) => error !== "");

  //   if (hasErrors) {
  //     // alert("Please fill out all required fields.");
  //     return;
  //   }

  //   try {
  //     await api.jobcard.client.create(client);
  //   } catch (error) {
  //     console.error("Error saving client:", error);
  //   }

  //   // Add your logic for marking as completed here
  //   setAddNewClient(false);
  // };
//  const handleAddClient = async (event) => {
//    event.preventDefault(); // Prevent default form submission behavior

//    const newErrors :IClient = {...client,
//      name: client.name ? "" : "Full Name is required",
//      mobileNumber: client.mobileNumber ? "" : "Cellphone Number is required",
//      secondaryMobile: "",
//      physicalAddress: client.physicalAddress
//        ? ""
//        : "Physical Address is required",
//      email: client.email ? "" : "Email is required",
//    };

//    setErrors(newErrors);

//    const emptyFields = Object.entries(newErrors)
//      .filter(([key, value]) => value !== "")
//      .map(([key]) =>
//        key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())
//      )
//      .join(", ");

//    const hasErrors = Object.values(newErrors).some((error) => error !== "");

//    if (hasErrors) {
//      setAlert({
//        open: true,
//        message: `Please fill out the following required fields: ${emptyFields}.`,
//        onConfirm: handleCloseAlert,
//      });
//      return;
//    }

//    setAlert({
//      open: true,
//      message: "Are you sure you want to save this client?",
//      onConfirm: confirmSaveClient,
//    });
//  };

 const handleAddClient = async (event) => {
  event.preventDefault(); // Prevent default form submission behavior

  const newErrors: IClient = {
    ...client,
    name: client.name ? "" : "Full Name is required",
    mobileNumber: client.mobileNumber ? "" : "Cellphone Number is required",
    secondaryMobile: "",
    physicalAddress: client.physicalAddress
      ? ""
      : "Physical Address is required",
    email: client.email ? "" : "Email is required",
    // Ensure 'city' field is not required, so no validation error for it
    city: "", // You can safely leave this out if 'city' is not part of the required fields
  };

  setErrors(newErrors);

  const emptyFields = Object.entries(newErrors)
    .filter(([key, value]) => value !== "")
    .map(([key]) =>
      key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())
    )
    .join(", ");

  const hasErrors = Object.values(newErrors).some((error) => error !== "");

  if (hasErrors) {
    setAlert({
      open: true,
      message: `Please fill out the following required fields: ${emptyFields}.`,
      onConfirm: handleCloseAlert,
    });
    return;
  }

  setAlert({
    open: true,
    message: "Are you sure you want to save this client?",
    onConfirm: confirmSaveClient,
  });
};


  const confirmSaveClient = async () => {
    handleCloseAlert();
    try {
      await api.jobcard.client.create(client);
      setAddNewClient(false);
    } catch (error) {
      console.error("Error saving client:", error);
      setAlert({
        open: true,
        message: "Error saving client. Please try again later.",
        onConfirm: handleCloseAlert,
      });
    }
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  return (
    <>
      <div className="view-modal custom-modal-style uk-modal-dialog uk-modal-body uk-width-1-2">
        <button
          className="uk-modal-close-default"
          // onClick={onCancel}
          disabled={loading}
          type="button"
          data-uk-close></button>
        <span style={{ fontSize: "2rem", fontWeight: "bold" }}>
          Job Card Form
        </span>
        {/* <h3 className="main-title-small text-to-break uk-text-bold">
          Record New Job Card
        </h3> */}

        <hr />

        <form
          className="custom-form uk-form uk-grid uk-grid-small"
          data-uk-grid
          onSubmit={handleSubmit}>
          <div className="uk-grid uk-width-1-1">
            <h4 className="">Job Card Details</h4>
          </div>

          <div className="uk-width-1-2 form-section">
            <label htmlFor="issuedDate" className="form-label">
              Division<span className="uk-text-danger">*</span>
            </label>
            <div className="uk-form-controls">
              <SingleSelect
                name="search-team"
                options={divisionOptions}
                onChange={handleDivisionOptions}
                placeholder="Select Division"
                value={jobCard.division}
              />
            </div>
          </div>
          <div className="uk-width-1-2 form-section">
            <label htmlFor="issuedDate" className="form-label">
              Section<span className="uk-text-danger">*</span>
            </label>
            <SingleSelect
              name="search-team"
              options={sectionOptions}
              onChange={handleSectionOptions}
              placeholder="Select Section"
              value={jobCard.section}
            />
          </div>
          <div className="uk-width-1-2 form-section">
            <label htmlFor="issuedDate" className="form-label">
              Assign to<span className="uk-text-danger">*</span>
            </label>
            <SingleSelect
              name="search-team"
              options={userOptions}
              onChange={handleUserOptions}
              placeholder="Assign"
              value={jobCard.assignedTo}
              required
            />
          </div>
          <div className="uk-width-1-2 form-section">
            <label htmlFor="issuedDate" className="form-label">
              Urgency<span className="uk-text-danger">*</span>
            </label>
            <select
              className="uk-select uk-form-small"
              id="urgency"
              value={jobCard.urgency}
              onChange={handleUrgencyChange}
              required>
              <option value="Normal">Normal</option>
              <option value="Urgent">Urgent</option>
              <option value="Very Urgent">Very Urgent</option>
            </select>
          </div>
          <div className="uk-width-1-2 form-section">
            <label htmlFor="issuedDate" className="form-label">
              Due Date<span className="uk-text-danger">*</span>
            </label>
            <input
              className="uk-input uk-form-small"
              id="dueDate"
              type="date"
              name="dueDate"
              value={dateFormat_YY_MM_DY(jobCard.dueDate) || ""}
              onChange={(e) => handleDateChange(e.target.valueAsNumber)}
              min={today} // Set the minimum date to today's date
              required
            />
          </div>
          <div className="uk-width-1-1 form-section">
            <label htmlFor="issuedDate" className="form-label">
              Task Description<span className="uk-text-danger">*</span>
            </label>
            <textarea
              className="uk-textarea uk-form-small"
              placeholder="Task Description"
              rows={3}
              id="taskDescription"
              value={jobCard.taskDescription}
              name={"taskDescription"}
              onChange={(e) =>
                setJobCard({
                  ...jobCard,
                  taskDescription: e.target.value,
                })
              }
              required
            />
          </div>
          <div className="uk-width-1-1">
            <h4 className="section-title">Client Details</h4>
          </div>
          <div className="uk-grid uk-width-1-1" data-uk-grid>
            <div className="uk-width-expand">
              <div className="uk-form-controls">
                <label className="uk-form-label" htmlFor="client">
                  Select A Client<span className="uk-text-danger">*</span>
                </label>
                <SingleSelect
                  name="search-team"
                  options={clientOptions}
                  onChange={handleSelectedAccount}
                  placeholder="Select Client"
                  value={jobCard.assignedTo}
                />
              </div>
            </div>
            <div className="uk-width-auto">
              <div className="uk-flex uk-flex-middle">
                <button
                  className="btn btn-primary"
                  onClick={handleAddMaterialClient}>
                  Add New Client
                </button>
              </div>
            </div>
          </div>

          {addNewClient === false && (
            <>
              <div className="uk-width-1-2 form-section">
                <label htmlFor="issuedDate" className="form-label">
                  Full Name<span className="uk-text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="uk-input uk-form-small"
                  id="clientFullName"
                  placeholder="Full Name"
                  value={client.name}
                  required
                />
              </div>
              <div className="uk-width-1-2 form-section">
                <label htmlFor="issuedDate" className="form-label">
                  Cellphone Number<span className="uk-text-danger">*</span>
                </label>
                <input
                  type="tel"
                  className="uk-input uk-form-small"
                  id="clientMobile"
                  placeholder="Cellphone"
                  value={client.mobileNumber}
                  onChange={(e) => {
                    const input = e.target.value;
                    const sanitizedInput = input
                      .replace(/\D/g, "")
                      .slice(0, 10);
                    const formattedInput = sanitizedInput.replace(
                      /(\d{3})(\d{3})(\d{4})/,
                      "$1-$2-$3"
                    );
                  }}
                  pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                  title="Please enter a valid cellphone number (e.g., XXX-XXX-XXXX)"
                  required
                />
              </div>
              <div className="uk-width-1-2 form-section">
                <label htmlFor="issuedDate" className="form-label">
                  Cellphone Number (Secondary)
                  <span className="uk-text-danger">*</span>
                </label>
                <input
                  type="tel"
                  className="uk-input uk-form-small"
                  id="clientSecondaryMobile"
                  placeholder="Cellphone"
                  value={client.secondaryMobile}
                  onChange={(e) => {
                    const input = e.target.value;
                    const sanitizedInput = input
                      .replace(/\D/g, "")
                      .slice(0, 10);
                    const formattedInput = sanitizedInput.replace(
                      /(\d{3})(\d{3})(\d{4})/,
                      "$1-$2-$3"
                    );
                  }}
                  pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                  title="Please enter a valid cellphone number (e.g., XXX-XXX-XXXX)"
                />
              </div>
              <div className="uk-width-1-2 form-section">
                <label htmlFor="issuedDate" className="form-label">
                  Physical Address<span className="uk-text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="uk-input uk-form-small"
                  id="clientAddress"
                  placeholder="Address"
                  value={client.physicalAddress}
                />
              </div>
              <div className="uk-width-1-2 form-section">
                <label htmlFor="issuedDate" className="form-label">
                  Client Email<span className="uk-text-danger">*</span>
                </label>
                <input
                  type="email"
                  className="uk-input uk-form-small"
                  id="clientEmail"
                  placeholder="Email"
                  value={client.email}
                />
              </div>
            </>
          )}
          {addNewClient === true && (
            <>
              {addNewClient && (
                <>
                  <AlertDialog
                    open={alert.open}
                    onClose={handleCloseAlert}
                    onConfirm={alert.onConfirm}
                    message={alert.message}
                  />

                  <div className="uk-width-1-1">
                    <h4 className="section-title">
                      Please enter new client details below
                    </h4>
                  </div>
                  <div className="uk-width-1-2 form-section">
                    <label htmlFor="name" className="form-label">
                      Full Name<span className="uk-text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="uk-input uk-form-small"
                      id="name"
                      placeholder="Full Name"
                      value={client.name}
                      onChange={handleChange}
                      required
                    />
                    {errors.name && (
                      <Alert severity="error">{errors.name}</Alert>
                    )}
                  </div>
                  <div className="uk-width-1-2 form-section">
                    <label htmlFor="mobileNumber" className="form-label">
                      Cellphone Number<span className="uk-text-danger">*</span>
                    </label>
                    <input
                      type="tel"
                      className="uk-input uk-form-small"
                      id="mobileNumber"
                      placeholder="Cellphone"
                      value={client.mobileNumber}
                      onChange={(e) => {
                        const input = e.target.value;
                        const sanitizedInput = input
                          .replace(/\D/g, "")
                          .slice(0, 10);
                        const formattedInput = sanitizedInput.replace(
                          /(\d{3})(\d{3})(\d{4})/,
                          "$1-$2-$3"
                        );
                        setClient((prevClient) => ({
                          ...prevClient,
                          mobileNumber: formattedInput,
                        }));
                        setErrors((prevErrors) => ({
                          ...prevErrors,
                          mobileNumber: validateField(
                            "mobileNumber",
                            formattedInput
                          ),
                        }));
                      }}
                      pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                      title="Please enter a valid cellphone number (e.g., XXX-XXX-XXXX)"
                      required
                    />
                    {errors.mobileNumber && (
                      <Alert severity="error">{errors.mobileNumber}</Alert>
                    )}
                  </div>
                  <div className="uk-width-1-2 form-section">
                    <label htmlFor="secondaryMobile" className="form-label">
                      Cellphone Number (Secondary)
                    </label>
                    <input
                      type="tel"
                      className="uk-input uk-form-small"
                      id="secondaryMobile"
                      placeholder="Cellphone"
                      value={client.secondaryMobile}
                      onChange={(e) => {
                        const input = e.target.value;
                        const sanitizedInput = input
                          .replace(/\D/g, "")
                          .slice(0, 10);
                        const formattedInput = sanitizedInput.replace(
                          /(\d{3})(\d{3})(\d{4})/,
                          "$1-$2-$3"
                        );
                        setClient((prevClient) => ({
                          ...prevClient,
                          secondaryMobile: formattedInput,
                        }));
                      }}
                      pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                      title="Please enter a valid cellphone number (e.g., XXX-XXX-XXXX)"
                    />
                  </div>
                  <div className="uk-width-1-2 form-section">
                    <label htmlFor="physicalAddress" className="form-label">
                      Physical Address<span className="uk-text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="uk-input uk-form-small"
                      id="physicalAddress"
                      placeholder="Address"
                      value={client.physicalAddress}
                      onChange={handleChange}
                      required
                    />
                    {errors.physicalAddress && (
                      <Alert severity="error">{errors.physicalAddress}</Alert>
                    )}
                  </div>
                  <div className="uk-width-1-2 form-section">
                    <label htmlFor="email" className="form-label">
                      Client Email<span className="uk-text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      className="uk-input uk-form-small"
                      id="email"
                      placeholder="Email"
                      value={client.email}
                      onChange={handleChange}
                      required
                    />
                    {errors.email && (
                      <Alert severity="error">{errors.email}</Alert>
                    )}
                  </div>
                  <div
                    className="uk-width-1-1 uk-text-right"
                    style={{ marginTop: "10px" }}>
                    <button
                      className="btn btn-primary"
                      onClick={handleAddClient}>
                      Save Client
                    </button>
                  </div>
                </>
              )}
            </>
          )}
          <div className="uk-width-1-2 form-section">
            <label htmlFor="issuedDate" className="form-label">
              Type of Work<span className="uk-text-danger">*</span>
            </label>
            <input
              type="text"
              className="uk-input uk-form-small"
              id="typeOfWork"
              placeholder="Type of Work"
              value={jobCard.typeOfWork}
              onChange={(e) =>
                setJobCard({
                  ...jobCard,
                  typeOfWork: e.target.value,
                })
              }
            />
          </div>
          <div className="uk-form-controls uk-width-1-1">
            <label className="uk-form-label required" htmlFor="remark">
              Remarks
            </label>
            <textarea
              className="uk-textarea uk-form-small"
              placeholder="Remarks"
              rows={3}
              id="remark"
              maxLength={30}
              name={"remark"}
              onChange={(e) =>
                setJobCard({
                  ...jobCard,
                  remark: e.target.value,
                })
              }
            />
          </div>
          <div
            className="uk-width-1-1 uk-text-right"
            style={{ marginTop: "10px" }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}>
              Create {loading && <div data-uk-spinner="ratio: .5"></div>}
            </button>
          </div>
        </form>
      </div>
    </>
  );
});

export default CreateJobCardModal;
