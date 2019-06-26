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
  CardHeader
} from "@material-ui/core";

export interface CreateProjectProps {
  createProject?: (name: string, languageData: File) => void;
  asyncCreateProject?: (name: string, languageData: File) => void;
}

interface CreateProjectState {
  name: string;
  languageData?: File;
  fileName?: string;
}

class CreateProject extends React.Component<
  CreateProjectProps & LocalizeContextProps,
  CreateProjectState
> {
  constructor(props: CreateProjectProps & LocalizeContextProps) {
    super(props);
    this.state = { name: "" };
  }

  updateName(
    evt: React.ChangeEvent<
      HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement
    >
  ) {
    const name = evt.target.value;
    const languageData = this.state.languageData;
    this.setState({ languageData, name });
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

    const name = this.state.name.trim();
    const languageData = this.state.languageData;
    if (name === "") {
      // notify the user they need a project name (this won't translate)
      alert("Project name cannot be blank");
    } else if (this.props.asyncCreateProject) {
      this.props.asyncCreateProject(name, languageData as File);
    }
  }

  render() {
    //visual definition
    return (
      <Grid container justify="center">
        <Card style={{ width: 450 }}>
          <form onSubmit={e => this.createProject(e)}>
            <CardContent>
              <Typography variant="h5" align="center" gutterBottom>
                <Translate id="createProject.title" />
              </Typography>
              <TextField
                label={<Translate id="createProject.name" />}
                value={this.state.name}
                onChange={e => this.updateName(e)}
                variant="outlined"
                style={{ width: "100%", marginBottom: 30 }}
                margin="normal"
              />

              <Typography
                variant="body1"
                style={{ marginRight: 20 }}
                display="inline"
              >
                <Translate id="createProject.upload?" />
              </Typography>
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
              {this.state.fileName ? (
                <Typography variant="body1" noWrap style={{ marginTop: 30 }}>
                  <Translate id="createProject.fileSelected" />:{" "}
                  {this.state.fileName}
                </Typography>
              ) : null}

              <Grid container justify="flex-end">
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  style={{ marginTop: 30 }}
                >
                  <Translate id="createProject.create" />
                </Button>
              </Grid>
            </CardContent>
          </form>
        </Card>
      </Grid>
    );
  }
}

export default withLocalize(CreateProject);
