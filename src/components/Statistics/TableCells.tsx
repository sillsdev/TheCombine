import { Grid, Typography } from "@mui/material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";

export function ColumnHead(props: { titleId: string }): ReactElement {
  const { t } = useTranslation();
  return (
    <Grid
      item
      xs={5}
      style={{
        borderBottomStyle: "dotted",
        borderBottomWidth: 1,
        position: "relative",
      }}
    >
      <Typography variant="subtitle1">{t(props.titleId)}</Typography>
    </Grid>
  );
}

export function TableCell(props: {
  text?: string | number | null;
}): ReactElement {
  return (
    <Grid
      item
      xs={5}
      style={{
        borderBottomStyle: "dotted",
        borderBottomWidth: 1,
        position: "relative",
      }}
    >
      <Typography variant="body1">{props.text}</Typography>
    </Grid>
  );
}
