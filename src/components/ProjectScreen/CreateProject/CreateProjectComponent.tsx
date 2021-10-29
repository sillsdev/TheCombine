import {
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
} from "@material-ui/core";
import { LanguagePicker, languagePickerStrings_en } from "mui-language-picker";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Translate } from "react-localize-redux";

import { WritingSystem } from "api/models";
import { projectDuplicateCheck } from "backend";
import FileInputButton from "components/Buttons/FileInputButton";
import LoadingDoneButton from "components/Buttons/LoadingDoneButton";
import { newWritingSystem } from "types/project";
import theme from "types/theme";

interface CreateProjectProps {
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

export default class CreateProject extends React.Component<
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
      if (this.state.analysisLanguages[0]) {
        this.setState((state) => {
          state.analysisLanguages[0].bcp47 = bcp47;
          return { analysisLanguages: state.analysisLanguages };
        });
      } else {
        const analysisLanguages = [newWritingSystem(bcp47)];
        this.setState({ analysisLanguages });
      }
    }
  };

  setAnalysisLangName = (name: string) => {
    if (this.state.analysisLanguages[0]) {
      this.setState((state) => {
        state.analysisLanguages[0].name = name;
        return { analysisLanguages: state.analysisLanguages };
      });
    } else {
      const analysisLanguages = [newWritingSystem("", name)];
      this.setState({ analysisLanguages });
    }
  };

  setAnalysisFont = (font: string) => {
    if (this.state.analysisLanguages[0]) {
      this.setState((state) => {
        state.analysisLanguages[0].font = font;
        return { analysisLanguages: state.analysisLanguages };
      });
    } else {
      const analysisLanguages = [newWritingSystem("", "", font)];
      this.setState({ analysisLanguages });
    }
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
    const languageData = this.state.languageData;
    this.setState({
      languageData,
      name,
      error: {
        empty: name === "",
        nameTaken: false,
      },
    });
  }

  updateLanguageData(languageData: File) {
    if (languageData) {
      const fileName = languageData.name;
      const name = this.state.name;
      this.setState({ languageData, name, fileName });
    }
  }

  async createProject(e: React.FormEvent<EventTarget>) {
    e.preventDefault();
    if (this.props.success) return;

    const name = this.state.name.trim();
    const vernLang = this.state.vernLanguage;
    const analysisLang = this.state.analysisLanguages;
    const languageData = this.state.languageData;
    if (name === "") {
      this.setState({
        error: { empty: true, nameTaken: false },
      });
    } else if (await projectDuplicateCheck(this.state.name)) {
      this.setState({
        error: { empty: false, nameTaken: true },
      });
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
              <Translate id="createProject.create" />
            </Typography>
            {/* Project name field */}
            <TextField
              id="create-project-name"
              label={<Translate id="createProject.name" />}
              value={this.state.name}
              onChange={(e) => this.updateName(e)}
              variant="outlined"
              style={{ width: "100%", marginBottom: theme.spacing(2) }}
              margin="normal"
              error={this.state.error["empty"] || this.state.error["nameTaken"]}
              helperText={
                (this.state.error["empty"] && (
                  <Translate id="login.required" />
                )) ||
                (this.state.error["nameTaken"] && (
                  <Translate id="createProject.nameTaken" />
                ))
              }
            />
            {/*Vernacular language picker */}
            <Typography>
              <Translate id="projectSettings.language.vernacularLanguage" />
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
            {/*Analysis language picker */}
            <Typography style={{ marginTop: theme.spacing(1) }}>
              <Translate id="projectSettings.language.analysisLanguage" />
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
            {/* File upload */}
            <div
              style={{
                marginBottom: theme.spacing(1),
                marginTop: theme.spacing(1),
              }}
            >
              <Typography
                variant="body1"
                style={{ marginTop: theme.spacing(2) }}
                display="inline"
              >
                <Translate id="createProject.upload?" />
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
                <Translate id="buttons.browse" />
              </FileInputButton>
              <Typography variant="caption" display="block">
                <Translate
                  id="createProject.uploadFormat"
                  options={{ renderInnerHtml: true, renderToStaticMarkup }}
                />
              </Typography>
              {/* Displays the name of the selected file */}
              {this.state.fileName && (
                <Typography
                  variant="body1"
                  noWrap
                  style={{ marginTop: theme.spacing(1) }}
                >
                  <Translate id="createProject.fileSelected" />:{" "}
                  {this.state.fileName}
                </Typography>
              )}
            </div>
            {/* Form submission button */}
            <Grid container justifyContent="flex-end">
              <LoadingDoneButton
                loading={this.props.inProgress}
                done={this.props.success}
                doneText={<Translate id="createProject.success" />}
                buttonProps={{ color: "primary", id: "create-project-submit" }}
              >
                <Translate id="createProject.create" />
              </LoadingDoneButton>
            </Grid>
          </CardContent>
        </form>
      </Card>
    );
  }
}
