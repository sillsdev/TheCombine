import { type SxProps, type Theme, Typography } from "@mui/material";
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
      variant="body2"
      color="textSecondary"
      component="p"
      sx={CharacterStatusSx(props.status)}
      display={props.inline ? "inline" : "initial"}
    >
      {t(`buttons.${props.status}`)}
    </Typography>
  );
}

function CharacterStatusSx(status: CharacterStatus): SxProps<Theme> {
  switch (status) {
    case CharacterStatus.Accepted:
      return { color: (t) => t.palette.success.main };
    case CharacterStatus.Rejected:
      return { color: (t) => t.palette.error.main };
    case CharacterStatus.Undecided:
      return { color: (t) => t.palette.primary.main };
  }
}
