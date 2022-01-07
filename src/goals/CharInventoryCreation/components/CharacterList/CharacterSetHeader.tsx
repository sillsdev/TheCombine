import { Grid, Tooltip, Typography } from "@material-ui/core";
import { Help } from "@material-ui/icons";
import { ReactElement } from "react";
import { Translate } from "react-localize-redux";

import theme from "types/theme";

export default function CharacterSetHeader(): ReactElement {
  return (
    <Grid item xs={12}>
      <Typography
        component="h1"
        variant="h4"
        style={{ marginTop: theme.spacing(1) }}
      >
        <Translate id="charInventory.characterSet.title" />{" "}
        <Tooltip
          title={<Translate id="charInventory.characterSet.help" />}
          placement="right"
        >
          <Help />
        </Tooltip>
      </Typography>
    </Grid>
  );
}
