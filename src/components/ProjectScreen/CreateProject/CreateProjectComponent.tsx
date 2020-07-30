//external modules
import * as React from "react";
import {
  Translate,
  LocalizeContextProps,
  withLocalize,
} from "react-localize-redux";
import {
  Grid,
  Typography,
  CardContent,
  TextField,
  Card,
  FormControl,
} from "@material-ui/core";
import LoadingDoneButton from "../../Buttons/LoadingDoneButton";
import FileInputButton from "../../Buttons/FileInputButton";
import { LanguagePicker, languagePickerStrings_en } from "mui-language-picker";
import { WritingSystem } from "../../../types/project";
import theme from "../../../types/theme";

export interface CreateProjectProps {
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
  error: { name: boolean };
  vernLanguage: WritingSystem;
  analysisLanguages: WritingSystem[];
  languageData?: File;
  fileName?: string;
}

export class CreateProject extends React.Component<
  CreateProjectProps & LocalizeContextProps,
  CreateProjectState
> {
  constructor(props: CreateProjectProps & LocalizeContextProps) {
    super(props);
    this.state = {
      name: "",
      error: { name: false },
      vernLanguage: { name: "", bcp47: "und", font: "" },
      analysisLanguages: [{ name: "", bcp47: "und", font: "" }],
    };
  }

  setVernBcp47 = (bcp47: string) => {
    if (bcp47) {
      this.setState((state) => {
        state.vernLanguage.bcp47 = bcp47;
        return { vernLanguage: state.vernLanguage };
      });
    }
  };

  setVernLangName = (name: string) => {
    if (name) {
      this.setState((state) => {
        state.vernLanguage.name = name;
        return { vernLanguage: state.vernLanguage };
      });
    }
  };
  setVernFontName = (font: string) => {
    if (font) {
      this.setState((state) => {
        state.vernLanguage.font = font;
        return { vernLanguage: state.vernLanguage };
      });
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
        let tempLang: WritingSystem[] = [{ name: "", bcp47: bcp47, font: "" }];
        this.setState({ analysisLanguages: tempLang });
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
      let tempLang: WritingSystem[] = [{ name: name, bcp47: "", font: "" }];
      this.setState({ analysisLanguages: tempLang });
    }
  };

  setAnalysisFontName = (font: string) => {
    if (this.state.analysisLanguages[0]) {
      this.setState((state) => {
        state.analysisLanguages[0].font = font;
        return { analysisLanguages: state.analysisLanguages };
      });
    } else {
      let tempLang: WritingSystem[] = [{ name: "", bcp47: "", font: font }];
      this.setState({ analysisLanguages: tempLang });
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
        name: name === "",
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

  createProject(e: React.FormEvent<EventTarget>) {
    e.preventDefault();
    if (this.props.success) return;

    const name = this.state.name.trim();
    const vernLang = this.state.vernLanguage;
    const analysisLang = this.state.analysisLanguages;
    const languageData = this.state.languageData;
    if (name === "") {
      this.setState({
        error: { name: true },
      });
    } else if (this.props.asyncCreateProject) {
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
              <Translate id="createProject.title" />
            </Typography>
            {/* Project name field */}
            <TextField
              label={<Translate id="createProject.name" />}
              value={this.state.name}
              onChange={(e) => this.updateName(e)}
              variant="outlined"
              style={{ width: "100%", marginBottom: theme.spacing(2) }}
              margin="normal"
              error={this.state.error["name"]}
              helperText={
                this.state.error["name"] && <Translate id="login.required" />
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
              setFont={(font: string) => this.setVernFontName(font)}
              t={languagePickerStrings_en}
            />
            {/*Analysis language picker */}
            <Typography style={{ marginTop: theme.spacing(2) }}>
              <Translate id="projectSettings.language.analysisLanguage" />
            </Typography>
            <LanguagePicker
              value={this.state.analysisLanguages[0].bcp47}
              setCode={(bcp47: string) => this.setAnalysisBcp47(bcp47)}
              name={this.state.analysisLanguages[0].bcp47}
              setName={(name: string) => this.setAnalysisLangName(name)}
              font={this.state.analysisLanguages[0].bcp47}
              setFont={(font: string) => this.setAnalysisFontName(font)}
              t={languagePickerStrings_en}
            />
            {/* File upload */}
            <Typography
              variant="body1"
              style={{ marginRight: theme.spacing(2) }}
              display="inline"
            >
              <Translate id="createProject.upload?" />
            </Typography>
            <FileInputButton
              updateFile={(file) => this.updateLanguageData(file)}
              accept=".zip"
              style={{ marginTop: theme.spacing(2) }}
            >
              <Translate id="createProject.browse" />
            </FileInputButton>
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
            {/* Form submission button */}
            <Grid container justify="flex-end">
              <LoadingDoneButton
                loading={this.props.inProgress}
                done={this.props.success}
                color="primary"
                style={{
                  marginTop: theme.spacing(1),
                }}
                doneText={<Translate id="createProject.success" />}
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

export default withLocalize(CreateProject);
