import { Cancel } from "@mui/icons-material";
import {
  Card,
  CardContent,
  Grid2,
  IconButton,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import { LanguagePicker, languagePickerStrings_en } from "mui-language-picker";
import {
  type ChangeEvent,
  type FormEvent,
  Fragment,
  type ReactElement,
  useEffect,
  useState,
} from "react";
import { Trans, useTranslation } from "react-i18next";

import { type WritingSystem } from "api/models";
import { projectDuplicateCheck, uploadLiftAndGetWritingSystems } from "backend";
import { FileInputButton, LoadingDoneButton } from "components/Buttons";
import {
  asyncCreateProject,
  asyncFinishProject,
} from "components/ProjectScreen/CreateProjectActions";
import { useAppDispatch } from "rootRedux/hooks";
import theme from "types/theme";
import { newWritingSystem } from "types/writingSystem";
import { NormalizedTextField } from "utilities/fontComponents";

export enum CreateProjectId {
  ButtonSelectFile = "create-project-select-file",
  ButtonSubmit = "create-project-submit",
  FieldName = "create-project-name",
  Form = "create-project-form",
  SelectVern = "create-proj-select-vern",
}

export enum CreateProjectTextId {
  Create = "createProject.create",
  CreateSuccess = "createProject.success",
  LangAnalysis = "projectSettings.language.analysisLanguage",
  LangAnalysisInfo = "createProject.language",
  LangVernacular = "projectSettings.language.vernacularLanguage",
  Name = "createProject.name",
  NameTaken = "createProject.nameTaken",
  Required = "login.required",
  SelectLanguage = "createProject.languageSelect",
  SelectOther = "createProject.languageOptionOther",
  Upload = "createProject.upload?",
  UploadBrowse = "buttons.browse",
  UploadInfo = "createProject.uploadFormat",
  UploadSelected = "createProject.fileSelected",
}

const vernIdNone = "selectLanguageOptionNone";
const vernIdOther = "selectLanguageOptionOther";
const undBcp47 = "und";

/** A component for creating a new project. */
export default function CreateProject(): ReactElement {
  const dispatch = useAppDispatch();

  const [analysisLang, setAnalysisLang] = useState(newWritingSystem(undBcp47));
  const [error, setError] = useState({ empty: false, nameTaken: false });
  const [languageData, setLanguageData] = useState<File | undefined>();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [success, setSuccess] = useState(false);
  const [vernLang, setVernLang] = useState(newWritingSystem(undBcp47));
  const [vernLangIsOther, setVernLangIsOther] = useState(false);
  const [vernLangOptions, setVernLangOptions] = useState<WritingSystem[]>([]);

  useEffect(() => {
    // Turn on the empty name error if the name is empty and another field isn't empty.
    const empty =
      !name.trim() &&
      (!!languageData || (!!vernLang.bcp47 && vernLang.bcp47 !== undBcp47));
    setError((prev) => (empty === prev.empty ? prev : { ...prev, empty }));
  }, [languageData, name, vernLang.bcp47]);

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
  const setVernRtl = (rtl: boolean): void => {
    setVernLang((prev) => ({ ...prev, rtl: rtl || undefined }));
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
  const setAnalysisRtl = (rtl: boolean): void => {
    setAnalysisLang((prev) => ({ ...prev, rtl: rtl || undefined }));
  };

  const updateName = (
    e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>
  ): void => {
    setName(e.target.value);

    // Turn off the nameTaken error when name is changed.
    setError((prev) => (prev.nameTaken ? { ...prev, nameTaken: false } : prev));
  };

  const updateLanguageData = async (langData?: File): Promise<void> => {
    const langOptions = langData
      ? await uploadLiftAndGetWritingSystems(langData)
      : [];
    setLanguageData(langData);
    setVernLangOptions(langOptions);
    if (langOptions.length) {
      setVernLang(newWritingSystem(undBcp47));
    }
  };

  /** A selector listing the vernacular writing systems in the user's upload. */
  const vernLangSelect = (): ReactElement => {
    const langs = vernLangOptions;
    if (!langs.length) {
      return <Fragment />;
    }

    const menuItems = [
      <MenuItem key={vernIdNone} value={vernIdNone}>
        {t(CreateProjectTextId.SelectLanguage)}
      </MenuItem>,
    ];
    menuItems.push(
      ...langs.map((lang) => (
        <MenuItem key={lang.bcp47} value={lang.bcp47}>
          {lang.name ? `${lang.name} : ${lang.bcp47}` : lang.bcp47}
        </MenuItem>
      ))
    );
    menuItems.push(
      <MenuItem key={vernIdOther} value={vernIdOther}>
        {t(CreateProjectTextId.SelectOther)}
      </MenuItem>
    );

    const onChange = (e: SelectChangeEvent): void => {
      const ws = langs.find((l) => l.bcp47 === e.target.value);
      if (ws) {
        setVernLangIsOther(false);
        setVernLang(ws);
      } else {
        setVernLangIsOther(e.target.value === vernIdOther);
        setVernLang(newWritingSystem(undBcp47));
      }
    };

    return (
      <Select
        data-testid={CreateProjectId.SelectVern}
        defaultValue={vernIdNone}
        id={CreateProjectId.SelectVern}
        onChange={onChange}
      >
        {menuItems}
      </Select>
    );
  };

  const createProject = async (e: FormEvent<EventTarget>): Promise<void> => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (
      success ||
      !trimmedName ||
      !vernLang.bcp47 ||
      vernLang.bcp47 === undBcp47
    ) {
      // Backstop for cases when this function shouldn't have run in the first place.
      return;
    }
    if (await projectDuplicateCheck(trimmedName)) {
      setError({ empty: false, nameTaken: true });
      return;
    }

    setLoading(true);

    if (languageData) {
      await dispatch(asyncFinishProject(trimmedName, vernLang)).then(() =>
        setSuccess(true)
      );
    } else {
      await dispatch(
        asyncCreateProject(trimmedName, vernLang, [analysisLang])
      ).then(() => setSuccess(true));
    }
  };

  return (
    <Card style={{ width: "100%", maxWidth: 450 }}>
      <form
        data-testid={CreateProjectId.Form}
        id={CreateProjectId.Form}
        onSubmit={(e) => createProject(e)}
      >
        <CardContent>
          {/* Title */}
          <Typography variant="h5" align="center" gutterBottom>
            {t(CreateProjectTextId.Create)}
          </Typography>

          {/* Project name */}
          <NormalizedTextField
            id={CreateProjectId.FieldName}
            label={t(CreateProjectTextId.Name)}
            value={name}
            onChange={updateName}
            variant="outlined"
            style={{ width: "100%", marginBottom: theme.spacing(2) }}
            margin="normal"
            error={error["empty"] || error["nameTaken"]}
            helperText={
              (error["empty"] && t(CreateProjectTextId.Required)) ||
              (error["nameTaken"] && t(CreateProjectTextId.NameTaken))
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
              {t(CreateProjectTextId.Upload)}
            </Typography>
            <FileInputButton
              updateFile={(file: File) => updateLanguageData(file)}
              accept=".zip"
              buttonProps={{
                "data-testid": CreateProjectId.ButtonSelectFile,
                id: CreateProjectId.ButtonSelectFile,
                sx: { m: 1 },
              }}
            >
              {t(CreateProjectTextId.UploadBrowse)}
            </FileInputButton>
            <Typography variant="caption" display="block">
              <Trans i18nKey={CreateProjectTextId.UploadInfo}>
                FillerTextA
                <a href="https://code.google.com/archive/p/lift-standard/">
                  FillerTextB
                </a>
                FillerTextC
              </Trans>
            </Typography>
            {/* Uploaded file name and remove button */}
            {languageData && (
              <Typography variant="body2" style={{ margin: theme.spacing(1) }}>
                {t(CreateProjectTextId.UploadSelected, {
                  val: languageData.name,
                })}
                <IconButton size="small" onClick={() => updateLanguageData()}>
                  <Cancel />
                </IconButton>
              </Typography>
            )}
          </div>

          {/* Vernacular language picker */}
          <Typography style={{ marginTop: theme.spacing(1) }}>
            {t(CreateProjectTextId.LangVernacular)}
          </Typography>
          {vernLangSelect()}
          {(vernLangIsOther || !vernLangOptions.length) && (
            <LanguagePicker
              value={vernLang.bcp47}
              setCode={setVernBcp47}
              name={vernLang.name}
              setName={setVernName}
              font={vernLang.font}
              setFont={setVernFont}
              setDir={setVernRtl}
              t={languagePickerStrings_en}
            />
          )}

          {/* Analysis language picker */}
          <Typography style={{ marginTop: theme.spacing(1) }}>
            {t(CreateProjectTextId.LangAnalysis)}
          </Typography>
          {languageData ? (
            t(CreateProjectTextId.LangAnalysisInfo)
          ) : (
            <LanguagePicker
              value={analysisLang.bcp47}
              setCode={setAnalysisBcp47}
              name={analysisLang.name}
              setName={setAnalysisName}
              font={analysisLang.font}
              setFont={setAnalysisFont}
              setDir={setAnalysisRtl}
              t={languagePickerStrings_en}
            />
          )}

          {/* Form submission button */}
          <Grid2
            container
            justifyContent="flex-end"
            style={{ marginTop: theme.spacing(1) }}
          >
            <LoadingDoneButton
              buttonProps={{
                "data-testid": CreateProjectId.ButtonSubmit,
                id: CreateProjectId.ButtonSubmit,
                type: "submit",
              }}
              disabled={
                !name.trim() || !vernLang.bcp47 || vernLang.bcp47 === undBcp47
              }
              done={success}
              doneText={t(CreateProjectTextId.CreateSuccess)}
              loading={loading}
            >
              {t(CreateProjectTextId.Create)}
            </LoadingDoneButton>
          </Grid2>
        </CardContent>
      </form>
    </Card>
  );
}
