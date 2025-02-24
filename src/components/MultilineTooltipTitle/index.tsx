import { Typography, TypographyProps } from "@mui/material";
import { ReactElement } from "react";

export default function MultilineTooltipTitle(props: {
  lines: string[];
  typographyProps?: TypographyProps;
}): ReactElement {
  return (
    <>
      {props.lines.map((l, i) => (
        <Typography
          display="block"
          key={i}
          variant="caption"
          {...props.typographyProps}
        >
          {l}
        </Typography>
      ))}
    </>
  );
}
