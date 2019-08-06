import React, { ReactNode } from "react";
import { Grid, Typography } from "@material-ui/core";
import theme from "../../../types/theme";

interface SettingsProps {
  title: ReactNode;
  icon: ReactNode;
  body: ReactNode;
}

export default function BaseSettingsComponent(props: SettingsProps) {
  return (
    <Grid item container xs={12} spacing={1}>
      <Grid item style={{ marginTop: 4, color: "grey" }}>
        {props.icon}
      </Grid>
      <Grid item>
        <Typography variant="h6" style={{ marginBottom: theme.spacing(1) }}>
          {props.title}
        </Typography>
        {props.body}
      </Grid>
    </Grid>
  );
}
