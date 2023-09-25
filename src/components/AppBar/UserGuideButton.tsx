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
        id="app-bar-guide"
        onClick={openUserGuide}
        color="inherit"
        style={{
          background: themeColors.lightShade,
          minHeight: buttonMinHeight,
          minWidth: 0,
          margin: 5,
        }}
      >
        <Info />
      </Button>
    </Tooltip>
  );
}
