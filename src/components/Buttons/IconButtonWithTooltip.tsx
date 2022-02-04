import { Tooltip, IconButton } from "@material-ui/core";
import { ReactElement } from "react";
import { Translate } from "react-localize-redux";

interface IconButtonWithTooltipProps {
  icon: ReactElement;
  text?: string;
  textId?: string;
  small?: boolean;
  onClick?: () => void;
  buttonId?: string;
  side?: "bottom" | "left" | "right" | "top";
}

export default function IconButtonWithTooltip(
  props: IconButtonWithTooltipProps
): ReactElement {
  return (
    <Tooltip
      title={
        props.text ?? (props.textId ? <Translate id={props.textId} /> : false)
      }
      placement={props.side ?? "right"}
    >
      <span>
        <IconButton
          onClick={props.onClick}
          size={props.small ? "small" : "medium"}
          id={props.buttonId}
          disabled={!props.onClick}
        >
          {props.icon}
        </IconButton>
      </span>
    </Tooltip>
  );
}
