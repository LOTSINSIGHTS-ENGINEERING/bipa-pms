import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import { useAppContext } from "../../../shared/functions/Context";
import {
  ITemplates,
  Statement,
  defaultTemplate,
} from "../../../shared/models/three-sixty-feedback-models/Templates";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";

const CreateTemplate: React.FC = observer(() => {
  const { api } = useAppContext();
  const [template, setTemplate] = useState<ITemplates>({ ...defaultTemplate });
  const [questionText, setQuestionText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

    // const addQuestion = () => {
  //   const trimmedQuestionText = questionText.trim();
  //   console.log("Question Text Before Trim:", questionText);
  //   console.log("Question Text After Trim:", trimmedQuestionText);

  //   if (trimmedQuestionText !== "") {
  //     const newQuestion = {
  //       id: new Date().toISOString(),
  //       statement: trimmedQuestionText,
  //     };
  //     console.log("New Question to be Added:", newQuestion);

  //     setTemplate((prevTemplate) => ({
  //       ...prevTemplate,
  //       statements: [...prevTemplate.statements, newQuestion],
  //     }));

  //     setQuestionText("");
  //   } else {
  //     console.log("Question text is empty or whitespace only.");
  //   }
  // };
  
  const addQuestion = () => {
    if (questionText.trim() !== "") {
      const newQuestion: Statement = {
        id: new Date().toISOString(),
        statement: questionText,
        rating: 0,
      };
      setTemplate((prevTemplate) => ({
        ...prevTemplate,
        statements: [...prevTemplate.statements, newQuestion],
      }));
      setQuestionText("");
    } else {
      alert("Please enter a valid question.");
    }
  };

  const handleSaveTemplate = async () => {
    if (template.title.trim() !== "" && template.statements.length > 0) {
      setIsLoading(true);
      try {
        await api.template.create(template);
        setTemplate({ ...defaultTemplate });
        alert("Template saved successfully.");
      } catch (error) {
        console.error("Error saving template:", error);
        alert("Failed to save the template.");
      } finally {
        setIsLoading(false);
      }
    } else {
      alert("Please add a title and at least one question to the template.");
    }
  };

  return (
    <Grid container spacing={3} justifyContent="center">
      <Grid item xs={12} md={8}>
        <Paper style={{ padding: "2rem" }}>
          <Typography variant="h4" gutterBottom>
            Create New Template
          </Typography>
          <TextField
            fullWidth
            label="Template Title"
            variant="outlined"
            value={template.title}
            onChange={(e) =>
              setTemplate({ ...template, title: e.target.value })
            }
            margin="normal"
            required
          />
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={9}>
              <TextField
                fullWidth
                label="Question Text"
                variant="outlined"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={3}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={addQuestion}
              >
                Add Question
              </Button>
            </Grid>
          </Grid>
          <List>
            {template.statements.map((q) => (
              <React.Fragment key={q.id}>
                <ListItem>
                  <ListItemText primary={q.statement} />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleSaveTemplate}
            disabled={isLoading}
            style={{ marginTop: "1rem" }}
          >
            {isLoading ? "Saving..." : "Save Template"}
          </Button>
        </Paper>
      </Grid>
    </Grid>
  );
});

export default CreateTemplate;
