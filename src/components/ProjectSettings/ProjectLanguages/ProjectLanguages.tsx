import { Grid, IconButton, Typography } from "@material-ui/core";
import {
  Add,
  ArrowUpward,
  Clear,
  Delete,
  Done,
  Search,
} from "@material-ui/icons";
import { LanguagePicker, languagePickerStrings_en } from "mui-language-picker";
import React from "react";
import { Translate } from "react-localize-redux";

import { getFrontierWords } from "backend";
import IconButtonWithTooltip from "components/Buttons/IconButtonWithTooltip";
import { Project, WritingSystem } from "types/project";
import theme from "types/theme";
import { getGlossLangsFromWords } from "types/word";

interface LanguageProps {
  project: Project;
  saveChangesToProject: (project: Project) => Promise<void>;
}

interface LanguageState {
  add: boolean;
  name: string;
  bcp47: string;
  font: string;
  langsInProject?: string;
}

export default class ProjectLanguages extends React.Component<
  LanguageProps,
  LanguageState
> {
  constructor(props: LanguageProps) {
    super(props);
    this.state = this.defaultState;
  }

  private defaultState: LanguageState = {
    add: false,
    name: "",
    bcp47: "",
    font: "",
    langsInProject: undefined,
  };

  setNewAnalysisDefault(index: number) {
    const newDefault = this.props.project.analysisWritingSystems.splice(
      index,
      1
    )[0];
    this.props.project.analysisWritingSystems.splice(0, 0, newDefault);
    this.props
      .saveChangesToProject(this.props.project)
      .then(() => this.resetState())
      .catch((err) => console.error(err));
  }

  deleteAnalysisWritingSystem(index: number) {
    this.props.project.analysisWritingSystems.splice(index, 1);
    this.props
      .saveChangesToProject(this.props.project)
      .then(() => this.resetState())
      .catch((err) => console.error(err));
  }

  addAnalysisWritingSystem() {
    const ws = {
      name: this.state.name,
      bcp47: this.state.bcp47,
      font: this.state.font,
    };
    this.props.project.analysisWritingSystems.push(ws);
    this.props
      .saveChangesToProject(this.props.project)
      .then(() => this.resetState())
      .catch((err) => console.error(err));
  }

  isNewWritingSystem() {
    return (
      this.state.bcp47 &&
      !this.props.project.analysisWritingSystems
        .map((ws) => ws.bcp47)
        .includes(this.state.bcp47)
    );
  }

  writingSystemButtons(index: number) {
    if (index === 0) {
      return;
    }
    return (
      <React.Fragment>
        <IconButtonWithTooltip
          icon={<ArrowUpward fontSize="inherit" />}
          textId="projectSettings.language.makeDefaultAnalysisLanguage"
          small
          onClick={() => this.setNewAnalysisDefault(index)}
        />
        <IconButtonWithTooltip
          icon={<Delete fontSize="inherit" />}
          textId="projectSettings.language.deleteAnalysisLanguage"
          small
          onClick={() => this.deleteAnalysisWritingSystem(index)}
        />
      </React.Fragment>
    );
  }

  async getAllGlossLangs() {
    const langCodes = getGlossLangsFromWords(await getFrontierWords());
    langCodes.sort();
    const langsInProject = langCodes.join(", ");
    this.setState({ langsInProject });
  }

  resetState() {
    this.setState(this.defaultState);
  }

  render() {
    return (
      <React.Fragment>
        <Typography>
          <Translate id="projectSettings.language.vernacular" />
          {": "}
          <ImmutableWritingSystem
            ws={this.props.project.vernacularWritingSystem}
          />
        </Typography>
        <Typography style={{ marginTop: theme.spacing(1) }}>
          <Translate id="projectSettings.language.analysis" />
          {": "}
          {this.props.project.analysisWritingSystems.map(
            (writingSystem, index) => (
              <ImmutableWritingSystem
                key={index}
                ws={writingSystem}
                index={index}
                buttons={this.writingSystemButtons(index)}
              />
            )
          )}
        </Typography>
        {this.state.add ? (
          <Grid container spacing={1} alignItems="center">
            <Grid item>
              <LanguagePicker
                value={this.state.name}
                setCode={(bcp47: string) => this.setState({ bcp47 })}
                name={this.state.bcp47}
                setName={(name: string) => this.setState({ name })}
                font={this.state.font}
                setFont={(font: string) => this.setState({ font })}
                t={languagePickerStrings_en}
              />
            </Grid>{" "}
            <Grid item>
              <IconButton
                id="submitNewLang"
                disabled={!this.isNewWritingSystem()}
                onClick={() => this.addAnalysisWritingSystem()}
              >
                <Done />
              </IconButton>
            </Grid>{" "}
            <Grid item>
              <IconButton onClick={() => this.resetState()}>
                <Clear />
              </IconButton>
            </Grid>
          </Grid>
        ) : (
          <React.Fragment>
            <IconButtonWithTooltip
              icon={<Add />}
              textId="projectSettings.language.addAnalysisLanguage"
              onClick={() => this.setState({ add: true })}
            />
            <IconButtonWithTooltip
              icon={<Search />}
              textId="projectSettings.language.getGlossLanguages"
              onClick={() => this.getAllGlossLangs()}
            />
            {this.state.langsInProject}
          </React.Fragment>
        )}
      </React.Fragment>
    );
  }
}

interface ImmutableWritingSystemProps {
  ws: WritingSystem;
  index?: number;
  buttons?: JSX.Element;
}

function ImmutableWritingSystem(props: ImmutableWritingSystemProps) {
  return (
    <Grid container spacing={1}>
      {props.index !== undefined && <Grid item>{`${props.index + 1}. `}</Grid>}
      <Grid item>
        <Translate id="projectSettings.language.name" />
        {": "}
        {props.ws.name} {", "}
      </Grid>
      <Grid item>
        <Translate id="projectSettings.language.bcp47" />
        {": "}
        {props.ws.bcp47}
        {", "}
      </Grid>
      <Grid item>
        <Translate id="projectSettings.language.font" />
        {": "}
        {props.ws.font}
      </Grid>
      <Grid item>{props.buttons}</Grid>
    </Grid>
  );
}
