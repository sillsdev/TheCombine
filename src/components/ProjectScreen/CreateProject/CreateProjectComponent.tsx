import {
  Card,
  CardContent,
  Grid,
  IconButton,
  TextField,
  Typography,
} from "@material-ui/core";
import { Cancel } from "@material-ui/icons";
import { LanguagePicker, languagePickerStrings_en } from "mui-language-picker";
import React from "react";
import { Trans, withTranslation, WithTranslation } from "react-i18next";

import { WritingSystem } from "api/models";
import { projectDuplicateCheck } from "backend";
import FileInputButton from "components/Buttons/FileInputButton";
import LoadingDoneButton from "components/Buttons/LoadingDoneButton";
import theme from "types/theme";
import { newWritingSystem } from "types/writingSystem";

interface CreateProjectProps extends WithTranslation {
  asyncCreateProject: (
    name: string,
    vernacularLanguage: WritingSystem,
    analysisLanguages: WritingSystem[],
    languageData: File
  ) => void;
  reset: () => void;
  inProgress: boolean;
  success: boolean;
  errorMsg: string;
}

interface CreateProjectState {
  name: string;
  error: { empty: boolean; nameTaken: boolean };
  vernLanguage: WritingSystem;
  analysisLanguages: WritingSystem[];
  languageData?: File;
  fileName?: string;
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
      vernLanguage: newWritingSystem("und"),
      analysisLanguages: [newWritingSystem("und")],
    };
  }

  setVernBcp47 = (bcp47: string) => {
    if (bcp47) {
      this.setState((state) => ({
        vernLanguage: { ...state.vernLanguage, bcp47 },
      }));
    }
  };

  setVernLangName = (name: string) => {
    if (name) {
      this.setState((state) => ({
        vernLanguage: { ...state.vernLanguage, name },
      }));
    }
  };

  setVernFont = (font: string) => {
    if (font) {
      this.setState((state) => ({
        vernLanguage: { ...state.vernLanguage, font },
      }));
    }
  };

  setAnalysisBcp47 = (bcp47: string) => {
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

  setAnalysisLangName = (name: string) => {
    this.setState((state) => {
      const analysisLanguages = state.analysisLanguages;
      if (analysisLanguages.length) {
        analysisLanguages[0].name = name;
      } else {
        analysisLanguages.push(newWritingSystem("", name));
      }
      return { analysisLanguages };
    });
  };

  setAnalysisFont = (font: string) => {
    this.setState((state) => {
      const analysisLanguages = state.analysisLanguages;
      if (analysisLanguages.length) {
        analysisLanguages[0].font = font;
      } else {
        analysisLanguages.push(newWritingSystem("", "", font));
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
  ) {
    const name = evt.target.value;
    this.setState({
      name,
      error: { empty: name === "", nameTaken: false },
    });
  }

  updateLanguageData(languageData?: File) {
    this.setState({ languageData, fileName: languageData?.name });
  }

  async createProject(e: React.FormEvent<EventTarget>) {
    e.preventDefault();
    if (this.props.success) {
      return;
    }

    const name = this.state.name.trim();
    const vernLang = this.state.vernLanguage;
    const analysisLang = this.state.analysisLanguages;
    const languageData = this.state.languageData;
    if (name === "") {
      this.setState({ error: { empty: true, nameTaken: false } });
    } else if (await projectDuplicateCheck(this.state.name)) {
      this.setState({ error: { empty: false, nameTaken: true } });
    } else {
      this.props.asyncCreateProject(
        name,
        vernLang,
        analysisLang,
        languageData as File
      );
    }
  }

  render() {
    //visual definition
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
                  style: {
                    margin: theme.spacing(1),
                    id: "create-project-select-file",
                  },
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
              {this.state.fileName && (
                <Typography
                  variant="body2"
                  style={{ margin: theme.spacing(1) }}
                >
                  {"createProject.fileSelected"}: {this.state.fileName}
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
            <LanguagePicker
              value={this.state.vernLanguage.bcp47}
              setCode={(bcp47: string) => this.setVernBcp47(bcp47)}
              name={this.state.vernLanguage.name}
              setName={(name: string) => this.setVernLangName(name)}
              font={this.state.vernLanguage.font}
              setFont={(font: string) => this.setVernFont(font)}
              t={languagePickerStrings_en}
            />
            {/* Analysis language picker */}
            <Typography style={{ marginTop: theme.spacing(1) }}>
              {this.props.t("projectSettings.language.analysisLanguage")}
            </Typography>
            <LanguagePicker
              value={this.state.analysisLanguages[0].bcp47}
              setCode={(bcp47: string) => this.setAnalysisBcp47(bcp47)}
              name={this.state.analysisLanguages[0].name}
              setName={(name: string) => this.setAnalysisLangName(name)}
              font={this.state.analysisLanguages[0].font}
              setFont={(font: string) => this.setAnalysisFont(font)}
              t={languagePickerStrings_en}
            />
            {/* Form submission button */}
            <Grid
              container
              justifyContent="flex-end"
              style={{ marginTop: theme.spacing(1) }}
            >
              <LoadingDoneButton
                loading={this.props.inProgress}
                done={this.props.success}
                doneText={this.props.t("createProject.success")}
                buttonProps={{ color: "primary", id: "create-project-submit" }}
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
