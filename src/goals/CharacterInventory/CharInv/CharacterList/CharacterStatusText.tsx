import { Typography } from "@mui/material";
import { type ReactElement } from "react";
import { useTranslation } from "react-i18next";

import { CharacterStatus } from "goals/CharacterInventory/CharacterInventoryTypes";

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
      display={props.inline ? "inline" : "initial"}
      sx={{ color: CharStatusColor(props.status) }}
      variant="body2"
    >
      {t(`buttons.${props.status}`)}
    </Typography>
  );
}

function CharStatusColor(status: CharacterStatus): string {
  switch (status) {
    case CharacterStatus.Accepted:
      return "success.main";
    case CharacterStatus.Rejected:
      return "error.main";
    case CharacterStatus.Undecided:
      return "primary.main";
  }
}
