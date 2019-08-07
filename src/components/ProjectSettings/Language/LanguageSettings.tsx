import React from "react";
import {
  LocalizeContextProps,
  withLocalize,
  Translate
} from "react-localize-redux";
import { Button, TextField, Grid } from "@material-ui/core";

export interface LanguageProps {}

function LanguageSettings(props: LanguageProps & LocalizeContextProps) {
  const [language, setLanguage] = React.useState<string>(props.activeLanguage
    .code as string);

  return (
    <React.Fragment>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <TextField
            label={
              <Translate id="projectSettings.language.interfaceLanguage" />
            }
            value={language}
            onChange={e => setLanguage(e.target.value)}
          />
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color={
              language !== props.activeLanguage.code ? "primary" : "default"
            }
            onClick={() => {
              props.setActiveLanguage(language);
              localStorage.setItem("language", language);
            }}
          >
            <Translate id="projectSettings.language.save" />
          </Button>
        </Grid>
      </Grid>
    </React.Fragment>
  );
}

export default withLocalize(LanguageSettings);
