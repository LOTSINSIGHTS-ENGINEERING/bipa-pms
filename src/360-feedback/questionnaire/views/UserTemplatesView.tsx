import React, {
  useState,
  FormEvent,
  useEffect,
  useMemo,
  useCallback,
  ChangeEvent,
} from "react";
import { observer } from "mobx-react-lite";

import "react-datepicker/dist/react-datepicker.css";


import RequestSubmittedAlertModal from "../../shared-components/RequestSubmittedModal";

import AdminQuestionnaireBox from "../components/AdminTemplateQuestionnaire";

import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import RequestTable from "../../requests/RequestsTable";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import "./UserTemplatesView.scss";

import MODAL_NAMES from "../../../logged-in/dialogs/ModalName";
import { useAppContext } from "../../../shared/functions/Context";
import { MAIL_EMAIL, USER_TEMPLATE_VIEW } from "../../../shared/functions/mailMessages";
import showModalFromId, { hideModalFromId } from "../../../shared/functions/ModalShow";
import { ITemplateRating, defaultTemplateRating } from "../../../shared/models/three-sixty-feedback-models/TemplateRating";
import { IOption } from "../../communication/single-select/SlingleSelect";
import Modal from "../../../shared/components/Modal";

const UserTemplatesView = observer(() => {
  const { api, store } = useAppContext();
  const [selectedRaterId, setSelectedRaterId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [session, setSession] = useState<ITemplateRating>({
    ...defaultTemplateRating,
  });
  const [sentRequests, setSentRequests] = useState<ITemplateRating[]>([]);
  const [ratedSessions, setRatedSessions] = useState<ITemplateRating[]>([]);
  const [data, setData] = useState<ITemplateRating[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false); // New state for form visibility
  const [isSendingEmail, setIsSendingEmail] = useState(false); // New state for loader
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false); // State for success snackbar
  const [showErrorSnackbar, setShowErrorSnackbar] = useState(false); // State for error snackbar

  const me = store.auth.meJson?.uid;
  const users = store.user.all;
  const allSessions = store.templateRating.all.map((session) => session.asJson);
  const allTemplates = store.templates.all.map((template) => template.asJson);

  const fetchData = useCallback(async () => {
    try {
      await api.templateRating.getAll();
      const allRatings = store.templateRating.all.map(
        (rating) => rating.asJson
      );
      const filteredRatings = allRatings.filter(
        (rating) => rating.rateeId === me
      );
      setData(filteredRatings);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [api.templateRating, store.templateRating, me]);

  useEffect(() => {
    const fetchInitialData = async () => {
      await api.user.getAll();
      await api.template.getAll();
      await api.ratingSession.getAll();
      fetchData();
    };
    fetchInitialData();
  }, [fetchData, api]);

  const usersOptions: IOption[] = useMemo(
    () =>
      users.map((user) => ({
        label: user.asJson.displayName || "",
        value: user.asJson.uid,
      })),
    [users]
  );

  const templatesOptions: IOption[] = useMemo(
    () =>
      allTemplates.map((template) => ({
        label: template.title,
        value: template.id,
      })),
    [allTemplates]
  );

  const handleChangeRater = (event: SelectChangeEvent<string>) => {
    setSelectedRaterId(event.target.value);
  };

  const handleChangeTemplate = (event: SelectChangeEvent<string>) => {
    setTemplateId(event.target.value);
  };

  //*****************************************//
  // Send Email to rater                     //
  //*****************************************//

  const handleRequestRating = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (me && selectedRaterId && templateId) {
      const newSession: ITemplateRating = {
        ...session,
        rateeId: me || "",
        raterId: selectedRaterId,
        dateRequested: Date.now(),
        templateId: templateId,
        status: "Not Started",
        values: {},
        dueDate: dueDateValue
      };

      try {
        setIsSendingEmail(true); // Start loader


        await api.templateRating.create(newSession, selectedRaterId);

        const rater = users.find((user) => user.asJson.uid === selectedRaterId);
        if (!rater || !rater.asJson.email) {
          throw new Error("Rater not found or email is invalid");
        }

        const emailTemplate = USER_TEMPLATE_VIEW(
          session.heading,
          session.description,
          session.reasonForRequest,
          session.dueDate,
          templateId
        );

        if(rater.asJson.email!==null){  
          await api.mail.sendMail1(
          [rater.asJson.email],
          MAIL_EMAIL,
          emailTemplate.MY_SUBJECT,
          emailTemplate.MY_BODY
        );
        
        setShowSuccessSnackbar(true); // Show success snackbar
}
      
        showModalFromId(
          MODAL_NAMES.THREE_SIXTY_FEEDBACK.SUCCESSFULLY_REQUESTED_MODAL
        );
        setTimeout(() => {
          hideModalFromId(
            MODAL_NAMES.THREE_SIXTY_FEEDBACK.SUCCESSFULLY_REQUESTED_MODAL
          );
        }, 3000);

        // Clear the session and form fields
        setSession(defaultTemplateRating);
        setTemplateId("");
        setSelectedRaterId("");
        setSentRequests([...sentRequests, newSession]);
        setRatedSessions([...ratedSessions, newSession]);

      } catch (error) {
        console.error("Error requesting rating:", error);
       
      } finally {
        setIsSendingEmail(false); // End loader
      }
    }
    
    setIsFormVisible(false)
  };

  // const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const { value } = event.target;
  //   const timestamp = value ? new Date(value).getTime() : new Date().getTime(); // Default to current date if empty
  //   setSession((prevSession) => ({
  //     ...prevSession,
  //     dueDate: timestamp,
  //   }));
  // };

   // Step 1: Create a state to store the due date value as a number
   const [dueDateValue, setDueDateValue] = useState<number>(0);

   // Step 2: Handle the date change and store it as a numeric value
   const handleDateChange = (event: ChangeEvent<HTMLInputElement>) => {
     const date = new Date(event.target.value);
     setDueDateValue(date.valueOf()); // Store the date value as a number (milliseconds since epoch)
     setSession({ ...session, dueDate: dueDateValue})

   };
 

   return (
    <div className="user-templates-view">
      {/* Button to toggle request form */}
      <div className="button-container">
        <Button
          onClick={() => setIsFormVisible((prev) => !prev)}
          variant="contained"
          className="toggle-form-button"
          endIcon={
            isFormVisible ? (
              <svg viewBox="0 0 24 24" fill="currentColor" height="1em" width="1em">
                <path d="M13 15l2.5 2.5 1.42-1.42L12 11.16l-4.92 4.92L8.5 17.5 11 15v6h2v-6M3 3h18v2H3V3m0 4h10v2H3V7z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" height="1em" width="1em">
                <path d="M13 9l2.5-2.5 1.42 1.42L12 12.84 7.08 7.92 8.5 6.5 11 9V3h2v6M3 15h18v2H3v-2m0 4h10v2H3v-2z" />
              </svg>
            )
          }
        >
          {isFormVisible ? "Hide Request" : "Send Request"}
        </Button>
      </div>
  
      {/* Request Form */}
      {isFormVisible && (
        <form onSubmit={handleRequestRating} className="request-form">
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="templateName"
                label="Heading"
                value={session.heading}
                onChange={(e) => setSession({ ...session, heading: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="dueDate"
                label="Set Due Date"
                type="date"
                value={dueDateValue ? new Date(dueDateValue).toISOString().substring(0, 10) : ""}
                onChange={handleDateChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="templateDescription"
                label="Description"
                rows={5}
                value={session.description}
                onChange={(e) => setSession({ ...session, description: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="reasonForRequest"
                label="Reasons for Request"
                rows={5}
                value={session.reasonForRequest}
                onChange={(e) => setSession({ ...session, reasonForRequest: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="selectTemplateLabel">Select Template</InputLabel>
                <Select
                  labelId="selectTemplateLabel"
                  id="selectTemplate"
                  value={templateId}
                  onChange={handleChangeTemplate}
                  label="Select Template"
                >
                  <MenuItem value="">View Templates</MenuItem>
                  {templatesOptions.map((template, index) => (
                    <MenuItem key={index} value={template.value}>
                      {template.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="selectUserLabel">Select User</InputLabel>
                <Select
                  labelId="selectUserLabel"
                  id="selectUser"
                  value={selectedRaterId}
                  onChange={handleChangeRater}
                  label="Select User"
                >
                  <MenuItem value="">View Users</MenuItem>
                  {usersOptions.map((user, index) => (
                    <MenuItem key={index} value={user.value}>
                      {user.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {templateId !== "" && (
              <Grid item xs={12}>
                <div className="watermark">
                  <h3>NOTE: This template is currently Read-Only</h3>
                  {allTemplates.map(
                    (template) =>
                      templateId === template.id && <AdminQuestionnaireBox key={template.id} template={template} />
                  )}
                </div>
              </Grid>
            )}
            <Grid item xs={12}>
              <Button type="submit" variant="contained" className="submit-button" disabled={isSendingEmail}>
                {isSendingEmail ? <CircularProgress size={24} color="inherit" /> : "Send Request"}
              </Button>
            </Grid>
          </Grid>
        </form>
      )}
  
      {/* Table Section (Only Show When Form is Hidden) */}
      {!isFormVisible && (
        <div className="request-table">
          <RequestTable data={data} onDataChange={fetchData} showArchivedButton={false} />
        </div>
      )}
  
      {/* Modals & Notifications */}
      <Modal modalId={MODAL_NAMES.THREE_SIXTY_FEEDBACK.SUCCESSFULLY_REQUESTED_MODAL}>
        <RequestSubmittedAlertModal />
      </Modal>
  
      <Snackbar open={showSuccessSnackbar} autoHideDuration={6000} onClose={() => setShowSuccessSnackbar(false)}>
        <Alert onClose={() => setShowSuccessSnackbar(false)} severity="success" sx={{ width: "100%" }}>
          Email successfully sent!
        </Alert>
      </Snackbar>
  
      <Snackbar open={showErrorSnackbar} autoHideDuration={6000} onClose={() => setShowErrorSnackbar(false)}>
        <Alert onClose={() => setShowErrorSnackbar(false)} severity="error" sx={{ width: "100%" }}>
          Error sending email. Please try again.
        </Alert>
      </Snackbar>
    </div>
  );
  
});

export default UserTemplatesView;
