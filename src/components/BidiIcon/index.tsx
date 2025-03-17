import { type SvgIconComponent } from "@mui/icons-material";
import { type CommonProps } from "@mui/material/OverridableComponent";
import { type SvgIconOwnProps } from "@mui/material/SvgIcon";
import { type ReactElement } from "react";

interface BidiIconProps {
  icon: SvgIconComponent;
  iconProps?: CommonProps & SvgIconOwnProps & { "data-testid"?: string };
}

/** Icon that will flip horizontally if the document is rtl.
 * Warning: overrides `props.iconProps.style.transform`.
 * Also, cannot receive a ref until we move to React 19
 * (https://react.dev/blog/2024/12/05/react-19#ref-as-a-prop). */
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
