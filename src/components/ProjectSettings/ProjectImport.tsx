import { Grid, Typography, Button, CircularProgress } from "@mui/material";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";

import { getProject, uploadLift } from "backend";
import FileInputButton from "components/Buttons/FileInputButton";
import { ProjectSettingProps } from "components/ProjectSettings/ProjectSettingsTypes";

enum UploadState {
  Awaiting,
  InProgress,
  Done,
}

const selectFileButtonId = "project-import-select-file";
export const uploadFileButtonId = "project-import-upload-file";

export default function ProjectImport(props: ProjectSettingProps) {
  const [liftFile, setLiftFile] = useState<File | undefined>();
  const [liftFilename, setLiftFilename] = useState<string | undefined>();
  const [uploadState, setUploadState] = useState(UploadState.Awaiting);

  const { t } = useTranslation();

  const updateLiftFile = (file: File): void => {
    setLiftFile(file);
    setLiftFilename(file.name);
  };

  const uploadWords = async (): Promise<void> => {
    if (liftFile) {
      setUploadState(UploadState.InProgress);
      await uploadLift(props.project.id, liftFile);
      props.updateProject(await getProject(props.project.id));
      setLiftFile(undefined);
      setUploadState(UploadState.Done);
    }
  };

  return (
    <Grid container spacing={1}>
      <Grid item xs={12}>
        <Typography variant="body2">
          {t("projectSettings.import.body")}{" "}
          <Trans i18nKey="createProject.uploadFormat">
            FillerTextA
            <a href="https://code.google.com/archive/p/lift-standard/">
              FillerTextB
            </a>
            FillerTextC
          </Trans>
        </Typography>
      </Grid>

      <Grid item>
        {/* Choose file button */}
        <FileInputButton
          updateFile={updateLiftFile}
          accept=".zip"
          buttonProps={{
            disabled: uploadState === UploadState.Done,
            id: selectFileButtonId,
          }}
        >
          {t("projectSettings.import.chooseFile")}
        </FileInputButton>
      </Grid>

      <Grid item>
        {/* Upload button */}
        <Button
          color="primary"
          variant="contained"
          disabled={
            liftFile === undefined || uploadState === UploadState.InProgress
          }
          onClick={uploadWords}
          id={uploadFileButtonId}
        >
          {t(
            uploadState === UploadState.Done ? "buttons.done" : "buttons.upload"
          )}
          {uploadState === UploadState.InProgress && (
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
        {liftFilename && (
          <Typography variant="body1" noWrap>
            {t("createProject.fileSelected")}
            {": "}
            {liftFilename}
          </Typography>
        )}
      </Grid>
    </Grid>
  );
}
