import { Cancel } from "@mui/icons-material";
import {
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { LanguagePicker, languagePickerStrings_en } from "mui-language-picker";
import { FormEvent, Fragment, ReactElement, useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import { projectDuplicateCheck } from "backend";
import CancelConfirmDialog from "components/Buttons/CancelConfirmDialog";
import FileInputButton from "components/Buttons/FileInputButton";
import LoadingDoneButton from "components/Buttons/LoadingDoneButton";
import {
  asyncCreateProject,
  reset,
} from "components/ProjectScreen/CreateProject/Redux/CreateProjectActions";
import { StoreState } from "types";
import { useAppDispatch } from "types/hooks";
import theme from "types/theme";
import { newWritingSystem } from "types/writingSystem";

interface ErrorState {
  empty: boolean;
  nameTaken: boolean;
  submit: string;
}

export default function CreateProject(): ReactElement {
  const submitError = useSelector(
    (state: StoreState) => state.createProjectState.errorMsg
  );
  const submitInProgress = useSelector(
    (state: StoreState) => state.createProjectState.inProgress
  );
  const submitSuccess = useSelector(
    (state: StoreState) => state.createProjectState.success
  );

  const [projName, setProjName] = useState("");
  const [error, setError] = useState<ErrorState>({
    empty: false,
    nameTaken: false,
    submit: "",
  });
  const [analysisLang, setAnalysisLang] = useState(newWritingSystem("und"));
  const [vernLang, setVernLang] = useState(newWritingSystem("und"));
  const [liftFile, setLiftFile] = useState<File | undefined>();
  const [recordingConsented, setRecordingConsented] = useState(false);
  const [recordingConsentOpen, setRecordingConsentOpen] = useState(false);

  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const setVernBcp47 = (bcp47: string): void => {
    if (bcp47) {
      setVernLang((prev) => ({ ...prev, bcp47 }));
    }
  };
  const setVernName = (name: string): void => {
    if (name) {
      setVernLang((prev) => ({ ...prev, name }));
    }
  };
  const setVernFont = (font: string): void => {
    if (font) {
      setVernLang((prev) => ({ ...prev, font }));
    }
  };

  const setAnalysisBcp47 = (bcp47: string): void => {
    if (bcp47) {
      setAnalysisLang((prev) => ({ ...prev, bcp47 }));
    }
  };
  const setAnalysisName = (name: string): void => {
    if (name) {
      setAnalysisLang((prev) => ({ ...prev, name }));
    }
  };
  const setAnalysisFont = (font: string): void => {
    if (font) {
      setAnalysisLang((prev) => ({ ...prev, font }));
    }
  };

  useEffect(() => {
    dispatch(reset);
  }, [dispatch]);

  useEffect(() => {
    if (submitError !== error.submit) {
      setError((prev) => ({ ...prev, submit: submitError }));
    }
  }, [error.submit, setError, submitError]);

  useEffect(() => {
    const trimmedName = projName.trim();
    if (trimmedName) {
      projectDuplicateCheck(trimmedName).then((nameTaken) =>
        setError({ empty: false, nameTaken, submit: "" })
      );
    } else {
      setError({ empty: true, nameTaken: false, submit: "" });
    }
  }, [projName, setError]);

  const updateLanguageData = (languageData?: File): void => {
    setLiftFile(languageData);
  };

  const createProject = async (e: FormEvent<EventTarget>): Promise<void> => {
    e.preventDefault();
    if (error.empty || error.nameTaken || submitInProgress || submitSuccess) {
      return;
    }
    await dispatch(
      asyncCreateProject(
        projName.trim(),
        vernLang,
        [analysisLang],
        recordingConsented,
        liftFile as File
      )
    );
  };

  return (
    <Card style={{ width: "100%", maxWidth: 450 }}>
      <form onSubmit={createProject}>
        <CardContent>
          {/* Title */}
          <Typography variant="h5" align="center" gutterBottom>
            {t("createProject.create")}
          </Typography>
          {/* Project name field */}
          <TextField
            id="create-project-name"
            label={t("createProject.name")}
            value={name}
            onChange={(e) => setProjName(e.target.value)}
            variant="outlined"
            style={{ width: "100%", marginBottom: theme.spacing(2) }}
            margin="normal"
            error={error.empty || error.nameTaken || !!error.submit}
            helperText={
              (error.empty && t("login.required")) ||
              (error.nameTaken && t("createProject.nameTaken")) ||
              error.submit
            }
          />
          {/* File upload */}
          <div
            style={{
              marginBottom: theme.spacing(2),
              marginTop: theme.spacing(1),
            }}
          >
            <Typography
              variant="body1"
              style={{ marginTop: theme.spacing(2) }}
              display="inline"
            >
              {t("createProject.upload?")}
            </Typography>
            <FileInputButton
              updateFile={(file: File) => updateLanguageData(file)}
              accept=".zip"
              buttonProps={{
                id: "create-project-select-file",
                style: { margin: theme.spacing(1) },
              }}
            >
              {t("buttons.browse")}
            </FileInputButton>
            <Typography variant="caption" display="block">
              <Trans i18nKey="createProject.uploadFormat">
                FillerTextA
                <a href="https://code.google.com/archive/p/lift-standard/">
                  FillerTextB
                </a>
                FillerTextC
              </Trans>
            </Typography>
            {/* Displays the name of the selected file */}
            {liftFile ? (
              <Typography variant="body2" style={{ margin: theme.spacing(1) }}>
                {"createProject.fileSelected"}: {liftFile.name}
                <IconButton size="small" onClick={() => updateLanguageData()}>
                  <Cancel />
                </IconButton>
              </Typography>
            ) : (
              <Fragment />
            )}
          </div>
          {/* Vernacular language picker */}
          <Typography style={{ marginTop: theme.spacing(1) }}>
            {t("projectSettings.language.vernacularLanguage")}
          </Typography>
          <LanguagePicker
            value={vernLang.bcp47}
            setCode={setVernBcp47}
            name={vernLang.name}
            setName={setVernName}
            font={vernLang.font}
            setFont={setVernFont}
            t={languagePickerStrings_en}
          />
          {/* Analysis language picker */}
          <Typography style={{ marginTop: theme.spacing(1) }}>
            {t("projectSettings.language.analysisLanguage")}
          </Typography>
          <LanguagePicker
            value={analysisLang.bcp47}
            setCode={setAnalysisBcp47}
            name={analysisLang.name}
            setName={setAnalysisName}
            font={analysisLang.font}
            setFont={setAnalysisFont}
            t={languagePickerStrings_en}
          />
          {/* Audio consent agreement */}
          <FormControlLabel
            control={
              <Checkbox
                value={recordingConsented ? "on" : "off"}
                onClick={() => setRecordingConsentOpen(true)}
              />
            }
            label={t("createProject.enableRecording")}
          />
          <CancelConfirmDialog
            open={recordingConsentOpen}
            textId="createProject.enableRecordingConsent"
            handleCancel={() => {
              setRecordingConsented(false);
              setRecordingConsentOpen(false);
            }}
            handleConfirm={() => {
              setRecordingConsented(true);
              setRecordingConsentOpen(false);
            }}
            buttonIdCancel="create-proj-recording-cancel"
            buttonIdConfirm="create-proj=recording-confirm"
          />
          {/* Form submission button */}
          <Grid
            container
            justifyContent="flex-end"
            style={{ marginTop: theme.spacing(1) }}
          >
            <LoadingDoneButton
              loading={submitInProgress}
              done={submitSuccess}
              doneText={t("createProject.success")}
              buttonProps={{ color: "primary", id: "create-project-submit" }}
            >
              {t("createProject.create")}
            </LoadingDoneButton>
          </Grid>
        </CardContent>
      </form>
    </Card>
  );
}
