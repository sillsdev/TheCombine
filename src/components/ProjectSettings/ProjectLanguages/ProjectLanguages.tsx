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
import React, { ReactElement } from "react";
import { Translate } from "react-localize-redux";
import { toast } from "react-toastify";

import { Project, WritingSystem } from "api/models";
import { getFrontierWords } from "backend";
import IconButtonWithTooltip from "components/Buttons/IconButtonWithTooltip";
import { UpperRightToastContainer } from "components/Toast/UpperRightToastContainer";
import theme from "types/theme";
import { getAnalysisLangsFromWords } from "types/word";

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
      .catch((err) => {
        console.error(err);
        toast.error(
          <Translate id="projectSettings.language.makeDefaultAnalysisLanguageFailed" />
        );
      });
  }

  deleteAnalysisWritingSystem(index: number) {
    this.props.project.analysisWritingSystems.splice(index, 1);
    this.props
      .saveChangesToProject(this.props.project)
      .then(() => this.resetState())
      .catch((err) => {
        console.error(err);
        toast.error(
          <Translate id="projectSettings.language.deleteAnalysisLanguageFailed" />
        );
      });
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
      .catch((err) => {
        console.error(err);
        toast.error(
          <Translate id="projectSettings.language.addAnalysisLanguageFailed" />
        );
      });
  }

  isNewWritingSystem(): boolean {
    return (
      !!this.state.bcp47 &&
      !this.props.project.analysisWritingSystems
        .map((ws) => ws.bcp47)
        .includes(this.state.bcp47)
    );
  }

  writingSystemButtons(index: number): ReactElement | undefined {
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
          buttonId={`analysis-language-${index}-bump`}
        />
        <IconButtonWithTooltip
          icon={<Delete fontSize="inherit" />}
          textId="projectSettings.language.deleteAnalysisLanguage"
          small
          onClick={() => this.deleteAnalysisWritingSystem(index)}
          buttonId={`analysis-language-${index}-delete`}
        />
      </React.Fragment>
    );
  }

  async getActiveAnalysisLangs() {
    const langCodes = getAnalysisLangsFromWords(await getFrontierWords());
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
        <UpperRightToastContainer />
        <Typography>
          <Translate id="projectSettings.language.vernacular" />
          {": "}
        </Typography>
        <ImmutableWritingSystem
          ws={this.props.project.vernacularWritingSystem}
        />
        <Typography style={{ marginTop: theme.spacing(1) }}>
          <Translate id="projectSettings.language.analysis" />
          {": "}
        </Typography>
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
                disabled={!this.isNewWritingSystem()}
                onClick={() => this.addAnalysisWritingSystem()}
                id="analysis-language-new-confirm"
              >
                <Done />
              </IconButton>
            </Grid>{" "}
            <Grid item>
              <IconButton
                onClick={() => this.resetState()}
                id="analysis-language-new-clear"
              >
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
              buttonId={`analysis-language-new`}
            />
            <IconButtonWithTooltip
              icon={<Search />}
              textId="projectSettings.language.getGlossLanguages"
              onClick={() => this.getActiveAnalysisLangs()}
              buttonId={`analysis-language-get`}
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
  buttons?: ReactElement;
}

function ImmutableWritingSystem(
  props: ImmutableWritingSystemProps
): ReactElement {
  return (
    <Grid container spacing={1}>
      {props.index !== undefined && (
        <Grid item>
          <Typography>{`${props.index + 1}. `}</Typography>
        </Grid>
      )}
      <Grid item>
        <Typography>
          <Translate id="projectSettings.language.name" />
          {`: ${props.ws.name}, `}
        </Typography>
      </Grid>
      <Grid item>
        <Typography>
          <Translate id="projectSettings.language.bcp47" />
          {`: ${props.ws.bcp47}, `}
        </Typography>
      </Grid>
      <Grid item>
        <Typography>
          <Translate id="projectSettings.language.font" />
          {`: ${props.ws.font}`}
        </Typography>
      </Grid>
      <Grid item>{props.buttons}</Grid>
    </Grid>
  );
}
