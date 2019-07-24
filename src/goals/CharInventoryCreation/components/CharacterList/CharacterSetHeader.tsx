import React from "react";
import { Grid, Typography, Tooltip } from "@material-ui/core";
import { Help } from "@material-ui/icons";
import { TranslateFunction, Translate } from "react-localize-redux";
import theme from "../../../../types/theme";

export interface CharacterSetHeaderProps {
  translate: TranslateFunction;
}

export default function CharacterSetHeader(props: CharacterSetHeaderProps) {
  return (
    <Grid item xs={12}>
      <Typography
        component="h1"
        variant="h4"
        style={{ marginTop: theme.spacing(1) }}
      >
        <Translate id="charInventory.characterSet.title" />{" "}
        <Tooltip
          title={props.translate("charInventory.characterSet.help") as string}
          placement="right"
        >
          <Help />
        </Tooltip>
      </Typography>
    </Grid>
  );
}
