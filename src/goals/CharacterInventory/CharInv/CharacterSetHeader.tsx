import { Help } from "@mui/icons-material";
import { Tooltip, Typography } from "@mui/material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";

export default function CharacterSetHeader(): ReactElement {
  const { t } = useTranslation();

  return (
    <Typography component="h1" sx={{ mt: 1 }} variant="h4">
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
