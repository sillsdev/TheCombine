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

export enum ProjectImportTextId {
  ButtonChoose = "projectSettings.import.chooseFile",
  ButtonUpload = "buttons.upload",
  DialogLanguageMismatch = "projectSettings.import.liftLanguageMismatch",
  FileSelected = "createProject.fileSelected",
  Instructions = "projectSettings.import.body",
  ToastFail = "projectSettings.import.noWordsUploaded",
  ToastSuccess = "projectSettings.import.wordsUploaded",
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
        toast.success(t(ProjectImportTextId.ToastSuccess, { val }));
      } else {
        toast.warning(t(ProjectImportTextId.ToastFail));
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
          {t(ProjectImportTextId.Instructions)}{" "}
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
        buttonProps={{ disabled: uploadState === UploadState.Done }}
      >
        {t(ProjectImportTextId.ButtonChoose)}
      </FileInputButton>

      {/* Upload button */}
      <LoadingDoneButton
        buttonProps={{ onClick: uploadWords }}
        disabled={!liftLangs}
        done={uploadState === UploadState.Done}
        loading={uploadState === UploadState.InProgress}
      >
        {t(ProjectImportTextId.ButtonUpload)}
      </LoadingDoneButton>

      {/* Name of the selected file */}
      {liftFile && (
        <Typography variant="body1" noWrap>
          {t(ProjectImportTextId.FileSelected, { val: liftFile.name })}
        </Typography>
      )}

      {/* Dialog if LIFT contents don't match vernacular language */}
      {liftLangs && (
        <CancelConfirmDialog
          disableBackdropClick
          handleCancel={() => setLiftFile(undefined)}
          handleConfirm={() => setDialogOpen(false)}
          open={dialogOpen}
          text={t(ProjectImportTextId.DialogLanguageMismatch, {
            val1: liftLangs.map((ws) => ws.bcp47),
            val2: props.project.vernacularWritingSystem.bcp47,
          })}
        />
      )}
    </Grid2>
  );
}
