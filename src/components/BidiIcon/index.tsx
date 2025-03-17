import { SvgIconComponent } from "@mui/icons-material";
import { SvgIconOwnProps } from "@mui/material";
import { CommonProps } from "@mui/material/OverridableComponent";
import { ReactElement } from "react";

interface BidiIconProps {
  icon: SvgIconComponent;
  iconProps?: CommonProps & SvgIconOwnProps;
}

/** Icon that will flip horizontally if the document is rtl. */
export default function BidiIcon(props: BidiIconProps): ReactElement {
  return (
    <props.icon
      {...props.iconProps}
      style={{
        ...props.iconProps?.style,
        transform: document.body.dir === "rtl" ? "scaleX(-1)" : undefined,
      }}
    />
  );
}
