import {
  Add,
  ArrowUpward,
  Clear,
  Delete,
  Done,
  Search,
} from "@mui/icons-material";
import {
  Grid,
  IconButton,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import { LanguagePicker, languagePickerStrings_en } from "mui-language-picker";
import React, { ReactElement } from "react";
import {
  useTranslation,
  withTranslation,
  WithTranslation,
} from "react-i18next";
import { toast } from "react-toastify";

import { Project, WritingSystem } from "api/models";
import { getFrontierWords } from "backend";
import IconButtonWithTooltip from "components/Buttons/IconButtonWithTooltip";
import { UpperRightToastContainer } from "components/Toast/UpperRightToastContainer";
import theme from "types/theme";
import { getAnalysisLangsFromWords } from "types/wordUtilities";
import { newWritingSystem, semDomWritingSystems } from "types/writingSystem";

interface LanguageProps extends WithTranslation {
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

export class ProjectLanguages extends React.Component<
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

  setNewAnalysisDefault(index: number): void {
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
          this.props.t(
            "projectSettings.language.makeDefaultAnalysisLanguageFailed"
          )
        );
      });
  }

  deleteAnalysisWritingSystem(index: number): void {
    this.props.project.analysisWritingSystems.splice(index, 1);
    this.props
      .saveChangesToProject(this.props.project)
      .then(() => this.resetState())
      .catch((err) => {
        console.error(err);
        toast.error(
          this.props.t("projectSettings.language.deleteAnalysisLanguageFailed")
        );
      });
  }

  addAnalysisWritingSystem(): void {
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
          this.props.t("projectSettings.language.addAnalysisLanguageFailed")
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

  async getActiveAnalysisLangs(): Promise<void> {
    const langCodes = getAnalysisLangsFromWords(await getFrontierWords());
    langCodes.sort();
    this.setState({ langsInProject: langCodes.join(", ") });
  }

  resetState(): void {
    this.setState(this.defaultState);
  }

  async setSemDomWritingSystem(lang: string): Promise<void> {
    this.props.project.semDomWritingSystem =
      semDomWritingSystems.find((ws) => ws.bcp47 === lang) ??
      newWritingSystem();
    this.props
      .saveChangesToProject(this.props.project)
      .then(() => this.resetState())
      .catch((err) => {
        console.error(err);
        toast.error(
          this.props.t(
            "projectSettings.language.updateSemDomWritingSystemFailed"
          )
        );
      });
  }

  render(): ReactElement {
    return (
      <React.Fragment>
        <UpperRightToastContainer />
        <Typography>
          {this.props.t("projectSettings.language.vernacular")}
          {": "}
        </Typography>
        <ImmutableWritingSystem
          ws={this.props.project.vernacularWritingSystem}
        />
        <Typography style={{ marginTop: theme.spacing(1) }}>
          {this.props.t("projectSettings.language.analysis")}
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
                size="large"
              >
                <Done />
              </IconButton>
            </Grid>{" "}
            <Grid item>
              <IconButton
                onClick={() => this.resetState()}
                id="analysis-language-new-clear"
                size="large"
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
              buttonId={"analysis-language-new"}
            />
            <IconButtonWithTooltip
              icon={<Search />}
              textId="projectSettings.language.getGlossLanguages"
              onClick={() => this.getActiveAnalysisLangs()}
              buttonId={"analysis-language-get"}
            />
            {this.state.langsInProject}
          </React.Fragment>
        )}
        <Typography>
          {this.props.t("projectSettings.language.semanticDomains")}
          {": "}
        </Typography>
        <Select
          variant="standard"
          id="semantic-domains-language"
          value={this.props.project.semDomWritingSystem.bcp47}
          onChange={(event: SelectChangeEvent<string>) =>
            this.setSemDomWritingSystem(event.target.value as string)
          }
          /* Use `displayEmpty` and a conditional `renderValue` function to force
           * something to appear when the menu is closed and its value is "" */
          displayEmpty
          renderValue={
            this.props.project.semDomWritingSystem.bcp47
              ? undefined
              : () =>
                  this.props.t(
                    "projectSettings.language.semanticDomainsDefault"
                  )
          }
        >
          <MenuItem value={""}>
            {this.props.t("projectSettings.language.semanticDomainsDefault")}
          </MenuItem>
          {semDomWritingSystems.map((ws) => (
            <MenuItem key={ws.bcp47} value={ws.bcp47}>
              {`${ws.bcp47} (${ws.name})`}
            </MenuItem>
          ))}
        </Select>
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
  const { t } = useTranslation();

  return (
    <Grid container spacing={1}>
      {props.index !== undefined && (
        <Grid item>
          <Typography>{`${props.index + 1}. `}</Typography>
        </Grid>
      )}
      <Grid item>
        <Typography>
          {t("projectSettings.language.name")}
          {`: ${props.ws.name}, `}
        </Typography>
      </Grid>
      <Grid item>
        <Typography>
          {t("projectSettings.language.bcp47")}
          {`: ${props.ws.bcp47}, `}
        </Typography>
      </Grid>
      <Grid item>
        <Typography>
          {t("projectSettings.language.font")}
          {`: ${props.ws.font}`}
        </Typography>
      </Grid>
      <Grid item>{props.buttons}</Grid>
    </Grid>
  );
}

export default withTranslation()(ProjectLanguages);
