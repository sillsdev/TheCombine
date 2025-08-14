import { Grid2, Typography } from "@mui/material";
import { type ReactElement, useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { type WritingSystem } from "api";
import {
  deleteFrontierAndFinishUploadLift,
  finishUploadLift,
  getProject,
  uploadLiftAndGetWritingSystems,
} from "backend";
import { FileInputButton, LoadingDoneButton } from "components/Buttons";
import { CancelConfirmDialog } from "components/Dialogs";
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
  const [dialogReuploadOpen, setDialogReuploadOpen] = useState(false);
  const [dialogVernOpen, setDialogVernOpen] = useState(false);
  const [liftFile, setLiftFile] = useState<File | undefined>();
  const [liftLangs, setLiftLangs] = useState<WritingSystem[] | undefined>();
  const [uploadState, setUploadState] = useState(UploadState.Awaiting);

  const { t } = useTranslation();

  useEffect(() => {
    // When a LIFT file is selected, get its writing systems.
    if (liftFile) {
      uploadLiftAndGetWritingSystems(liftFile).then(setLiftLangs);
    } else {
      setDialogVernOpen(false);
      setLiftLangs(undefined);
    }
  }, [liftFile]);

  useEffect(() => {
    // Check whether the project's vernacular writing system is in the LIFT's ldml files.
    const vern = props.project.vernacularWritingSystem.bcp47;
    if (liftLangs && !liftLangs.some((lang) => lang.bcp47 === vern)) {
      setDialogVernOpen(true);
    }
  }, [liftLangs, props.project.vernacularWritingSystem.bcp47]);

  const onUploadClick = (): void => {
    if (props.project.liftImported) {
      setDialogReuploadOpen(true);
    } else {
      uploadWords();
    }
  };

  const onReuploadConfirm = (): void => {
    setDialogReuploadOpen(false);
    uploadWords();
  };

  const uploadWords = async (): Promise<void> => {
    if (liftFile) {
      // Upload the selected file into the project.
      setUploadState(UploadState.InProgress);
      const val = props.project.liftImported
        ? await deleteFrontierAndFinishUploadLift(props.project.id)
        : await finishUploadLift(props.project.id);

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
      {/* Upload instructions */}
      <Grid2 size={12}>
        {props.project.liftImported ? (
          <Typography color="error" variant="body2">
            {t("projectSettings.import.notAllowed")}{" "}
            {t("projectSettings.import.reuploadWarning")}
          </Typography>
        ) : (
          <Typography variant="body2">
            {t("projectSettings.import.body")}
          </Typography>
        )}
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
          onClick: onUploadClick,
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

      {/* LIFT instructions */}
      <Grid2 size={12}>
        <Typography variant="body2">
          <Trans i18nKey="createProject.uploadFormat">
            FillerTextA
            <a href="https://code.google.com/archive/p/lift-standard/">
              FillerTextB
            </a>
            FillerTextC
          </Trans>
        </Typography>
      </Grid2>

      {/* Dialog if LIFT contents don't match vernacular language */}
      {liftLangs && (
        <CancelConfirmDialog
          buttonIdCancel={ProjectImportIds.ButtonDialogCancel}
          buttonIdConfirm={ProjectImportIds.ButtonDialogConfirm}
          disableBackdropClick
          handleCancel={() => setLiftFile(undefined)}
          handleConfirm={() => setDialogVernOpen(false)}
          open={dialogVernOpen}
          text={t("projectSettings.import.liftLanguageMismatch", {
            val1: liftLangs.map((ws) => ws.bcp47),
            val2: props.project.vernacularWritingSystem.bcp47,
          })}
        />
      )}

      {/* Dialog if uploading a second time */}
      {props.project.liftImported && (
        <CancelConfirmDialog
          buttonIdCancel={ProjectImportIds.ButtonDialogCancel}
          buttonIdConfirm={ProjectImportIds.ButtonDialogConfirm}
          disableBackdropClick
          handleCancel={() => setDialogReuploadOpen(false)}
          handleConfirm={onReuploadConfirm}
          open={dialogReuploadOpen}
          text={t("projectSettings.import.reuploadConfirm")}
        />
      )}
    </Grid2>
  );
}
