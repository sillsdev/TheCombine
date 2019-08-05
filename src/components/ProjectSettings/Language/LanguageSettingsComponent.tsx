import React, { ReactNode } from "react";
import {
  Translate,
  LocalizeContextProps,
  withLocalize
} from "react-localize-redux";
import { Language, AddCircleOutline } from "@material-ui/icons";
import { Grid, Typography, Tooltip } from "@material-ui/core";

export interface LanguageProps {
  vernacular: string;
  analysis: string[];
  uiLang: string;
}

class LanguageSettingsComponent extends React.Component<
  LanguageProps & LocalizeContextProps
> {
  private list(justify: "flex-start" | "flex-end", ...elements: ReactNode[]) {
    return (
      <Grid container direction="column" style={{ display: "flex" }}>
        {elements.map(value => (
          <Grid item justify={justify}>
            {value}
          </Grid>
        ))}
      </Grid>
    );
  }

  private generateTranslate(id: string): ReactNode {
    return (
      <Typography color="primary" variant="body1">
        <Translate id={`settings.language.${id}`} />
        {":"}
      </Typography>
    );
  }

  render() {
    return (
      <Grid container direction="column" spacing={2}>
        {/** Language header */}
        <Grid item style={{ display: "flex" }}>
          <Language />
          <Typography variant="h6">
            <Translate id="settings.language.header" />
          </Typography>
        </Grid>

        {/** Body */}
        <Grid item style={{ display: "flex", flexWrap: "nowrap" }}>
          {/** Headers */}
          {this.list(
            "flex-end",
            this.generateTranslate("vernacular"),
            this.generateTranslate("analysis"),
            this.generateTranslate("uiLang")
          )}
          {this.list(
            "flex-start",
            <Typography variant="body1">{this.props.vernacular}</Typography>,
            this.props.analysis.map((language, index) => (
              <React.Fragment>
                {index !== 0 && ", "}
                <Typography variant="body1">{language}</Typography>
              </React.Fragment>
            )),
            <Typography variant="body1">{this.props.uiLang}</Typography>
          )}
        </Grid>
      </Grid>
    );
  }
}

export default withLocalize(LanguageSettingsComponent);
