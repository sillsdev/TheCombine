import React, { ReactNode } from "react";
import { Translate } from "react-localize-redux";
import { Language, AddCircleOutline } from "@material-ui/icons";
import { Grid, Typography, Tooltip } from "@material-ui/core";

export interface LanguageProps {
  vernacular: string;
  analysis: string[];
  uiLang: string;
}

interface Style {
  marginLeft: "auto" | number;
  marginRight: "auto" | number;
}
function List(justify: "flex-start" | "flex-end", ...elements: ReactNode[]) {
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

function generateTranslate(id: string): ReactNode {
  return (
    <Typography color="primary" variant="body1">
      <Translate id={`settings.language.${id}`} />
      {":"}
    </Typography>
  );
}

export default function LanguageSettingsComponent(
  props: LanguageProps
): ReactNode {
  return (
    <Grid container direction="column" spacing={2}>
      {/** Language header */}
      <Grid item style={{ display: "flex" }}>
        <Tooltip title={<Translate id="createProject.title" />}>
          <Language />
        </Tooltip>
        <Typography variant="h6">
          <Translate id="settings.language.header" />
        </Typography>
      </Grid>

      {/** Body */}
      <Grid item style={{ display: "flex", flexWrap: "nowrap" }}>
        {/** Headers */}
        {List(
          "flex-start",
          generateTranslate("vernacular"),
          generateTranslate("analysis"),
          generateTranslate("uiLang")
        )}
        {List(
          "flex-end",
          <Typography variant="body1">{props.vernacular}</Typography>,
          props.analysis.map((language, index) => (
            <React.Fragment>
              {index !== 0 ? ", " : ""}
              <Typography variant="body1">{language}</Typography>
            </React.Fragment>
          )),
          <Typography variant="body1">{props.uiLang}</Typography>
        )}
      </Grid>
    </Grid>
  );
}
