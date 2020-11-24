import { Button, Grid, Tooltip, Typography } from "@material-ui/core";
import { Add, ArrowUpward, Clear, Done } from "@material-ui/icons";
import { LanguagePicker, languagePickerStrings_en } from "mui-language-picker";
import React from "react";
import { Translate } from "react-localize-redux";

import { updateProject } from "../../../backend";
import { Project, WritingSystem } from "../../../types/project";
import theme from "../../../types/theme";

interface LanguageProps {
  project: Project;
}

interface LanguageState {
  add: boolean;
  name: string;
  bcp47: string;
  font: string;
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
  };

  setNewAnalysisDefault(index: number) {
    const newDefault = this.props.project.analysisWritingSystems.splice(
      index,
      1
    )[0];
    this.props.project.analysisWritingSystems.splice(0, 0, newDefault);
    updateProject(this.props.project)
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
    updateProject(this.props.project)
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
                icon={index && <MakeDefaultButton />}
                iconAction={() => this.setNewAnalysisDefault(index)}
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
              <Button
                id="submitNewLang"
                size="large"
                disabled={!this.isNewWritingSystem()}
                onClick={() => this.addAnalysisWritingSystem()}
              >
                <Done />
              </Button>
            </Grid>{" "}
            <Grid item>
              <Button size="large" onClick={() => this.resetState()}>
                <Clear />
              </Button>
            </Grid>
          </Grid>
        ) : (
          <Tooltip
            title={
              <Translate id="projectSettings.language.addAnalysisLanguage" />
            }
            placement="right"
          >
            <Button
              id="addNewLang"
              onClick={() => this.setState({ add: true })}
            >
              <Add />
            </Button>
          </Tooltip>
        )}
      </React.Fragment>
    );
  }
}

function MakeDefaultButton() {
  return (
    <Tooltip
      title={
        <Translate id="projectSettings.language.makeDefaultAnalysisLanguage" />
      }
      placement="right"
    >
      <ArrowUpward fontSize="inherit" />
    </Tooltip>
  );
}

interface ImmutableWritingSystemProps {
  ws: WritingSystem;
  index?: number;
  icon?: any;
  iconAction?: () => void;
}

export function ImmutableWritingSystem(props: ImmutableWritingSystemProps) {
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
      {props.icon ? (
        <Grid item>
          <Button onClick={props.iconAction}>{props.icon}</Button>
        </Grid>
      ) : null}
    </Grid>
  );
}
