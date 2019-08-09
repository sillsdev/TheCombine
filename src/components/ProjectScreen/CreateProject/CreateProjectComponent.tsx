//external modules
import * as React from "react";
import {
  Translate,
  LocalizeContextProps,
  withLocalize
} from "react-localize-redux";
import {
  Grid,
  Typography,
  CardContent,
  TextField,
  Card
} from "@material-ui/core";
import LoadingDoneButton from "../../Buttons/LoadingDoneButton";
import FileInputButton from "../../Buttons/FileInputButton";

export interface CreateProjectProps {
  asyncCreateProject: (name: string, languageData: File) => void;
  reset: () => void;
  inProgress: boolean;
  success: boolean;
  errorMsg: string;
}

interface CreateProjectState {
  name: string;
  languageData?: File;
  fileName?: string;
  error: { name: boolean };
}

class CreateProject extends React.Component<
  CreateProjectProps & LocalizeContextProps,
  CreateProjectState
> {
  constructor(props: CreateProjectProps & LocalizeContextProps) {
    super(props);
    this.state = { name: "", error: { name: false } };
  }

  componentDidMount() {
    this.props.reset();
  }

  updateName(
    evt: React.ChangeEvent<
      HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement
    >
  ) {
    const name = evt.target.value;
    const languageData = this.state.languageData;
    this.setState({
      languageData,
      name,
      error: { name: name === "" }
    });
  }

  updateLanguageData(languageData: File) {
    if (languageData) {
      const fileName = languageData.name;
      const name = this.state.name;
      this.setState({ languageData, name, fileName });
    }
  }

  createProject(e: React.FormEvent<EventTarget>) {
    e.preventDefault();
    if (this.props.success) return;

    const name = this.state.name.trim();
    const languageData = this.state.languageData;
    if (name === "") {
      this.setState({ error: { name: true } });
    } else if (this.props.asyncCreateProject) {
      this.props.asyncCreateProject(name, languageData as File);
    }
  }

  render() {
    //visual definition
    return (
      <Card style={{ width: "100%", maxWidth: 450 }}>
        <form onSubmit={e => this.createProject(e)}>
          <CardContent>
            {/* Title */}
            <Typography variant="h5" align="center" gutterBottom>
              <Translate id="createProject.title" />
            </Typography>

            {/* Project name field */}
            <TextField
              label={<Translate id="createProject.name" />}
              value={this.state.name}
              onChange={e => this.updateName(e)}
              variant="outlined"
              style={{ width: "100%", marginBottom: 30 }}
              margin="normal"
              error={this.state.error["name"]}
              helperText={
                this.state.error["name"] && <Translate id="login.required" />
              }
            />

            {/* File upload */}
            <Typography
              variant="body1"
              style={{ marginRight: 20 }}
              display="inline"
            >
              <Translate id="createProject.upload?" />
            </Typography>
            <FileInputButton
              updateFile={file => this.updateLanguageData(file)}
              accept=".zip"
            >
              <Translate id="createProject.browse" />
            </FileInputButton>

            {/* Displays the name of the selected file */}
            {this.state.fileName && (
              <Typography variant="body1" noWrap style={{ marginTop: 30 }}>
                <Translate id="createProject.fileSelected" />:{" "}
                {this.state.fileName}
              </Typography>
            )}

            {/* Form submission button */}
            <Grid container justify="flex-end">
              <LoadingDoneButton
                loading={this.props.inProgress}
                done={this.props.success}
                color="primary"
                style={{
                  marginTop: 30
                }}
                doneText={<Translate id="createProject.success" />}
              >
                <Translate id="createProject.create" />
              </LoadingDoneButton>
            </Grid>
          </CardContent>
        </form>
      </Card>
    );
  }
}

export default withLocalize(CreateProject);
