import { TableCell, Typography } from "@mui/material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";

export function HeadCell(props: { titleId: string }): ReactElement {
  const { t } = useTranslation();

  return (
    <TableCell sx={{ borderBottomWidth: 1 }}>
      <Typography variant="subtitle1">{t(props.titleId)}</Typography>
    </TableCell>
  );
}

export function Cell(props: { text?: string | number | null }): ReactElement {
  return (
    <TableCell sx={{ borderBottomStyle: "dotted", borderBottomWidth: 1 }}>
      <Typography variant="body1">{props.text}</Typography>
    </TableCell>
  );
}
