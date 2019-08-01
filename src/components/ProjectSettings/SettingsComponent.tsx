import React, { ReactNode } from "react";
import { Grid, Typography } from "@material-ui/core";
import { Translate } from "react-localize-redux";

interface SettingsProps {
  header: string;
  icon?: ReactNode;
  body: ReactNode;
}

export default function settingsComponent(props: SettingsProps) {
  return (
    <Grid container direction="column" spacing={2}>
      {/** Language header */}
      <Grid item style={{ display: "flex" }}>
        {props.icon}
        <Typography variant="h6">
          <Translate id={props.header} />
        </Typography>
      </Grid>

      {/** Body */}
      <Grid item style={{ display: "flex", flexWrap: "nowrap" }}>
        {/** Headers */}
        {props.body}
      </Grid>
    </Grid>
  );
}
