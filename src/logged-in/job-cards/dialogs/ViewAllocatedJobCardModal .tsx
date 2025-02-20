// Step2.tsx
// UpdateJobCard.tsx
import { observer } from "mobx-react-lite";
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, FormEvent } from "react";
import { useAppContext } from "../../../shared/functions/Context";
import logo from "../images/logo512.png";
import MODAL_NAMES from "../../dialogs/ModalName";
import showModalFromId, {
  hideModalFromId,
} from "../../../shared/functions/ModalShow";
import {
  IJobCard,
  defaultJobCard,
} from "../../../shared/models/job-card-model/Jobcard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import ErrorBoundary from "../../../shared/components/error-boundary/ErrorBoundary";

import MaterialTable from "../grids/MaterialTable";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { dateFormat_YY_MM_DD, dateFormat_YY_MM_DY } from "../../shared/utils/utils";
import {
  IClient,
  defaultClient,
} from "../../../shared/models/job-card-model/Client";
import { Height } from "@mui/icons-material";

import ButtonSecondary from "../create-jobcard/ButtonSecondary";
const ViewAllocatedJobCardModal = observer(() => {
  const [jobCard, setJobCard] = useState<IJobCard>({ ...defaultJobCard });
  const [client, setClient] = useState<IClient>({ ...defaultClient });

  // Additional state or logic specific to Step 2

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { api, store } = useAppContext();

  // const handleTeamMemberChange = (value) => {
  //   setTeamMemberValue(value);
  //   setJobCard({ ...jobCard, teamMember: value });
  //   // Additional logic if needed
  // };
  const handleTeamMemberChange = (selectedOptions) => {
    // selectedOptions is an array containing the selected option objects
    // You can access the selected values and perform any necessary actions

    // For example, you can extract the selected values and store them in state
    const selectedValues = selectedOptions.map((option) => option.value);
    console.log(selectedValues); // Assuming setTeamMembers is a state update function
  };

  //Kpi measures here
  const measure = store.measure.getByUid(jobCard.teamLeader);
  console.log("all me in measures", measure);
  const materialCost = store.jobcard.material.all;

  //calculate material cost

  // Calculate the total material cost
  const totalMaterialCost = materialCost.reduce((total, material) => {
    return total + material.asJson.unitCost;
  }, 0);

  const users = store.user.all;

  const currentMeasure = store.measure;

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
      const updatedJobCard = {
        ...jobCard,
        isAllocated: true,
        jobcardCost: totalMaterialCost,
      };

      // Call the API to update the job card with the updated object
      await api.jobcard.jobcard.update(updatedJobCard);
      console.log("jobcard", updatedJobCard);
    } catch (error) {
      // Handle errors appropriately
      console.error("Error submitting form:", error);
    } finally {
      onCancel();
      setLoading(false);
    }
  };

  // Function to get base64 image from URL
  const getBase64ImageFromURL = (url: string) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.setAttribute("crossOrigin", "anonymous");

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0);

        const dataURL = canvas.toDataURL("image/png");

        resolve(dataURL);
      };

      img.onerror = (error) => {
        reject(error);
      };

      img.src = url;
    });
  };

  // Register fonts with pdfMake
  pdfMake.vfs = pdfFonts.pdfMake.vfs;

  const generatePDF = async () => {
    const dataURL = await getBase64ImageFromURL(logo);

    const docDefinition: any = {
      pageSize: "A4", // Or any other page size
      pageMargins: [40, 60, 40, 100], // Adjust the margins as needed
      footer: function () {
        return {
          stack: [
            {
              canvas: [
                {
                  type: "line",
                  x1: 0,
                  y1: 0,
                  x2: 595.28, // Assuming A4 paper size (595.28 points width)
                  y2: 0,
                  lineWidth: 1,
                  color: "black",
                },
              ],
              margin: [0, 0, 0, 0], // Increase bottom margin
            },
            {
              text: "All official correspondence must be addressed to the Chief Executive Officer",
              alignment: "center",
              fontSize: 10,
              bold: true,
              margin: [0, 5, 0, 0], // Increase bottom margin
              color: "black",
            },
            {
              text: "Oranjemund Town Council\nTel: +264 66 258 089\nFax: +264 (0) 66 258 000 / +264 66 258 091\nE-mail: info@Oranjemund.com.na\nP. O. Box 6004, Oranjemund, Namibia",
              alignment: "left",
              fontSize: 10,
              bold: true,
              color: "black",
              margin: [0, 10, 0, 0], // Increase bottom margin
            },
          ],
          margin: [20, 20], // Adjust margins as needed
          height: 100, // Set a fixed height for the footer
        };
      },

      content: [
        {
          columns: [
            {
              image: dataURL,
              fit: [100, 100], // Adjust fit as needed
              alignment: "center",
            },
          ],
        },
        {
          text: "JOB CARD FOR MUNICIPAL SERVICES",
          style: "header",
          fontSize: 10,
        },
        {
          text: "(E.g Roads, water, sewerage reticulations/connections, and other repairs)",
          alignment: "center", // Align the text to the center
          style: "italic",
          fontSize: 10,
        },
        {
          columns: [
            { width: "*", text: "" }, // Empty cell to push the next column to the right
            {
              text: "Job Card Tittle: " + jobCard.uniqueId,
              fontSize: 9,
              alignment: "center",
            },
            { width: "*", text: "" }, // Empty cell to push the next column to the right
          ],
        },
        {
          columns: [
            { width: "*", text: "" }, // Empty cell to push the next column to the right
            {
              text: "Date Logged: " + dateFormat_YY_MM_DY(jobCard.dateIssued),
              alignment: "center",
              fontSize: 9,
            },
            { width: "*", text: "" }, // Empty cell to push the next column to the right
          ],
        },
        "\n",
        {
          columns: [
            {
              width: "100%",
              table: {
                widths: ["30%", "70%"],
                body: [
                  [
                    {
                      text: "JOB CARD DETAILS",
                      colSpan: 2,
                      bold: true,
                      alignment: "center",
                      fillColor: "#EEEB57",
                      fontSize: 10,
                    },
                    {}, // Empty cell for colSpan
                  ],
                  [
                    { text: "Assigned To:", fontSize: 9 },
                    { text: getDisplayName(jobCard.assignedTo), fontSize: 9 },
                  ],
                  [
                    { text: "Section:", fontSize: 9 },
                    { text: getSectionName(jobCard.section), fontSize: 9 },
                  ],
                  [
                    { text: "Division:", fontSize: 9 },
                    { text: getDivisionName(jobCard.division), fontSize: 9 },
                  ],
                  [
                    { text: "Urgency:", fontSize: 9 },
                    { text: jobCard.urgency, fontSize: 9 },
                  ],
                  [
                    { text: "Task Description:", fontSize: 9 },
                    { text: jobCard.taskDescription, fontSize: 9 },
                  ],
                  [
                    { text: "Due Date:", fontSize: 9 },
                    {
                      text: dateFormat_YY_MM_DD(jobCard.dueDate),
                      fontSize: 9,
                    },
                  ],
                ],
              },
              fontSize: 8,
              margin: [0, 10, 0, 0],
              headerRows: 1,
              dontBreakRows: true,
            },
          ],
        },
        "\n",
        {
          columns: [
            // First Table: Team Details
            {
              width: "50%",
              table: {
                widths: ["30%", "60%"],
                body: [
                  [
                    {
                      text: "CLIENT DETAILS",
                      colSpan: 2,
                      bold: true,
                      alignment: "center",
                      fillColor: "#EEEB57",
                      fontSize: 10,
                    },
                    {}, // Empty cell for colSpan
                  ],
                  [
                    { text: "Full Name:", fontSize: 9 },
                    { text: client.name, fontSize: 9 },
                  ],
                  [
                    { text: "Address:", fontSize: 9 },
                    { text: client.address, fontSize: 9 },
                  ],
                  [
                    { text: "Phone No.:", fontSize: 9 },
                    { text: client.mobileNumber, fontSize: 9 },
                  ],
                  [
                    { text: "Email:", fontSize: 9 },
                    { text: client.email, fontSize: 9 },
                  ],
                ],
              },
              fontSize: 8,
              margin: [0, 10, 0, 0],
              headerRows: 1,
              dontBreakRows: true,
            },
            {
              width: "50%",
              table: {
                widths: ["30%", "70%"],
                body: [
                  [
                    {
                      text: "TEAM DETAILS",
                      colSpan: 2,
                      bold: true,
                      alignment: "center",
                      fillColor: "#EEEB57",
                      fontSize: 10,
                    },
                    {}, // Empty cell for colSpan
                  ],
                  [
                    { text: "KPI Measure:", fontSize: 9 },
                    { text: jobCard.measure, fontSize: 9 },
                  ],
                  [
                    { text: "Team Leader:", fontSize: 9 },
                    { text: getDisplayName(jobCard.teamLeader), fontSize: 9 },
                  ],
                  [
                    { text: "Artesian:", fontSize: 9 },
                    { text: getDisplayName(jobCard.artesian), fontSize: 9 },
                  ],
                  [
                    { text: "Team Members:", fontSize: 9 },
                    {
                      ul: jobCard.teamMembers.map((member) => ({
                        text: getDisplayTeamMemberName(member),
                      })),
                    },
                  ],
                ],
              },
              fontSize: 8,
              margin: [0, 10, 0, 0],
              headerRows: 1,
              dontBreakRows: true,
            },
          ],
        },
        "\n",
        "\n",
        {
          width: "50%",
          table: {
            headerRows: 1,
            widths: ["30%", "40%", "30%"], // Adjust column widths as needed
            body: [
              [
                {
                  text: "MATERIAL DETAILS",
                  colSpan: 3,
                  bold: true,
                  alignment: "center",
                  fillColor: "#EEEB57",
                  fontSize: 10,
                },
                {}, // Empty cell for colSpan
                {}, // Empty cell for colSpan
              ],
              [
                { text: "Name", style: "", fontSize: 9 },
                { text: "Quantity", style: "tableHeader", fontSize: 9 },
                { text: "Unit Cost", style: "tableHeader", fontSize: 9 },
              ],
              ...currentMaterialList.map((material) => [
                { text: material.name, fontSize: 9 },
                { text: material.quantity, fontSize: 9 },
                {
                  text: `N$${material.unitCost}`,
                  fontSize: 9,
                  alignment: "right",
                },
              ]),
            ],
          },
          layout: {
            hLineWidth: () => 0.1, // Adjust the thickness of horizontal lines
            vLineWidth: () => 0.1, // Adjust the thickness of vertical lines
          },
          margin: [0, 10, 0, 10],
          fontSize: 8,
          style: "table",
        },
        "\n",
        "\n",
        {
          text: "Head of Department: ..........................................................................................................                       Date:....................................",
          fontSize: 9,
        },
        "\n",
        {
          text: "Property owners Signature after Job Completion.................................................................                   Date:....................................",
          fontSize: 9,
        },
        "\n",
        "\n",
        {
          text: "Remark....................................................................................................................................................................................................       ",
          fontSize: 9,
        },
      ],
      styles: {
        header: {
          fontSize: 10,
          bold: true,
          alignment: "center",
          margin: [0, 0, 0, 10],
        },
        italic: {
          fontStyle: "italic",
          margin: [0, 0, 0, 10],
        },
        remarks: {
          margin: [0, 10, 0, 0],
        },
        tableHeader: {
          bold: true,
        },
      },
    };

    // Now you can use this docDefinition to generate your PDF document

    pdfMake.createPdf(docDefinition).download("job_card.pdf");
  };

  const onCancel = () => {
    store.jobcard.jobcard.clearSelected();
    store.jobcard.material.clearSelected();
    setJobCard({ ...defaultJobCard });
    hideModalFromId(MODAL_NAMES.EXECUTION.VIEWALLOCATEDJOBCARD_MODAL);
  };

  // code for adding material
  const [showMaterialForm, setShowMaterialForm] = useState(false);

  const handleAddMaterialClick = () => {
    setShowMaterialForm(true);
  };

  // Function to handle changes for Material Name

  // Define function to handle changes in unit cost
  // State variables

  // Function to get the display name based on the assignedTo ID
  const getDisplayName = (assignedToId) => {
    const user = store.user.all.find(
      (user) => user.asJson.uid === assignedToId
    );
    return user ? user.asJson.displayName : "Unknown";
  };

  const getDisplayTeamMemberName = (assignedToId) => {
    const member = store.jobcard.teamMember.all.find(
      (member) => member.asJson.id === assignedToId
    );
    return member ? member.asJson.name : "Unknown";
  };

  const onDeleteMaterial = async (materialId: string) => {
    try {
      // Delete the material on the server
      await api.jobcard.material.delete(materialId, jobCard.id);
    } catch (error) {
      console.error("Error deleting material:", error);
    }
  };

  const handleEdit = async (materialId: string) => {
    if (materialId) {
      const currentMaterial = store.jobcard.material.getById(materialId).asJson;
      store.jobcard.material.select(currentMaterial);
      store.jobcard.jobcard.select(jobCard);
    }
    try {
      showModalFromId(MODAL_NAMES.EXECUTION.ONEDITMATERIAL_MODAL);
    } catch (error) {
      console.error("Error deleting material:", error);
    }
  };

  const handleDeleteJobCard = async () => {
    try {
      // Confirm deletion with the user
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this job card?"
      );

      if (confirmDelete) {
        // Proceed with deletion if user confirms
        const updated: IJobCard = { ...jobCard, status: "Deleted" };
        if (jobCard) {
          await api.jobcard.jobcard.update(updated);
        }
        onCancel();
      }
    } catch (error) {
      console.error("Error deleting material:", error);
    }
  };

  const handleMarkAsCompleted = async () => {
    const UpdateJobCard: IJobCard = {
      ...jobCard,
      status: "Completed",
      dateCompleted: Date.now(),
    };

    try {
      await api.jobcard.jobcard.update(UpdateJobCard);
      console.log("Completed", UpdateJobCard);
    } finally {
      onCancel();
    }
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

  useEffect(() => {
    const selectedJobCard = store.jobcard.jobcard.selected;
    if (selectedJobCard) {
      setJobCard(selectedJobCard);

      if (jobCard.clientId) {
        const selectedClient = store.jobcard.client.getById(jobCard.clientId);
        if (selectedClient) {
          setClient(selectedClient.asJson);
        }
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
    };
    loadData();
  }, [
    api.user,
    api.jobcard,
    api.department,
    store.jobcard.jobcard.selected,
    api.measure,
    jobCard,
    store.jobcard.client,
  ]);

  const handleOnEditJobCard = () => {
    store.jobcard.jobcard.select(jobCard);

    showModalFromId(MODAL_NAMES.EXECUTION.EDITJOBCARD_MODAL);
  };
  //  const getBusinessUnitName = (businessId) => {
  //    const unit = store.businessUnit.all.find(
  //      (unit) => unit.asJson.id === businessId
  //    );
  //    return unit ? unit.asJson.name : "Unknown";
  //  };

  //  const getDepartmentName = (deptId) => {
  //    const dept = store.department.all.find(
  //      (user) => user.asJson.id === deptId
  //    );
  //    return dept ? dept.asJson.name : "Unknown";
  //  };

  return (
    <ErrorBoundary>
      <div
        className="view-modal custom-modal-style uk-modal-dialog uk-modal-body uk-width-1-2"
        style={{ width: "80%" }}
      >
        <button
          className="uk-modal-close-default"
          onClick={onCancel}
          disabled={loading}
          type="button"
          data-uk-close
        ></button>
        {/* <h3 className="main-title-small text-to-break">
          {" "}
          Job Card Allocation view
        </h3> */}
        <span style={{ fontSize: "1.4rem", fontWeight: "bold" }}>
          Allocated Job Card Form
        </span>
        <hr />

        <div className="dialog-content uk-position-relative uk-width-1-1">
          <h4 className="uk-text-bold"> </h4>

          <form
            className="uk-form uk-grid uk-grid-small"
            onSubmit={handleSubmit}
          >
            <>
              <div className="uk-width-1-2">
                {jobCard && (
                  <div className="uk-width-1-1 ">
                    <h4 style={{ fontWeight: "bold" }}>Job Card Details</h4>

                    <table className="uk-table uk-table-small uk-table-divider custom-table">
                      <tbody>
                        <tr className="custom-row">
                          <td>Assigned To:</td>
                          <td>{getDisplayName(jobCard.teamLeader)}</td>
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
              </div>

              <div className="uk-width-1-2 uk-margin-medium-top ">
                <div
                  className="uk-grid uk-grid-small uk-margin-left"
                  data-uk-grid
                >
                  <div className="uk-width-1-1">
                    <h4 style={{ fontWeight: "bold" }}>Team Details</h4>
                  </div>
                  <div className="uk-width-1-1">
                    <table className="uk-table uk-table-small uk-table-divider custom-table">
                      <tbody>
                        <tr className="custom-row">
                          <td>Assigned To:</td>
                          <td>{getDisplayName(jobCard.teamLeader)}</td>
                        </tr>
                        <tr className="custom-row">
                          <td>Team Leader:</td>
                          <td>{getDisplayName(jobCard.teamLeader)}</td>
                        </tr>
                        <tr className="custom-row">
                          <td>Owner:</td>
                          <td>{getDisplayName(jobCard.artesian)}</td>
                        </tr>
                        <tr className="custom-row">
                          <td>Members:</td>
                          <td>
                            {jobCard.teamMembers
                              .map((id) => getDisplayTeamMemberName(id))
                              .join(", ")}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              {jobCard && (
                <div className="uk-width-1-2 uk-margin-large-top">
                  <h4 style={{ fontWeight: "bold" }}>
                    Job Card Client Details
                  </h4>

                  <table className="uk-table uk-table-small uk-table-divider custom-table">
                    <tbody>
                      <tr className="custom-row">
                        <td>Full Name:</td>
                        <td>{client.name}</td>
                      </tr>
                      <tr className="custom-row">
                        <td>Address :</td>
                        <td>{client.physicalAddress}</td>
                      </tr>
                      <tr className="custom-row">
                        <td>Phone No.</td>
                        <td>{client.mobileNumber}</td>
                      </tr>
                      <tr className="custom-row">
                        <td>Email</td>
                        <td>{client.email}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </>

            <div className="uk-width-1-2 uk-margin-medium-top">
              <h3 style={{ fontWeight: "bold" }}>Expenses List</h3>
              {/* <MaterialsGrid data={materialList} jobCard={jobCard} /> */}
              <MaterialTable
                materialList={currentMaterialList}
                handleEdit={handleEdit}
                onDeleteMaterial={onDeleteMaterial}
                showActions={false}
                showPagination={false} // Pass showActions prop with value false to hide the Actions column
              />
              {!showMaterialForm && jobCard.isAllocated !== true && (
                <div
                  className="uk-width-1-1 uk-text-right"
                  style={{ marginTop: "20px" }}
                >
                  <button
                    className="btn btn-primary uk-margin"
                    onClick={handleAddMaterialClick}
                  >
                    <span>Add Expense&nbsp;&nbsp;</span>
                    <FontAwesomeIcon
                      icon={faPlus}
                      className="icon uk-margin-small-right"
                    />
                  </button>
                </div>
              )}
            </div>

            <div
              className="uk-width-1-1 uk-text-right"
              style={{ marginTop: "20px" }}
            >
              <div
                className="uk-width-1-1 uk-text-right"
                style={{ marginTop: "10px" }}
              >
                {jobCard.isAllocated !== true && (
                  <ButtonSecondary
                    text="Allocate"
                    type="submit"
                   
                    buttonType="dark-theme" // Use 'primary' button type
                    disabled={loading}
                  />
                )}
                {jobCard.isAllocated === true &&
                  jobCard.status !== "Deleted" && (
                    <div
                      className="uk-width-1-1 uk-text-right"
                      style={{ marginTop: "100px" }}
                    >
                      <ButtonSecondary
                        text="Exported to pdf"
                        type="button"
                        onClick={generatePDF}
                        buttonType="dark-theme" // Dark theme button
                        disabled={loading}
                      />
                      {jobCard.status !== "Completed" && (
                        <>
                          <ButtonSecondary
                            text="Edit Job Card"
                            type="button"
                            onClick={handleOnEditJobCard}
                            buttonType="dark-theme" // Dark theme button
                            disabled={loading}
                          />
                          <ButtonSecondary
                            text="Delete Job Card"
                            type="button"
                            onClick={handleDeleteJobCard}
                            buttonType="danger" // Danger button type
                            disabled={loading}
                          />
                          <ButtonSecondary
                            text="Mark As completed"
                            type="button"
                            onClick={handleMarkAsCompleted}
                            buttonType="dark-theme" // Dark theme button
                            disabled={loading}
                          />
                        </>
                      )}
                    </div>
                  )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </ErrorBoundary>
  );
});

export default ViewAllocatedJobCardModal;
