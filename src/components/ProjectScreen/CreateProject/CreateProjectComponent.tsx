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
} from "@material-ui/core";
import LoadingDoneButton from "../../Buttons/LoadingDoneButton";
import FileInputButton from "../../Buttons/FileInputButton";
import { LanguagePicker, languagePickerStrings_en } from "mui-language-picker";
import { WritingSystem } from "../../../types/project";

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
  error: { name: boolean; vernLanguage: boolean; analysisLanguage: boolean };
  vernLanguage: WritingSystem;
  analysisLanguages: WritingSystem[];
  languageData?: File;
  fileName?: string;
}

class CreateProject extends React.Component<
  CreateProjectProps & LocalizeContextProps,
  CreateProjectState
> {
  constructor(props: CreateProjectProps & LocalizeContextProps) {
    super(props);
    this.state = {
      name: "",
      error: { name: false, vernLanguage: false, analysisLanguage: false },
      vernLanguage: { name: "", bcp47: "und", font: "" },
      analysisLanguages: [{ name: "", bcp47: "und", font: "" }],
    };
    this.setVernBcp47 = this.setVernBcp47.bind(this);
    this.setVernLgName = this.setVernLgName.bind(this);
    this.setVernFontName = this.setVernFontName.bind(this);
    this.setAnalysisBcp47 = this.setAnalysisBcp47.bind(this);
    this.setAnalysisLgName = this.setAnalysisLgName.bind(this);
    this.setAnalysisFontName = this.setAnalysisFontName.bind(this);
  }

  setVernBcp47(item: string) {
    if (item) {
      this.setState((state) => {
        state.vernLanguage.bcp47 = item;
        return { vernLanguage: state.vernLanguage };
      });
    }
  }

  setVernLgName(item: string) {
    if (item) {
      this.setState((state) => {
        state.vernLanguage.name = item;
        return { vernLanguage: state.vernLanguage };
      });
    }
  }
  setVernFontName(item: string) {
    if (item) {
      this.setState((state) => {
        state.vernLanguage.font = item;
        return { vernLanguage: state.vernLanguage };
      });
    }
  }

  setAnalysisBcp47(item: string) {
    if (item) {
      if (this.state.analysisLanguages[0]) {
        this.setState((state) => {
          state.analysisLanguages[0].bcp47 = item;
          return { analysisLanguages: state.analysisLanguages };
        });
      } else {
        let tempItem: WritingSystem[] = [{ name: "", bcp47: "", font: "" }];
        tempItem[0].bcp47 = item;
        this.setState({ analysisLanguages: tempItem });
      }
    }
  }

  setAnalysisLgName(item: string) {
    if (this.state.analysisLanguages[0]) {
      this.setState((state) => {
        state.analysisLanguages[0].name = item;
        return { analysisLanguages: state.analysisLanguages };
      });
    } else {
      let tempItem: WritingSystem[] = [{ name: "", bcp47: "", font: "" }];
      tempItem[0].name = item;
      this.setState({ analysisLanguages: tempItem });
    }
  }

  setAnalysisFontName(item: string) {
    if (this.state.analysisLanguages[0]) {
      this.setState((state) => {
        state.analysisLanguages[0].font = item;
        return { analysisLanguages: state.analysisLanguages };
      });
    } else {
      let tempItem: WritingSystem[] = [{ name: "", bcp47: "", font: "" }];
      tempItem[0].font = item;
      this.setState({ analysisLanguages: tempItem });
    }
  }

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
        vernLanguage: false,
        analysisLanguage: false,
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
        error: { name: true, vernLanguage: false, analysisLanguage: false },
      });
    } else if (vernLang.name === "") {
      this.setState({
        error: { name: false, vernLanguage: true, analysisLanguage: false },
      });
    } else if (!analysisLang[0] || analysisLang[0].name === "") {
      this.setState({
        error: { name: false, vernLanguage: false, analysisLanguage: true },
      });
    } else if (this.props.asyncCreateProject) {
      this.props.asyncCreateProject(
        name,
        vernLang as WritingSystem,
        analysisLang as WritingSystem[],
        languageData as File
      );
    }
  }

  translateLanguage() {
    return (
      <React.Fragment>
        <Grid item>
          <Typography>
            <Translate id="projectSettings.language.header" />
          </Typography>
        </Grid>
      </React.Fragment>
    );
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
              style={{ width: "100%", marginBottom: 30 }}
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
              setCode={this.setVernBcp47}
              name={this.state.vernLanguage.name}
              setName={this.setVernLgName}
              font={this.state.vernLanguage.font}
              setFont={this.setVernFontName}
              t={languagePickerStrings_en}
            />
            {/*Analysis language picker */}
            <Typography style={{ marginTop: 10 }}>
              <Translate id="projectSettings.language.analysisLanguage" />
            </Typography>
            <LanguagePicker
              value={this.state.analysisLanguages[0].bcp47}
              setCode={this.setAnalysisBcp47}
              name={this.state.analysisLanguages[0].bcp47}
              setName={this.setAnalysisLgName}
              font={this.state.analysisLanguages[0].bcp47}
              setFont={this.setAnalysisFontName}
              t={languagePickerStrings_en}
            />
            {/* File upload */}
            <Typography
              variant="body1"
              style={{ marginRight: 20 }}
              display="inline"
            >
              <Translate id="createProject.upload?" />
            </Typography>
            <FileInputButton
              updateFile={(file) => this.updateLanguageData(file)}
              accept=".zip"
              style={{ marginTop: 20 }}
            >
              <Translate id="createProject.browse" />
            </FileInputButton>
            {/* Displays the name of the selected file */}
            {this.state.fileName && (
              <Typography variant="body1" noWrap style={{ marginTop: 30 }}>
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
                  marginTop: 30,
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
