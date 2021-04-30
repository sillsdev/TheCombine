import Typography from "@material-ui/core/Typography";
import { Translate } from "react-localize-redux";

import { CharacterStatus } from "goals/CharInventoryCreation/Redux/CharacterInventoryReduxTypes";
import { themeColors } from "types/theme";

interface CharacterStatusTextProps {
  status: CharacterStatus;
  inline?: boolean;
}

export default function CharacterStatusText(props: CharacterStatusTextProps) {
  return (
    <Typography
      variant="body2"
      color="textSecondary"
      component="p"
      style={CharacterStatusStyle(props.status)}
      display={props.inline ? "inline" : "initial"}
    >
      <Translate id={`buttons.${props.status}`} />
    </Typography>
  );
}

function CharacterStatusStyle(status: CharacterStatus) {
  switch (status) {
    case CharacterStatus.Accepted:
      return { color: themeColors.success };
    case CharacterStatus.Rejected:
      return { color: themeColors.error };
  }
}
