import { Cancel } from "@mui/icons-material";
import {
  Card,
  CardContent,
  Grid,
  IconButton,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from "@mui/material";
import { LanguagePicker, languagePickerStrings_en } from "mui-language-picker";
import React, { Fragment, ReactElement } from "react";
import { Trans, withTranslation, WithTranslation } from "react-i18next";

import { WritingSystem } from "api/models";
import { projectDuplicateCheck, uploadLiftAndGetWritingSystems } from "backend";
import { FileInputButton, LoadingDoneButton } from "components/Buttons";
import theme from "types/theme";
import { newWritingSystem } from "types/writingSystem";

const otherVernId = "is-for-selecting-a-different-vernacular-language";
const undBcp47 = "und";

interface CreateProjectProps extends WithTranslation {
  asyncCreateProject: (
    name: string,
    vernacularLanguage: WritingSystem,
    analysisLanguages: WritingSystem[]
  ) => void;
  asyncFinishProject: (name: string, vernacularLanguage: WritingSystem) => void;
  reset: () => void;
  inProgress: boolean;
  success: boolean;
  errorMsg: string;
}

interface CreateProjectState {
  name: string;
  error: { empty: boolean; nameTaken: boolean };
  vernLanguage: WritingSystem;
  vernLangOptions: WritingSystem[];
  vernLangIsOther?: boolean;
  analysisLanguages: WritingSystem[];
  languageData?: File;
}

export class CreateProject extends React.Component<
  CreateProjectProps,
  CreateProjectState
> {
  constructor(props: CreateProjectProps) {
    super(props);

    this.state = {
      name: "",
      error: { empty: false, nameTaken: false },
      vernLanguage: newWritingSystem(undBcp47),
      vernLangOptions: [],
      analysisLanguages: [newWritingSystem(undBcp47)],
    };
  }

  setVernBcp47 = (bcp47: string): void => {
    if (bcp47) {
      this.setState((state) => ({
        vernLanguage: { ...state.vernLanguage, bcp47 },
      }));
    }
  };

  setVernLangName = (name: string): void => {
    if (name) {
      this.setState((state) => ({
        vernLanguage: { ...state.vernLanguage, name },
      }));
    }
  };

  setVernFont = (font: string): void => {
    if (font) {
      this.setState((state) => ({
        vernLanguage: { ...state.vernLanguage, font },
      }));
    }
  };

  setAnalysisBcp47 = (bcp47: string): void => {
    if (bcp47) {
      this.setState((state) => {
        const analysisLanguages = state.analysisLanguages;
        if (analysisLanguages.length) {
          analysisLanguages[0].bcp47 = bcp47;
        } else {
          analysisLanguages.push(newWritingSystem(bcp47));
        }
        return { analysisLanguages };
      });
    }
  };

  setAnalysisLangName = (name: string): void => {
    this.setState((state) => {
      const analysisLanguages = state.analysisLanguages;
      if (analysisLanguages.length) {
        analysisLanguages[0].name = name;
      } else {
        analysisLanguages.push(newWritingSystem(undBcp47, name));
      }
      return { analysisLanguages };
    });
  };

  setAnalysisFont = (font: string): void => {
    this.setState((state) => {
      const analysisLanguages = state.analysisLanguages;
      if (analysisLanguages.length) {
        analysisLanguages[0].font = font;
      } else {
        analysisLanguages.push(newWritingSystem(undBcp47, "", font));
      }
      return { analysisLanguages };
    });
  };

  componentDidMount() {
    this.props.reset();
  }

  updateName(
    evt: React.ChangeEvent<
      HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement
    >
  ): void {
    const name = evt.target.value;
    this.setState({
      name,
      error: { empty: !name, nameTaken: false },
    });
  }

  async updateLanguageData(languageData?: File): Promise<void> {
    const vernLangOptions = languageData
      ? await uploadLiftAndGetWritingSystems(languageData)
      : [];
    if (vernLangOptions.length) {
      this.setState({
        languageData,
        vernLangOptions,
        vernLanguage: newWritingSystem(undBcp47),
      });
    } else {
      this.setState({ languageData, vernLangOptions });
    }
  }

  vernLangSelect(): ReactElement {
    const langs = this.state.vernLangOptions;
    if (!langs.length) {
      return <Fragment />;
    }

    const menuItems = [
      <MenuItem key={"no-language-selected"}>
        {"Select from vernacular languages in file:"}
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
      <MenuItem key={otherVernId} value={otherVernId}>
        {"other"}
      </MenuItem>
    );

    const onChange = (e: SelectChangeEvent): void => {
      if (!e.target.value) {
        return;
      }
      const ws = langs.find((l) => l.bcp47 === e.target.value);
      if (ws) {
        this.setState({ vernLangIsOther: false });
        this.setVernBcp47(ws.bcp47);
        this.setVernLangName(ws.name);
      } else {
        this.setState({ vernLangIsOther: true });
      }
    };

    return (
      <Select
        displayEmpty
        id="create-proj-select-vern-lang"
        onChange={onChange}
      >
        {menuItems}
      </Select>
    );
  }

  async createProject(e: React.FormEvent<EventTarget>): Promise<void> {
    e.preventDefault();
    if (this.props.success) {
      return;
    }
    const name = this.state.name.trim();
    if (!name) {
      this.setState({ error: { empty: true, nameTaken: false } });
      return;
    }
    if (await projectDuplicateCheck(this.state.name)) {
      this.setState({ error: { empty: false, nameTaken: true } });
      return;
    }

    if (this.state.languageData) {
      this.props.asyncFinishProject(name, this.state.vernLanguage);
    } else {
      this.props.asyncCreateProject(
        name,
        this.state.vernLanguage,
        this.state.analysisLanguages
      );
    }
  }

  render() {
    return (
      <Card style={{ width: "100%", maxWidth: 450 }}>
        <form onSubmit={(e) => this.createProject(e)}>
          <CardContent>
            {/* Title */}
            <Typography variant="h5" align="center" gutterBottom>
              {this.props.t("createProject.create")}
            </Typography>
            {/* Project name field */}
            <TextField
              id="create-project-name"
              label={this.props.t("createProject.name")}
              value={this.state.name}
              onChange={(e) => this.updateName(e)}
              variant="outlined"
              style={{ width: "100%", marginBottom: theme.spacing(2) }}
              margin="normal"
              error={this.state.error["empty"] || this.state.error["nameTaken"]}
              helperText={
                (this.state.error["empty"] && this.props.t("login.required")) ||
                (this.state.error["nameTaken"] &&
                  this.props.t("createProject.nameTaken"))
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
                {this.props.t("createProject.upload?")}
              </Typography>
              <FileInputButton
                updateFile={(file: File) => this.updateLanguageData(file)}
                accept=".zip"
                buttonProps={{
                  id: "create-project-select-file",
                  style: { margin: theme.spacing(1) },
                }}
              >
                {this.props.t("buttons.browse")}
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
              {this.state.languageData && (
                <Typography
                  variant="body2"
                  style={{ margin: theme.spacing(1) }}
                >
                  {`${this.props.t("createProject.fileSelected")}: ${
                    this.state.languageData.name
                  }`}
                  <IconButton
                    size="small"
                    onClick={() => this.updateLanguageData()}
                  >
                    <Cancel />
                  </IconButton>
                </Typography>
              )}
            </div>
            {/* Vernacular language picker */}
            <Typography style={{ marginTop: theme.spacing(1) }}>
              {this.props.t("projectSettings.language.vernacularLanguage")}
            </Typography>
            {this.vernLangSelect()}
            {(this.state.vernLangIsOther ||
              !this.state.vernLangOptions.length) && (
              <LanguagePicker
                value={this.state.vernLanguage.bcp47}
                setCode={(bcp47: string) => this.setVernBcp47(bcp47)}
                name={this.state.vernLanguage.name}
                setName={(name: string) => this.setVernLangName(name)}
                font={this.state.vernLanguage.font}
                setFont={(font: string) => this.setVernFont(font)}
                t={languagePickerStrings_en}
              />
            )}
            {/* Analysis language picker */}
            <Typography style={{ marginTop: theme.spacing(1) }}>
              {this.props.t("projectSettings.language.analysisLanguage")}
            </Typography>
            {this.state.languageData ? (
              this.props.t("createProject.language")
            ) : (
              <LanguagePicker
                value={this.state.analysisLanguages[0].bcp47}
                setCode={(bcp47: string) => this.setAnalysisBcp47(bcp47)}
                name={this.state.analysisLanguages[0].name}
                setName={(name: string) => this.setAnalysisLangName(name)}
                font={this.state.analysisLanguages[0].font}
                setFont={(font: string) => this.setAnalysisFont(font)}
                t={languagePickerStrings_en}
              />
            )}
            {/* Form submission button */}
            <Grid
              container
              justifyContent="flex-end"
              style={{ marginTop: theme.spacing(1) }}
            >
              <LoadingDoneButton
                buttonProps={{ color: "primary", id: "create-project-submit" }}
                disabled={
                  !this.state.vernLanguage.bcp47 ||
                  this.state.vernLanguage.bcp47 === undBcp47
                }
                done={this.props.success}
                doneText={this.props.t("createProject.success")}
                loading={this.props.inProgress}
              >
                {this.props.t("createProject.create")}
              </LoadingDoneButton>
            </Grid>
          </CardContent>
        </form>
      </Card>
    );
  }
}

export default withTranslation()(CreateProject);
