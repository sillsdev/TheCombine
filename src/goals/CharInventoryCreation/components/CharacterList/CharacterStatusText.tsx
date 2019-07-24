import React from "react";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import theme, { accepted, rejected } from "../../../../types/theme";
import { Translate } from "react-localize-redux";

export interface CharacterStatusTextProps {
  status: "accepted" | "rejected";
}

export default function CharacterStatusText(props: CharacterStatusTextProps) {
  if (props.status === "accepted") {
    return (
      <Typography variant="body2" style={{ color: accepted }} component="p">
        <Translate id="charInventory.characterSet.accepted" />
      </Typography>
    );
  } else if (props.status === "rejected") {
    return (
      <Typography variant="body2" style={{ color: rejected }} component="p">
        <Translate id="charInventory.characterSet.rejected" />
      </Typography>
    );
  }
  return (
    <Typography variant="body2" component="p">
      <Translate id="charInventory.characterSet.undecided" />
    </Typography>
  );
}
