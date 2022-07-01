import { Grid, Tooltip, Typography } from "@material-ui/core";
import { Help } from "@material-ui/icons";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";

import theme from "types/theme";

export default function CharacterSetHeader(): ReactElement {
  const { t } = useTranslation();

  return (
    <Grid item xs={12}>
      <Typography
        component="h1"
        variant="h4"
        style={{ marginTop: theme.spacing(1) }}
      >
        {t("charInventory.characterSet.title")}{" "}
        <Tooltip title={t("charInventory.characterSet.help")} placement="right">
          <Help />
        </Tooltip>
      </Typography>
    </Grid>
  );
}
