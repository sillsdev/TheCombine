import React from "react";
import {
  LocalizeContextProps,
  Translate,
  withLocalize
} from "react-localize-redux";
import { Grid, Typography, Button, CircularProgress } from "@material-ui/core";

import * as backend from "../../../backend";
import { Project } from "../../../types/project";
import FileInputButton from "./FileInputButton";
import { renderToStaticMarkup } from "react-dom/server";

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
  liftFile?: File;
  liftFilename?: string;
  uploadState: UploadState;
}

export class ProjectImport extends React.Component<
  ImportProps & LocalizeContextProps,
  ImportState
> {
  constructor(props: ImportProps & LocalizeContextProps) {
    super(props);
    this.updateLiftFile = this.updateLiftFile.bind(this);
    this.state = {
      uploadState: UploadState.Awaiting
    };
  }

  private updateLiftFile(file: File) {
    this.setState({ liftFile: file, liftFilename: file.name });
  }

  private async uploadWords() {
    if (this.state.liftFile) {
      this.setState({ uploadState: UploadState.InProgress });
      await backend.uploadLift(this.props.project, this.state.liftFile);
      let newProject = await backend.getProject(this.props.project.id);
      this.props.updateProject(newProject);
      this.setState({ uploadState: UploadState.Done, liftFile: undefined });
    }
  }

  render() {
    return (
      <React.Fragment>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Typography variant="caption">
              <Translate
                id="projectSettings.import.body"
                options={{ renderInnerHtml: true, renderToStaticMarkup }}
              />
            </Typography>
          </Grid>
          <Grid item>
            {/* Choose file button */}
            <FileInputButton
              updateFile={this.updateLiftFile}
              disabled={this.state.uploadState === UploadState.Done}
            >
              Choose File
            </FileInputButton>
          </Grid>

          <Grid item>
            {/* Upload button */}
            <Button
              color="primary"
              variant="contained"
              disabled={
                this.state.liftFile === undefined ||
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

          <Grid item>
            {/* Displays the name of the selected file */}
            {this.state.liftFilename && (
              <Typography variant="body1" noWrap>
                <Translate id="createProject.fileSelected" />:{" "}
                {this.state.liftFilename}
              </Typography>
            )}
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }
}

export default withLocalize(ProjectImport);
