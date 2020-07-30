import React from "react";
import { Typography, Grid } from "@material-ui/core";
import { Project, WritingSystem } from "../../../types/project";
import {
  Translate,
  LocalizeContextProps,
  withLocalize,
} from "react-localize-redux";
import theme from "../../../types/theme";

interface LanguageProps {
  project: Project;
}

class ProjectLanguages extends React.Component<
  LanguageProps & LocalizeContextProps
> {
  renderWritingSystem(ws: WritingSystem, index: number) {
    return (
      <React.Fragment>
        <Grid container spacing={1}>
          <Grid item>
            {index + 1}
            {". "}
          </Grid>
          <Grid item>
            <Translate id="projectSettings.language.name" />
            {": "}
            {ws.name} {", "}
          </Grid>
          <Grid item>
            <Translate id="projectSettings.language.bcp47" />
            {": "}
            {ws.bcp47}
            {", "}
          </Grid>
          <Grid item>
            <Translate id="projectSettings.language.font" />
            {": "}
            {ws.font}
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }

  render() {
    return (
      <React.Fragment>
        <Typography>
          <Translate id="projectSettings.language.vernacular" />
          {": "}
          {this.renderWritingSystem(
            this.props.project.vernacularWritingSystem,
            0
          )}
        </Typography>
        <Typography style={{ marginTop: theme.spacing(1) }}>
          <Translate id="projectSettings.language.analysis" />
          {": "}
          {this.props.project.analysisWritingSystems.map(
            (writingSystem, index) =>
              this.renderWritingSystem(writingSystem, index)
          )}
        </Typography>
      </React.Fragment>
    );
  }
}

export default withLocalize(ProjectLanguages);
