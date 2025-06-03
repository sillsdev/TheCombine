import { Box, Typography, type TypographyProps } from "@mui/material";
import { type ReactElement } from "react";

interface IconTypographyProps extends TypographyProps {
  icon: ReactElement;
}

export default function IconTypography(
  props: IconTypographyProps
): ReactElement {
  const { children, icon, ...typographyProps } = props;
  return (
    <Typography
      {...typographyProps}
      sx={{ ...typographyProps.sx, display: "inline" }}
    >
      <Box
        component="span"
        sx={{ display: "inline", marginInlineEnd: 1, verticalAlign: "middle" }}
      >
        {icon}
      </Box>
      {children}
    </Typography>
  );
}
