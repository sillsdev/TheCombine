import React from "react";
import { Typography, Grid } from "@material-ui/core";
import { Project, WritingSystem } from "../../../types/project";
import {
  Translate,
  LocalizeContextProps,
  withLocalize,
} from "react-localize-redux";

interface LanguageProps {
  project: Project;
}

class ProjectLanguage extends React.Component<
  LanguageProps & LocalizeContextProps
> {
  componentDidUpdate(prevProps: LanguageProps) {
    if (prevProps.project.id !== this.props.project.id) {
      let name = this.props.project.name;
      this.setState({ projectName: name });
    }
  }

  getAnalysisLang() {
    let analysisLang: WritingSystem = this.props.project
      .analysisWritingSystems[0];

    return analysisLang;
  }

  getVernLang() {
    let vernacularLang: WritingSystem = this.props.project
      .vernacularWritingSystem;
    return vernacularLang;
  }

  render() {
    return (
      <React.Fragment>
        <Typography>
          <Translate id="projectSettings.language.vernacular" />
          {": "}
          <Grid container spacing={1}>
            <Grid item>
              <Translate id="projectSettings.language.name" />
              {": "}
              {this.getVernLang().name} {", "}
            </Grid>
            <Grid item>
              <Translate id="projectSettings.language.bcp47" />
              {": "}
              {this.getVernLang().bcp47}
              {", "}
            </Grid>
            <Grid item>
              <Translate id="projectSettings.language.font" />
              {": "}
              {this.getVernLang().font}
            </Grid>
          </Grid>
        </Typography>
        <Typography style={{ marginTop: 10 }}>
          <Translate id="projectSettings.language.analysis" />
          {": "}
          <Grid container spacing={1}>
            <Grid container spacing={1}>
              <Grid item>
                <Translate id="projectSettings.language.name" />
                {": "}
                {this.getAnalysisLang().name} {", "}
              </Grid>
              <Grid item>
                <Translate id="projectSettings.language.bcp47" />
                {": "}
                {this.getAnalysisLang().bcp47}
                {", "}
              </Grid>
              <Grid item>
                <Translate id="projectSettings.language.font" />
                {": "}
                {this.getAnalysisLang().font}
              </Grid>
            </Grid>
          </Grid>
        </Typography>
      </React.Fragment>
    );
  }
}

export default withLocalize(ProjectLanguage);
