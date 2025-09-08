import { Grid2, Typography } from "@mui/material";
import { type ReactElement, useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { type WritingSystem } from "api";
import {
  finishUploadLift,
  getProject,
  uploadLiftAndGetWritingSystems,
} from "backend";
import FileInputButton from "components/Buttons/FileInputButton";
import LoadingDoneButton from "components/Buttons/LoadingDoneButton";
import CancelConfirmDialog from "components/Dialogs/CancelConfirmDialog";
import { type ProjectSettingProps } from "components/ProjectSettings/ProjectSettingsTypes";

enum UploadState {
  Awaiting,
  InProgress,
  Done,
}

export enum ProjectImportIds {
  ButtonDialogCancel = "project-import-dialog-cancel-button",
  ButtonDialogConfirm = "project-import-dialog-confirm-button",
  ButtonFileSelect = "project-import-file-select-button",
  ButtonFileSubmit = "project-import-file-submit-button",
}

export default function ProjectImport(
  props: ProjectSettingProps
): ReactElement {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [liftFile, setLiftFile] = useState<File | undefined>();
  const [liftLangs, setLiftLangs] = useState<WritingSystem[] | undefined>();
  const [uploadState, setUploadState] = useState(UploadState.Awaiting);

  const { t } = useTranslation();

  useEffect(() => {
    // When a LIFT file is selected, get its writing systems.
    if (liftFile) {
      uploadLiftAndGetWritingSystems(liftFile).then(setLiftLangs);
    } else {
      setDialogOpen(false);
      setLiftLangs(undefined);
    }
  }, [liftFile]);

  useEffect(() => {
    // Check whether the project's vernacular writing system is in the LIFT's ldml files.
    const vern = props.project.vernacularWritingSystem.bcp47;
    if (liftLangs && !liftLangs.some((lang) => lang.bcp47 === vern)) {
      setDialogOpen(true);
    }
  }, [liftLangs, props.project.vernacularWritingSystem.bcp47]);

  const uploadWords = async (): Promise<void> => {
    if (liftFile) {
      // Upload the selected file into the project.
      setUploadState(UploadState.InProgress);
      const val = await finishUploadLift(props.project.id);

      // Toast the number of words uploaded.
      if (val) {
        toast.success(t("projectSettings.import.wordsUploaded", { val }));
      } else {
        toast.warning(t("projectSettings.import.noWordsUploaded"));
      }

      // Clean up.
      setUploadState(UploadState.Done);
      setLiftFile(undefined);
      props.setProject(await getProject(props.project.id));
    }
  };

  return (
    <Grid2 alignItems="center" container spacing={1}>
      {/* Upload/LIFT instructions */}
      <Grid2 size={12}>
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
      </Grid2>

      {/* Choose file button */}
      <FileInputButton
        updateFile={setLiftFile}
        accept=".zip"
        buttonProps={{
          "data-testid": ProjectImportIds.ButtonFileSelect,
          disabled: uploadState === UploadState.Done,
          id: ProjectImportIds.ButtonFileSelect,
        }}
      >
        {t("projectSettings.import.chooseFile")}
      </FileInputButton>

      {/* Upload button */}
      <LoadingDoneButton
        buttonProps={{
          "data-testid": ProjectImportIds.ButtonFileSubmit,
          id: ProjectImportIds.ButtonFileSubmit,
          onClick: uploadWords,
        }}
        disabled={!liftLangs}
        done={uploadState === UploadState.Done}
        loading={uploadState === UploadState.InProgress}
      >
        {t("buttons.upload")}
      </LoadingDoneButton>

      {/* Name of the selected file */}
      {liftFile && (
        <Typography variant="body1" noWrap>
          {t("createProject.fileSelected", { val: liftFile.name })}
        </Typography>
      )}

      {/* Dialog if LIFT contents don't match vernacular language */}
      {liftLangs && (
        <CancelConfirmDialog
          buttonIdCancel={ProjectImportIds.ButtonDialogCancel}
          buttonIdConfirm={ProjectImportIds.ButtonDialogConfirm}
          disableBackdropClick
          handleCancel={() => setLiftFile(undefined)}
          handleConfirm={() => setDialogOpen(false)}
          open={dialogOpen}
          text={t("projectSettings.import.liftLanguageMismatch", {
            val1: liftLangs.map((ws) => ws.bcp47),
            val2: props.project.vernacularWritingSystem.bcp47,
          })}
        />
      )}
    </Grid2>
  );
}
