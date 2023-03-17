import Typography from "@mui/material/Typography";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";

import { CharacterStatus } from "goals/CharInventoryCreation/Redux/CharacterInventoryReduxTypes";
import { themeColors } from "types/theme";

interface CharacterStatusTextProps {
  status: CharacterStatus;
  inline?: boolean;
}

export default function CharacterStatusText(
  props: CharacterStatusTextProps
): ReactElement {
  const { t } = useTranslation();

  return (
    <Typography
      variant="body2"
      color="textSecondary"
      component="p"
      style={CharacterStatusStyle(props.status)}
      display={props.inline ? "inline" : "initial"}
    >
      {t(`buttons.${props.status}`)}
    </Typography>
  );
}

function CharacterStatusStyle(status: CharacterStatus): { color: string } {
  switch (status) {
    case CharacterStatus.Accepted:
      return { color: themeColors.success };
    case CharacterStatus.Rejected:
      return { color: themeColors.error };
    case CharacterStatus.Undecided:
      return { color: themeColors.primary };
  }
}
