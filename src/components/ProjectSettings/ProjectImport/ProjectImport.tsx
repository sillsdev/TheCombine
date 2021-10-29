import { Grid, Typography, Button, CircularProgress } from "@material-ui/core";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Translate } from "react-localize-redux";

import { Project } from "api/models";
import * as backend from "backend";
import FileInputButton from "components/Buttons/FileInputButton";

enum UploadState {
  Awaiting,
  InProgress,
  Done,
}

interface ImportProps {
  projectId: string;
  updateProject: (newProject: Project) => void;
}

interface ImportState {
  liftFile?: File;
  liftFilename?: string;
  uploadState: UploadState;
}

export default class ProjectImport extends React.Component<
  ImportProps,
  ImportState
> {
  constructor(props: ImportProps) {
    super(props);
    this.updateLiftFile = this.updateLiftFile.bind(this);
    this.state = {
      uploadState: UploadState.Awaiting,
    };
  }

  private updateLiftFile(file: File) {
    this.setState({ liftFile: file, liftFilename: file.name });
  }

  private async uploadWords() {
    if (this.state.liftFile) {
      this.setState({ uploadState: UploadState.InProgress });
      await backend.uploadLift(this.props.projectId, this.state.liftFile);
      this.props.updateProject(await backend.getProject(this.props.projectId));
      this.setState({ uploadState: UploadState.Done, liftFile: undefined });
    }
  }

  render() {
    return (
      <React.Fragment>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Typography variant="body2">
              <Translate id="projectSettings.import.body" />{" "}
              <Translate
                id="createProject.uploadFormat"
                options={{ renderInnerHtml: true, renderToStaticMarkup }}
              />
            </Typography>
          </Grid>
          <Grid item>
            {/* Choose file button */}
            <FileInputButton
              updateFile={this.updateLiftFile}
              accept=".zip"
              buttonProps={{
                disabled: this.state.uploadState === UploadState.Done,
                id: "project-import-select-file",
              }}
            >
              <Translate id="projectSettings.import.chooseFile" />
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
              id="project-import-submit"
            >
              <Translate
                id={`buttons.${
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
                    marginLeft: -12,
                  }}
                />
              )}
            </Button>
          </Grid>

          <Grid item>
            {/* Displays the name of the selected file */}
            {this.state.liftFilename && (
              <Typography variant="body1" noWrap>
                <Translate id="createProject.fileSelected" />
                {": "}
                {this.state.liftFilename}
              </Typography>
            )}
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }
}
