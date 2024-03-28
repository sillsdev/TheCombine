import { Info } from "@mui/icons-material";
import { Button, Tooltip } from "@mui/material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";

import { buttonMinHeight } from "components/AppBar/AppBarTypes";
import { themeColors } from "types/theme";
import { openUserGuide } from "utilities/pathUtilities";

export default function UserGuideButton(): ReactElement {
  const { t } = useTranslation();

  return (
    <Tooltip title={t("userMenu.userGuide")}>
      <Button
        color="inherit"
        id="app-bar-guide"
        onClick={() => openUserGuide()}
        style={{
          background: themeColors.lightShade,
          margin: 5,
          minHeight: buttonMinHeight,
          minWidth: 0,
        }}
      >
        <Info />
      </Button>
    </Tooltip>
  );
}
