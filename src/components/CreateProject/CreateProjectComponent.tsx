//external modules
import * as React from "react";
import {
  Translate,
  LocalizeContextProps,
  withLocalize
} from "react-localize-redux";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import {
  Grid,
  Typography,
  CardContent,
  Card,
  CircularProgress
} from "@material-ui/core";
import { Check } from "@material-ui/icons";
import { buttonSuccess } from "../../types/theme";
import AppBarComponent from "../AppBar/AppBarComponent";

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

  updateLanguageData(files: FileList) {
    const languageData = files[0];
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
      <div className="CreateProject">
        <AppBarComponent />
        <Grid container justify="center">
          <Card style={{ width: 450 }}>
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
                    this.state.error["name"] && (
                      <Translate id="login.required" />
                    )
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
                {/* The actual file input element is hidden... */}
                <input
                  id="file-input"
                  type="file"
                  name="name"
                  accept=".lift"
                  onChange={e =>
                    this.updateLanguageData(e.target.files as FileList)
                  }
                  style={{ display: "none" }}
                />
                {/* ... and this button is tied to it with the htmlFor property */}
                <Button variant="contained">
                  <label
                    htmlFor="file-input"
                    style={{
                      cursor: "pointer"
                    }}
                  >
                    <Translate id="createProject.browse" />
                  </label>
                </Button>
                {/* Displays the name of the selected file */}
                {this.state.fileName && (
                  <Typography variant="body1" noWrap style={{ marginTop: 30 }}>
                    <Translate id="createProject.fileSelected" />:{" "}
                    {this.state.fileName}
                  </Typography>
                )}

                {/* Form submission button */}
                <Grid container justify="flex-end">
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={this.props.inProgress}
                    style={{
                      marginTop: 30,
                      backgroundColor: this.props.success
                        ? buttonSuccess
                        : undefined
                    }}
                  >
                    {this.props.success ? (
                      <React.Fragment>
                        <Check />
                        <Translate id="createProject.success" />
                      </React.Fragment>
                    ) : (
                      <Translate id="createProject.create" />
                    )}
                    {this.props.inProgress && (
                      <CircularProgress
                        size={24}
                        style={{
                          color: buttonSuccess,
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          marginTop: -12,
                          marginLeft: -12
                        }}
                      />
                    )}
                  </Button>
                </Grid>
              </CardContent>
            </form>
          </Card>
        </Grid>
      </div>
    );
  }
}

export default withLocalize(CreateProject);
