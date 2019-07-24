import { Grid, Typography, Tooltip } from "@material-ui/core";
import { Help } from "@material-ui/icons";
import { TranslateFunction, Translate } from "react-localize-redux";

export interface CharacterSetHeaderProps {
  translate: TranslateFunction;
}

export default function CharacterSetHeader(props: CharacterSetHeaderProps) {
  <Grid item xs={12}>
    <Typography component="h1" variant="h4">
      <Translate id="charInventory.characterSet.title" />{" "}
      <Tooltip
        title={props.translate("charInventory.characterSet.help") as string}
        placement="right"
      >
        <Help />
      </Tooltip>
    </Typography>
  </Grid>;
}
