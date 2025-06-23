import { Help } from "@mui/icons-material";
import { Tooltip, Typography } from "@mui/material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";

import theme from "types/theme";

export default function CharacterSetHeader(): ReactElement {
  const { t } = useTranslation();

  return (
    <Typography
      component="h1"
      variant="h4"
      style={{ marginTop: theme.spacing(1) }}
    >
      {t("charInventory.characterSet.title")}{" "}
      <Tooltip
        title={t("charInventory.characterSet.help")}
        placement={document.body.dir === "rtl" ? "left" : "right"}
      >
        <Help />
      </Tooltip>
    </Typography>
  );
}
