import React from "react";
import {
  LocalizeContextProps,
  Translate,
  withLocalize
} from "react-localize-redux";
import {
  Grid,
  Typography,
  Button,
  Dialog,
  CircularProgress
} from "@material-ui/core";
import { PresentToAll } from "@material-ui/icons";

import * as backend from "../../../backend";
import { Project } from "../../../types/project";
import GetFileButton from "../../ProjectScreen/CreateProject/GetFileButton";

enum UploadState {
  Awaiting,
  InProgress,
  Done
}

interface ImportProps {
  project: Project;
  updateProject: (newProject: Project) => void;
}

interface ImportState {
  languageData?: File;
  uploadState: UploadState;
}

export class ProjectImport extends React.Component<
  ImportProps & LocalizeContextProps,
  ImportState
> {
  constructor(props: ImportProps & LocalizeContextProps) {
    super(props);
    this.updateLanguage = this.updateLanguage.bind(this);
    this.state = {
      uploadState: UploadState.Awaiting
    };
  }

  private updateLanguage(languageData: File) {
    this.setState({ languageData });
  }

  private async uploadWords() {
    if (this.state.languageData) {
      this.setState({ uploadState: UploadState.InProgress });
      await backend.uploadLift(this.props.project, this.state.languageData);
      let newProject = await backend.getProject(this.props.project.id);
      this.props.updateProject(newProject);
      this.setState({ uploadState: UploadState.Done, languageData: undefined });
    }
  }

  render() {
    return (
      <Grid container direction="column">
        <Grid item style={{ display: "flex", flexWrap: "nowrap" }}>
          <PresentToAll />
          <Typography variant="h6">
            <Translate id="projectSettings.import.header" />
          </Typography>
        </Grid>
        <Grid item>
          <Typography variant="body1">
            <Translate id="projectSettings.import.body" />
          </Typography>
        </Grid>
        <Grid item style={{ display: "flex", flexWrap: "nowrap" }}>
          <Grid container direction="row">
            <Grid item xs>
              <GetFileButton
                updateLanguage={this.updateLanguage}
                disabled={this.state.uploadState === UploadState.Done}
              />
            </Grid>
            <Grid item xs>
              <Button
                color="primary"
                variant="contained"
                disabled={
                  this.state.languageData === undefined ||
                  this.state.uploadState === UploadState.InProgress
                }
                onClick={() => this.uploadWords()}
              >
                <Translate
                  id={`projectSettings.import.${
                    this.state.uploadState === UploadState.Done
                      ? "done"
                      : "upload"
                  }`}
                />
                {this.state.uploadState === UploadState.InProgress && (
                  <CircularProgress
                    size={24}
                    style={{
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
          </Grid>
        </Grid>
      </Grid>
    );
  }
}

export default withLocalize(ProjectImport);
