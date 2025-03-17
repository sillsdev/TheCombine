import { type SvgIconComponent } from "@mui/icons-material";
import { type CommonProps } from "@mui/material/OverridableComponent";
import { type SvgIconOwnProps } from "@mui/material/SvgIcon";
import { type ReactElement } from "react";

interface BidiIconProps {
  icon: SvgIconComponent;
  iconProps?: CommonProps & SvgIconOwnProps;
}

/** Icon that will flip horizontally if the document is rtl.
 * Warning: overrides `props.iconProps.style.transform`. */
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
