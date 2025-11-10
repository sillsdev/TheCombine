import { TableCell, Typography } from "@mui/material";
import { ReactElement, ReactNode } from "react";
import { useTranslation } from "react-i18next";

export function HeadCell(props: { titleId: string }): ReactElement {
  const { t } = useTranslation();

  return (
    <TableCell sx={{ borderBottomWidth: 1 }}>
      <Typography variant="subtitle1">{t(props.titleId)}</Typography>
    </TableCell>
  );
}

interface CellProps {
  body?: ReactNode;
  text?: string | number | null;
}

export function Cell(props: CellProps): ReactElement {
  const { body, text } = props;
  return (
    <TableCell sx={{ borderBottomStyle: "dotted", borderBottomWidth: 1 }}>
      {body ? body : <Typography variant="body1">{text}</Typography>}
    </TableCell>
  );
}
