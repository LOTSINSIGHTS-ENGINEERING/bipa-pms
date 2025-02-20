// Step2.tsx
// UpdateJobCard.tsx
import { observer } from "mobx-react-lite";
import React, { useMemo } from "react";
import { useState, useEffect, FormEvent } from "react";
import { useAppContext } from "../../../shared/functions/Context";

import MODAL_NAMES from "../../dialogs/ModalName";
import { hideModalFromId } from "../../../shared/functions/ModalShow";
import {
  IJobCard,
  IUrgency,
  defaultJobCard,
} from "../../../shared/models/job-card-model/Jobcard";
import Select from "react-select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import ErrorBoundary from "../../../shared/components/error-boundary/ErrorBoundary";

import SingleSelect, {
  IOption,
} from "../../../shared/components/single-select/SingleSelect";
import NumberInput from "../../shared/components/number-input/NumberInput";
import {
  IMaterial,
  defaultMaterial,
} from "../../../shared/models/job-card-model/Material";
import MaterialTable from "../grids/MaterialTable";
import { CustomTransactionOpenAccordion } from "../Components/Accordion";
import { dateFormat_YY_MM_DY } from "../../shared/utils/utils";
import { IClient, defaultClient } from "../../../shared/models/job-card-model/Client";
import ButtonSecondary from "../create-jobcard/ButtonSecondary";


const UpdatedJobCardModal = observer(() => {
  const [jobCard, setJobCard] = useState<IJobCard>({ ...defaultJobCard });
  const [artesianValue, setArtesianValue] = useState(""); // State for Artesian input
  const [teamLeaderValue, setTeamLeaderValue] = useState(""); // State for Team Leader input
  const [teamMemberValue, setTeamMemberValue] = useState([]); // State for Team Member input
  const [material, setMaterial] = useState<IMaterial>({ ...defaultMaterial });
  const [client, setClient] = useState<IClient>({ ...defaultClient });
 
  //state for editing 
  const [editedJobCard, setEditedJobCard] = useState<IJobCard>({ ...jobCard });
    const [editedClient, setEditedClient] = useState<IClient>({ ...client });
    
 const [addNewClient, setAddNewClient] = useState(false);
  // Additional state or logic specific to Step 2

  const [loading, setLoading] = useState(false);
  const { api, store } = useAppContext();

  const handleArtesianChange = (value) => {
    setArtesianValue(value);
    setJobCard({ ...jobCard, artesian: value });
    // Additional logic if needed
  };
  const handleTeamLeaderChange = (value) => {
    setTeamLeaderValue(value);
    setJobCard({ ...editedJobCard, teamLeader: value });
    // Additional logic if needed
  };

  const handleTeamMemberChange = (selectedOptions) => {
    // selectedOptions is an array containing the selected option objects
    // You can access the selected values and perform any necessary actions

    // For example, you can extract the selected values and store them in state
    const selectedValues = selectedOptions.map((option) => option.value);
    console.log(selectedValues); // Assuming setTeamMembers is a state update function
    setTeamMemberValue(selectedValues);
  };


  const handleMeasureChange = (value) => {
    setTeamMemberValue(value);
    setJobCard({ ...jobCard, measure: value });
    // Additional logic if needed
  };

  //Kpi measures here
  const measure = store.measure.getByUid(jobCard.teamLeader);
  console.log("all me in measures", measure);
  const materialCost = store.jobcard.material.all;

  //calculate material cost
  // test store
  const currentid = jobCard.id;

  // Calculate the total material cost
  const totalMaterialCost = materialCost.reduce((total, material) => {
    return total + material.asJson.unitCost;
  }, 0);

  const users = store.user.all;

  const options: IOption[] = useMemo(
    () =>
      users.map((user) => {
        return {
          label: user.asJson.displayName || "",
          value: user.asJson.uid,
        };
      }),
    [users]
  );
  const measureOptions: IOption[] = useMemo(
    () =>
      measure.map((measure) => {
        return {
          label: measure.asJson.description || "",
          value: measure.asJson.uid,
        };
      }),
    [measure]
  );

  // const taskList = store.jobcard.task.all;
  const materialList = store.jobcard.material.all.map(
    (material) => material.asJson
  );
  const currentMaterialList = materialList.filter(
    (material) => material.jId === jobCard.id
  );

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update the job card object locally
      const updatedJobCard: IJobCard = {
        ...editedJobCard,
        isAllocated: true,
        jobcardCost: totalMaterialCost,
        teamLeader: teamLeaderValue,
        artesian: artesianValue,
        assignedTo: teamLeaderValue,
        teamMembers: teamMemberValue,

        status: "In Progress",
      };

      // Call the API to update the job card with the updated object
      await api.jobcard.jobcard.update(updatedJobCard);
      console.log("jobcard", updatedJobCard);
    } catch (error) {
      // Handle errors appropriately
      console.error("Error submitting form:", error);
    } finally {
      SendEmailNotification();
      onCancel();
      setLoading(false);
      store.jobcard.material.clearSelected();
      store.jobcard.jobcard.clearSelected();
    }
  };

  const onCancel = () => {
    setArtesianValue(""); // State for Artesian input
    setTeamLeaderValue(""); // State for Team Leader input
    setTeamMemberValue([]); // State for Team Member input
    store.jobcard.jobcard.clearSelected();
    store.jobcard.material.clearSelected();
    setJobCard({ ...defaultJobCard });
    hideModalFromId(MODAL_NAMES.EXECUTION.EDITJOBCARD_MODAL);
  };

  // code for adding material
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  // code for adding material
  const [showEditMaterialForm, setShowEditMaterialForm] = useState(false);
  const [newMaterial, setNewMaterial] = useState<IMaterial>({
    ...defaultMaterial,
  });
  const handleAddMaterialClick = () => {
    setShowMaterialForm(true);
  };

  const handleMaterialAdded = async (e) => {
    e.preventDefault();

    // Validate if unit cost or quantity is negative or zero
    if (newMaterial.unitCost <= 0 || isNaN(newMaterial.unitCost)) {
      setUnitCostErrorMessage("Unit cost must be a positive number.");
      return; // Exit function if validation fails
    }

    if (newMaterial.quantity <= 0 || isNaN(newMaterial.quantity)) {
      setQuantityErrorMessage("Quantity must be a positive number.");
      return; // Exit function if validation fails
    }
    const updatedMaterial = { ...newMaterial, jId: jobCard.id };
    try {
      // Create the material on the server
      const id = jobCard.id;
      await api.jobcard.material.create(
        updatedMaterial,
        id
        // jobCard.id
      );

      // Clear the form
      setNewMaterial({ ...defaultMaterial });
    } catch (error) {
      // Handle error appropriately
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false); // Make sure to reset loading state regardless of success or failure
      // onCancel();
    }
    // Clear any previous error messages
    setUnitCostErrorMessage("");
    setQuantityErrorMessage("");

    setShowMaterialForm(false);
  };

  // Define function to handle changes in unit cost
  // State variables
  const [unitCostErrorMessage, setUnitCostErrorMessage] = useState("");
  const [quantityErrorMessage, setQuantityErrorMessage] = useState("");


  // Define function to handle changes in unit cost

  const handleMaterialNameChangeOnEdit = (e) => {
    const value = e.target.value;
    setMaterial({
      ...material,
      name: value,
    });
  };
  const handleUnitCostChangeOnEdit = (value) => {
    // Ensure value is not negative or zero
    if (value <= 0 || isNaN(value)) {
      // Display error message
      setUnitCostErrorMessage("Unit cost must be a positive number.");
      return;
    }
    // Clear error message
    setUnitCostErrorMessage("");
    // Update state with new unit cost value
    setMaterial({
      ...material,
      unitCost: value,
    });
  };
  const handleQuantityChangeOnEdit = (value) => {
    // Ensure value is not negative or zero
    if (value <= 0 || isNaN(value)) {
      // Display error message
      setQuantityErrorMessage("Quantity must be a positive number.");
      return;
    }
    // Clear error message
    setQuantityErrorMessage("");
    // Update state with new quantity value
    setMaterial({
      ...material,
      quantity: value,
    });
  };

  // Function to handle changes for Material Name
  const handleMaterialNameChange = (e) => {
    const value = e.target.value;
    setNewMaterial({
      ...newMaterial,
      name: value,
    });
  };
  const handleUnitCostChange = (value) => {
    // Ensure value is not negative or zero
    if (value <= 0 || isNaN(value)) {
      // Display error message
      setUnitCostErrorMessage("Unit cost must be a positive number.");
      return;
    }
    // Clear error message
    setUnitCostErrorMessage("");
    // Update state with new unit cost value
    setNewMaterial({
      ...newMaterial,
      unitCost: value,
    });
  };
  // Define function to handle changes in quantity
  const handleQuantityChange = (value) => {
    // Ensure value is not negative or zero
    if (value <= 0 || isNaN(value)) {
      // Display error message
      setQuantityErrorMessage("Quantity must be a positive number.");
      return;
    }
    // Clear error message
    setQuantityErrorMessage("");
    // Update state with new quantity value
    setNewMaterial({
      ...newMaterial,
      quantity: value,
    });
  };

  const SendEmailNotification = async () => {
    try {
      const htmlContent = `
      <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0;">
        <div style="max-width: 1200px; margin: 20px auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); padding: 20px; text-align: left;">
          <h2 style="color: #333333; margin-bottom: 10px;">Dear ${getDisplayName(
            jobCard.assignedTo
          )},</h2>
          <!-- Add your simple text content here -->
          <p style="color: #666666; font-size: 14px; margin-top: 10px;">
            <br />
            <br />
            You have been assigned to a job card on the performance management system. Please login to review and get details about the job card.
            <br />
            Kind regards,
            <br />
          </p>
          <p>Please contact us if you have any queries or require further information.</p>
          <p style="color: #666666; font-size: 14px;">Thank you for your business.</p>
          <div style="margin-top: 10px; font-style: italic; color: #999999;">
            <p style="font-size: 12px;">Kind regards,<br />IJG</p>
          </div>
        </div>
      </body>
    `;
      const to = "tebuhoclive14@gmail.com";
      const from = "tebuhoclive14@gmail.com";
      const subject = "PMS Job Card Allocation";

      const response = await fetch(
        "https://us-central1-functions-918c1.cloudfunctions.net/sendNotificationEmail",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            htmlContent: htmlContent,
            subject: subject,
            to: to,
            from: from,
          }),
        }
      );

      if (response.ok) {
        // Email sent successfully
        console.log("Email sent successfully");
      } else {
        // Email sending failed
        console.error("Error sending email:", response.statusText);
      }
    } catch (error) {
      console.error("Error sending email:", error);
    }
  };

  // Function to get the display name based on the assignedTo ID
  const getDisplayName = (assignedToId) => {
    const user = store.user.all.find(
      (user) => user.asJson.uid === assignedToId
    );
    return user ? user.asJson.displayName : "Unknown";
  };


  const onDeleteMaterial = async (e, materialId: string) => {
    e.preventDefault(); // Prevent default form submission behavior

    try {
      // Delete the material on the server
      await api.jobcard.material.delete(materialId, jobCard.id);
    } catch (error) {
      console.error("Error deleting material:", error);
    }
  };
  const onEditMaterial = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    try {
      if (material && jobCard) {
        // Update the material on the server
        await api.jobcard.material.update(material, jobCard.id);
      }
      setShowEditMaterialForm(false);
    } catch (error) {
      console.error("Error updating material:", error);
    }
  };

  const handleEdit = async (material: IMaterial) => {
    if (material) {
      setMaterial(material);
      setShowEditMaterialForm(true);
    }
    try {
    } catch (error) {
      console.error("Error deleting material:", error);
    }
  };


  //Naftal comments
  const businessUnit = store.businessUnit.all;

  const businessUnitOptions: IOption[] = useMemo(
    () =>
      businessUnit.map((bu) => {
        return {
          label: bu.asJson.name || "",
          value: bu.asJson.id,
        };
      }),
    [businessUnit]
  );

  const clients = store.jobcard.client.all;

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



 

  const handleUrgencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEditedJobCard({
      ...editedJobCard,
      urgency: e.target.value as IUrgency,
    });
  };
  // Get today's date in the format YYYY-MM-DD
  const today = new Date().toISOString().split("T")[0];

  const handleSelectedAccount = (value: string) => {
    setEditedJobCard({ ...editedJobCard, clientId: value });
    const selectedClient = store.jobcard.client.getById(value).asJson;

    setEditedClient(selectedClient);
    // Additional logic if needed
  };

  const getDivisionName = (divisionId) => {
    const division = store.jobcard.division.all.find(
      (unit) => unit.asJson.id === divisionId
    );
    return division ? division.asJson.name : "Unknown";
  };

  const getSectionName = (secId) => {
    const section = store.jobcard.section.all.find(
      (section) => section.asJson.id === secId
    );
    return section ? section.asJson.name : "Unknown";
  };
  // Define a function to handle changes to the due date
  const handleDateChange = (newDate: number) => {
    console.log("new date", newDate);

    setEditedJobCard({
      ...editedJobCard,
      dueDate: newDate,
    });
  };

  const division = store.jobcard.division.all;
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

  const handleDivisionOptions = (value: string) => {
    setEditedJobCard({ ...editedJobCard, division: value });
    // Additional logic if needed
  };
  const handleSectionOptions = (value: string) => {
    setEditedJobCard({ ...editedJobCard, section: value });
    // Additional logic if needed
  };
  //filter users
 
  // Filter departments based on jobCard.division value
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
   const handleUserOptions = (value: string) => {
     setEditedJobCard({ ...editedJobCard, assignedTo: value });

     // Additional logic if needed
   };
  const section = store.jobcard.section.all;

  const filteredSection = section.filter(
    (section) => section.asJson.division === editedJobCard.division
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


  const handleAddClient  = async (event) => {
  event.preventDefault(); // Prevent default form submission behavior
  try
  {await api.jobcard.client.create(client)

  }
  catch{}
  // Add your logic for marking as completed here
    setAddNewClient(false);
};
  



  const handleAddMaterialClient = (event) => {
    event.preventDefault();
    setAddNewClient(true);
  };
  useEffect(() => {
    if (jobCard) {
      setEditedJobCard(jobCard);
        setEditedJobCard(jobCard);
    }
  }, [jobCard]);

  useEffect(() => {
    const selectedJobCard = store.jobcard.jobcard.selected;
    if (selectedJobCard) {
      setJobCard(selectedJobCard);
      if (jobCard.clientId) {
          const currentClient=store.jobcard.client.getById(jobCard.clientId).asJson
        setClient(currentClient);
      }
    

    }
    const loadData = async () => {
      await api.user.getAll();
      await api.jobcard.jobcard.getAll;
      const id = jobCard.id;
      if (id) {
        console.log("id is true");
        await api.jobcard.material.getAll(id);
      }
      await api.measure.getAll();
      await api.department.getAll();
          await api.jobcard.client.getAll();
    };
    loadData();
  }, [
    api.user,
    api.jobcard,
    api.department,
    store.jobcard.jobcard.selected,
    api.measure,
    jobCard,
  ]);

  return (
    <ErrorBoundary>
      <div
        className="view-modal custom-modal-style uk-modal-dialog uk-modal-body uk-width-1-2"
        style={{ width: "80%" }}>
        <button
          className="uk-modal-close-default"
          onClick={onCancel}
          disabled={loading}
          type="button"
          data-uk-close></button>
        {/* <h3 className="main-title-small text-to-break"> Job Card Allocation</h3> */}
        <span style={{ fontSize: "1.4rem", fontWeight: "bold" }}>
          Job Card Management and allocation
        </span>
        <hr />

        <div className="uk-grid">
          <div className="uk-width-1-3">
            {jobCard && (
              <div className="uk-width-1-1 uk-margin-medium-top">
                <h4 style={{ fontWeight: "bold" }}>Job Card Details</h4>

                <table className="uk-table uk-table-small uk-table-divider custom-table">
                  <tbody>
                    <tr className="custom-row">
                      <td>Assigned To:</td>
                      <td>{getDisplayName(teamLeaderValue)}</td>
                    </tr>
                    <tr className="custom-row">
                      <td>Section:</td>
                      <td>{getSectionName(jobCard.section)}</td>
                    </tr>
                    <tr className="custom-row">
                      <td>Division</td>
                      <td>{getDivisionName(jobCard.division)}</td>
                    </tr>
                    <tr className="custom-row">
                      <td>Urgency</td>
                      <td>{jobCard.urgency}</td>
                    </tr>
                    <tr className="custom-row">
                      <td>Unique ID</td>
                      <td>{jobCard.uniqueId}</td>
                    </tr>
                    <tr className="custom-row">
                      <td>Task Description</td>
                      <td>{jobCard.taskDescription}</td>
                    </tr>
                    <tr className="custom-row">
                      <td>Due Date</td>
                      <td>{dateFormat_YY_MM_DY(jobCard.dueDate)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
            {jobCard && (
              <div className="uk-width-1-1 uk-margin-large-top">
                <h4 style={{ fontWeight: "bold" }}>Job Card Client Details</h4>

                <table className="uk-table uk-table-small uk-table-divider custom-table">
                  <tbody>
                    <tr className="custom-row">
                      <td>Full Name:</td>
                      <td>{editedClient.name}</td>
                    </tr>
                    <tr className="custom-row">
                      <td>Address :</td>
                      <td>{editedClient.physicalAddress}</td>
                    </tr>
                    <tr className="custom-row">
                      <td>Phone No.</td>
                      <td>{editedClient.mobileNumber}</td>
                    </tr>
                    <tr className="custom-row">
                      <td>Email</td>
                      <td>{editedClient.email}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="dialog-content uk-position-relative uk-width-2-3">
            <form
              className="uk-form uk-grid uk-grid-small"
              onSubmit={handleSubmit}>
              <CustomTransactionOpenAccordion
                title={" Edit Created Job Card Details"}>
                <div className="uk-form uk-grid uk-grid-small" data-uk-grid>
                  <div className="uk-grid uk-width-1-1">
                    <h4>Job Card Details</h4>
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
                        value={editedJobCard.division}
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
                      value={editedJobCard.section}
                    />
                  </div>
                  <div className="uk-width-1-2 form-section">
                    <label htmlFor="issuedDate" className="form-label">
                      Assign to
                    </label>
                    <SingleSelect
                      name="search-team"
                      options={userOptions}
                      onChange={handleUserOptions}
                      placeholder="Assign"
                      value={editedJobCard.assignedTo}
                    />
                  </div>
                  <div className="uk-width-1-2 form-section">
                    <label htmlFor="issuedDate" className="form-label">
                      Urgency
                    </label>
                    <select
                      className="uk-select uk-form-small"
                      id="urgency"
                      value={jobCard.urgency}
                      onChange={handleUrgencyChange}>
                      <option value="Normal">Normal</option>
                      <option value="Urgent">Urgent</option>
                      <option value="Very Urgent">Very Urgent</option>
                    </select>
                  </div>
                  <div className="uk-width-1-2 form-section">
                    <label htmlFor="issuedDate" className="form-label"></label>
                    <input
                      className="uk-input uk-form-small"
                      id="dueDate"
                      type="date"
                      name="dueDate"
                      value={dateFormat_YY_MM_DY(jobCard.dueDate) || ""}
                      onChange={(e) => handleDateChange(e.target.valueAsNumber)}
                      min={today} // Set the minimum date to today's date
                    />
                  </div>
                  <div className="uk-width-1-1 form-section">
                    <label htmlFor="taskDescription" className="form-label">
                      Task Description
                    </label>
                    <textarea
                      className="uk-textarea uk-form-small"
                      placeholder="Task Description"
                      rows={3}
                      id="taskDescription"
                      value={editedJobCard.taskDescription}
                      name="taskDescription"
                      onChange={(e) =>
                        setEditedJobCard({
                          ...editedJobCard,
                          taskDescription: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="uk-width-1-1">
                    <h4 className="section-title">Client Details</h4>
                  </div>
                  <div className="uk-grid uk-width-1-1" data-uk-grid>
                    <div className="uk-width-expand">
                      <div className="uk-form-controls">
                        <label className="uk-form-label" htmlFor="client">
                          Select A Client
                          <span className="uk-text-danger">*</span>
                        </label>
                        <SingleSelect
                          name="search-team"
                          options={clientOptions}
                          onChange={handleSelectedAccount}
                          placeholder="Select Client"
                          value={editedJobCard.assignedTo}
                        />
                      </div>
                    </div>
                    <div className="uk-width-auto">
                      {/* <button
                        className="btn btn-primary"
                        onClick={handleAddMaterialClient}>
                        Add New Client
                      </button> */}
                      <ButtonSecondary
                        text=" Add New Client"
                        type="button"
                        onClick={handleAddMaterialClient}
                        buttonType="dark-theme" // Dark theme button
                        disabled={loading}
                      />
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
                          value={editedClient.name}
                          required
                        />
                      </div>
                      <div className="uk-width-1-2 form-section">
                        <label htmlFor="issuedDate" className="form-label">
                          Cellphone Number
                        </label>
                        <input
                          type="tel"
                          className="uk-input uk-form-small"
                          id="clientMobile"
                          placeholder="Cellphone"
                          value={editedClient.mobileNumber}
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
                          Cellphone Number (Secondary)
                          <span className="uk-text-danger">*</span>
                        </label>
                        <input
                          type="tel"
                          className="uk-input uk-form-small"
                          id="clientSecondaryMobile"
                          placeholder="Cellphone"
                          value={editedClient.secondaryMobile}
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
                          Physical Address
                          <span className="uk-text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="uk-input uk-form-small"
                          id="clientAddress"
                          placeholder="Address"
                          value={editedClient.physicalAddress}
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
                          value={editedClient.email}
                        />
                      </div>
                    </>
                  )}
                  {addNewClient === true && (
                    <>
                      <div className="uk-width-1-2 form-section">
                        <label htmlFor="issuedDate" className="form-label">
                          Full Name<span className="uk-text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="uk-input uk-form-small"
                          id="newClientFullName"
                          placeholder="Full Name"
                          value={client.name}
                          onChange={(e) =>
                            setClient({
                              ...client,
                              name: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="uk-width-1-2 form-section">
                        <label htmlFor="issuedDate" className="form-label">
                          Cellphone Number
                        </label>
                        <input
                          type="tel"
                          className="uk-input uk-form-small"
                          id="newClientMobile"
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
                            setClient({
                              ...client,
                              mobileNumber: formattedInput,
                            });
                          }}
                          pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                          title="Please enter a valid cellphone number (e.g., XXX-XXX-XXXX)"
                        />
                      </div>
                      <div className="uk-width-1-2 form-section">
                        <label htmlFor="issuedDate" className="form-label">
                          Cellphone Number (Secondary)
                        </label>
                        <input
                          type="tel"
                          className="uk-input uk-form-small"
                          id="newClientSecondaryMobile"
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
                            setClient({
                              ...client,
                              telephone: formattedInput,
                            });
                          }}
                          pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                          title="Please enter a valid cellphone number (e.g., XXX-XXX-XXXX)"
                        />
                      </div>
                      <div className="uk-width-1-2 form-section">
                        <label htmlFor="issuedDate" className="form-label">
                          Physical Address
                        </label>
                        <input
                          type="text"
                          className="uk-input uk-form-small"
                          id="newClientAddress"
                          placeholder="Address"
                          value={client.physicalAddress}
                          onChange={(e) =>
                            setClient({
                              ...client,
                              physicalAddress: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="uk-width-1-2 form-section">
                        <label htmlFor="issuedDate" className="form-label">
                          Client Email
                        </label>
                        <input
                          type="email"
                          className="uk-input uk-form-small"
                          id="newClientEmail"
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
                      <div
                        className="uk-width-1-1 uk-text-right"
                        style={{ marginTop: "10px" }}>
                        {/* <button
                          className="btn btn-primary"
                          onClick={handleAddClient}>
                          Save Client
                        </button> */}
                        <ButtonSecondary
                        text="Save Client"
                        type="button"
                        onClick={handleAddClient}
                        buttonType="dark-theme" // Dark theme button
                        disabled={loading}
                      />
                      </div>
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
                      value={editedJobCard.typeOfWork}
                      onChange={(e) =>
                        setEditedJobCard({
                          ...editedJobCard,
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
                      value={editedJobCard.remark}
                      name={"remark"}
                      onChange={(e) =>
                        setEditedJobCard({
                          ...editedJobCard,
                          remark: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </CustomTransactionOpenAccordion>

              <CustomTransactionOpenAccordion
                title={" Edit Job Card Allocation Detail"}>
                <>
                  <div className="uk-grid uk-grid-small" data-uk-grid>
                    <div className="uk-width-1-2 form-section">
                      <label htmlFor="issuedDate" className="form-label">
                        Owner
                      </label>
                      <div className="uk-form-controls">
                        <SingleSelect
                          name="search-team"
                          options={options}
                          onChange={handleArtesianChange}
                          placeholder="Search by name"
                          value={artesianValue}
                          required
                        />
                      </div>
                    </div>

                    <div className="uk-width-1-2 form-section">
                      <label htmlFor="issuedTime" className="form-label">
                        Team Leader
                      </label>
                      <div className="uk-form-controls">
                        <SingleSelect
                          name="search-team"
                          options={options}
                          onChange={handleTeamLeaderChange}
                          placeholder="Search by name"
                          value={teamLeaderValue}
                        />
                      </div>
                    </div>

                    <div className="uk-width-1-2 form-section">
                      <label htmlFor="issuedTime" className="form-label">
                        Please select your aligned KPI{" "}
                        <span className="uk-text-danger">*</span>
                      </label>
                      <div className="uk-form-controls">
                        <SingleSelect
                          name="search-team"
                          options={measureOptions}
                          onChange={handleMeasureChange}
                          placeholder="Select KPI"
                          value={jobCard.measure}
                        />
                      </div>
                    </div>

                    <div className="uk-width-1-2 form-section">
                      <label htmlFor="issuedTime" className="form-label">
                        Select team Member(s){" "}
                        <span className="uk-text-danger">*</span>
                      </label>
                      <div className="uk-form-controls">
                        <Select
                          defaultValue={[]}
                          isMulti
                          name="colors"
                          options={options}
                          className="basic-multi-select"
                          classNamePrefix="select"
                          onChange={handleTeamMemberChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="uk-width-1-1">
                    <h3 className="section-title">Expenses List</h3>
                    {/* <MaterialsGrid data={materialList} jobCard={jobCard} /> */}
                    <MaterialTable
                      materialList={currentMaterialList}
                      handleEdit={handleEdit}
                      onDeleteMaterial={onDeleteMaterial}
                      defaultPage={1} // Specify the default page number
                      defaultItemsPerPage={5} // Specify the default items per page
                    />
                    {!showMaterialForm && jobCard.isAllocated !== true && (
                      <div
                        className="uk-width-1-1 uk-text-right"
                        style={{ marginTop: "20px" }}>
                        <button
                          className="btn btn-primary uk-margin"
                          onClick={handleAddMaterialClick}>
                          <span>Add Expense&nbsp;&nbsp;</span>
                          <FontAwesomeIcon
                            icon={faPlus}
                            className="icon uk-margin-small-right"
                          />
                        </button>
                      </div>
                    )}
                    {showEditMaterialForm && (
                      <div>
                        <h4 className="section-title">Edit Expense Form</h4>
                        <div>
                          <div className="uk-margin">
                            <label
                              className="uk-form-label"
                              htmlFor="materialName">
                              Expense Name:
                            </label>
                            <input
                              type="text"
                              id="materialName"
                              name="name"
                              value={material.name}
                              onChange={(value) =>
                                handleMaterialNameChangeOnEdit(value)
                              }
                              className="uk-input"
                            />
                          </div>
                          <div className="uk-form-controls uk-width-1-1 uk-margin-bottom">
                            <label
                              className="uk-form-label required"
                              htmlFor="amount">
                              Cost Amount (min N$ 1 000.00)
                            </label>
                            <NumberInput
                              id="amount"
                              className="auto-save uk-input purchase-input uk-form-small"
                              placeholder="-"
                              value={material.unitCost}
                              onChange={(value) =>
                                handleUnitCostChangeOnEdit(value)
                              }
                              decimalScale={2}
                            />
                            {unitCostErrorMessage && (
                              <div className="uk-alert-danger" data-uk-alert>
                                <p>{unitCostErrorMessage}</p>
                              </div>
                            )}
                          </div>
                          <div className="uk-margin">
                            <label
                              className="uk-form-label"
                              htmlFor="materialQuantity">
                              Quantity:
                            </label>
                            <NumberInput
                              id="materialQuantity"
                              className="uk-input"
                              value={material.quantity}
                              onChange={(value) =>
                                handleQuantityChangeOnEdit(value)
                              }
                            />
                            {quantityErrorMessage && (
                              <div className="uk-alert-danger" data-uk-alert>
                                <p>{quantityErrorMessage}</p>
                              </div>
                            )}
                          </div>

                          {/* <button
                            onClick={onEditMaterial}
                            className="btn btn-primary">
                            Edit Material
                          </button> */}
                          <ButtonSecondary
                        text="Edit Expense"
                        type="button"
                        onClick={onEditMaterial}
                        buttonType="dark-theme" // Dark theme button
                        disabled={loading}
                      />
                        </div>
                      </div>
                    )}
                    {showMaterialForm && (
                      <div>
                        <h4 className="section-title">Add New Expense</h4>
                        <div>
                          <div className="uk-margin uk-width-1-1">
                            <label
                              className="uk-form-label"
                              htmlFor="materialName">
                              Expense Name:
                            </label>
                            <input
                              type="text"
                              id="materialName"
                              name="name"
                              value={newMaterial.name}
                              onChange={handleMaterialNameChange}
                              className="uk-input"
                            />
                          </div>
                          <div className="uk-form-controls uk-width-1-1 uk-margin-bottom">
                            <label
                              className="uk-form-label required"
                              htmlFor="amount">
                              Cost Amount (min N$ 1 000.00)
                            </label>
                            <NumberInput
                              id="amount"
                              className="auto-save uk-input purchase-input uk-form-small"
                              placeholder="-"
                              value={newMaterial.unitCost}
                              onChange={(value) => handleUnitCostChange(value)}
                              decimalScale={2}
                            />
                            {unitCostErrorMessage && (
                              <div className="uk-alert-danger" data-uk-alert>
                                <p>{unitCostErrorMessage}</p>
                              </div>
                            )}
                          </div>
                          <div className="uk-margin">
                            <label
                              className="uk-form-label"
                              htmlFor="materialQuantity">
                              Quantity:
                            </label>
                            <NumberInput
                              id="materialQuantity"
                              className="uk-input"
                              value={newMaterial.quantity}
                              onChange={(value) => handleQuantityChange(value)}
                            />
                            {quantityErrorMessage && (
                              <div className="uk-alert-danger" data-uk-alert>
                                <p>{quantityErrorMessage}</p>
                              </div>
                            )}
                          </div>

                          <button
                            onClick={handleMaterialAdded}
                            className="btn btn-primary">
                            Add Expense
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="uk-margin uk-width-1-1">
                    <label htmlFor="remarks">Remarks:</label>
                    <textarea
                      id="remarks"
                      className="uk-textarea"
                      placeholder="Enter remarks..."
                      value={jobCard.comment}
                      onChange={(e) =>
                        setJobCard({ ...jobCard, comment: e.target.value })
                      }
                    />
                  </div>
                </>
              </CustomTransactionOpenAccordion>

              <div
                className="uk-width-1-1 uk-text-right"
                style={{ marginTop: "20px" }}>
                <div
                  className="uk-width-1-1 uk-text-right"
                  style={{ marginTop: "10px" }}>
                  {/* <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={loading}>
                    Update
                    {loading && <div data-uk-spinner="ratio: .5"></div>}
                  </button> */}
                  <ButtonSecondary
                        text="Save"
                        type="submit"
                      
                        buttonType="dark-theme" // Dark theme button
                        disabled={loading}
                      />
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
});

export default UpdatedJobCardModal;
