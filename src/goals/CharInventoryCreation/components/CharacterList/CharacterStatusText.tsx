import Typography from "@material-ui/core/Typography";
import React from "react";
import { Translate } from "react-localize-redux";

import { CharacterStatus } from "goals/CharInventoryCreation/CharacterInventoryReducer";
import { themeColors } from "types/theme";

interface CharacterStatusTextProps {
  status: CharacterStatus;
}

export default function CharacterStatusText(props: CharacterStatusTextProps) {
  if (props.status === CharacterStatus.Accepted) {
    return (
      <Typography
        variant="body2"
        style={{ color: themeColors.success }}
        component="p"
      >
        <Translate id="buttons.accepted" />
      </Typography>
    );
  } else if (props.status === CharacterStatus.Rejected) {
    return (
      <Typography
        variant="body2"
        style={{ color: themeColors.error }}
        component="p"
      >
        <Translate id="buttons.rejected" />
      </Typography>
    );
  }
  return (
    <Typography variant="body2" color="textSecondary" component="p">
      <Translate id="buttons.undecided" />
    </Typography>
  );
}
