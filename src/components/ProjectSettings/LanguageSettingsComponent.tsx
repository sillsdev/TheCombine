import React from "react";
import {
  LocalizeContextProps,
  Translate,
  withLocalize
} from "react-localize-redux";
import { Language, AddCircleOutline } from "@material-ui/icons";
import { Grid, Typography } from "@material-ui/core";

export interface LanguageProps {
  vernacular: string;
  analysis: string[];
  uiLang: string;
}

class LanguageSettingsComponent extends React.Component<
  LocalizeContextProps & LanguageProps
> {
  render() {
    return (
      <Grid container direction="column">
        <Grid item xs={3} style={{ float: "left" }}>
          <AddCircleOutline />
          <Typography>
            <Translate id="settings.language.header" />
          </Typography>
        </Grid>

        <Grid item xs={2} style={{ alignContent: "center" }}>
          <Typography>
            <Translate id="settings.language.vernacular" />
            {`: ${this.props.vernacular}`}
          </Typography>
        </Grid>

        <Grid item xs={2} style={{ alignContent: "center" }}>
          <Typography>
            <Translate id="settings.language.analysis" />
            {": "}
          </Typography>
          {this.props.analysis.map((language, index) => (
            <React.Fragment>
              {index !== 0 ? ", " : ""} <Typography>{language}</Typography>
            </React.Fragment>
          ))}
        </Grid>

        <Grid item xs={2} style={{ alignContent: "center" }}>
          <Typography>
            <Translate id="settings.language.uiLang" />
            {`: ${this.props.uiLang}`}
          </Typography>
        </Grid>
      </Grid>
    );
  }
}

export default withLocalize(LanguageSettingsComponent);
