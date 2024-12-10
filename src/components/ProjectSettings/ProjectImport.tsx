import { Grid, Typography } from "@mui/material";
import { type ReactElement, useState } from "react";
import { Trans, useTranslation } from "react-i18next";

import { getProject, uploadLift } from "backend";
import { FileInputButton, LoadingDoneButton } from "components/Buttons";
import { type ProjectSettingProps } from "components/ProjectSettings/ProjectSettingsTypes";

enum UploadState {
  Awaiting,
  InProgress,
  Done,
}

const selectFileButtonId = "project-import-select-file";
export const uploadFileButtonId = "project-import-upload-file";

export default function ProjectImport(
  props: ProjectSettingProps
): ReactElement {
  const [liftFile, setLiftFile] = useState<File | undefined>();
  const [uploadState, setUploadState] = useState(UploadState.Awaiting);

  const { t } = useTranslation();

  const uploadWords = async (): Promise<void> => {
    if (liftFile) {
      setUploadState(UploadState.InProgress);
      await uploadLift(props.project.id, liftFile);
      setUploadState(UploadState.Done);
      setLiftFile(undefined);
      props.setProject(await getProject(props.project.id));
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
          updateFile={setLiftFile}
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
        <LoadingDoneButton
          buttonProps={{ id: uploadFileButtonId, onClick: uploadWords }}
          disabled={!liftFile}
          done={uploadState === UploadState.Done}
          loading={uploadState === UploadState.InProgress}
        >
          {t("buttons.upload")}
        </LoadingDoneButton>
      </Grid>

      <Grid item>
        {/* Displays the name of the selected file */}
        {liftFile && (
          <Typography variant="body1" noWrap>
            {t("createProject.fileSelected", { val: liftFile.name })}
          </Typography>
        )}
      </Grid>
    </Grid>
  );
}
