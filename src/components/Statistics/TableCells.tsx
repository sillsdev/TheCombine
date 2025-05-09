import { TableCell, Typography } from "@mui/material";
import { CSSProperties, ReactElement } from "react";
import { useTranslation } from "react-i18next";

const cellStyle: CSSProperties = {
  borderBottomStyle: "dotted",
  borderBottomWidth: 1,
  position: "relative",
};

export function HeadCell(props: { titleId: string }): ReactElement {
  const { t } = useTranslation();
  return (
    <TableCell style={cellStyle}>
      <Typography variant="subtitle1">{t(props.titleId)}</Typography>
    </TableCell>
  );
}

export function Cell(props: { text?: string | number | null }): ReactElement {
  return (
    <TableCell style={cellStyle}>
      <Typography variant="body1">{props.text}</Typography>
    </TableCell>
  );
}
