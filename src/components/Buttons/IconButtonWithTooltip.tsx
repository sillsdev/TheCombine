import { Tooltip, IconButton } from "@material-ui/core";
import { ReactElement } from "react";
import { Translate } from "react-localize-redux";

interface IconButtonWithTooltipProps {
  icon: ReactElement;
  textId: string;
  small?: boolean;
  onClick?: () => void;
  buttonId?: string;
}

export default function IconButtonWithTooltip(
  props: IconButtonWithTooltipProps
): ReactElement {
  return (
    <Tooltip title={<Translate id={props.textId} />} placement="right">
      <IconButton
        onClick={props.onClick}
        size={props.small ? "small" : "medium"}
        id={props.buttonId}
      >
        {props.icon}
      </IconButton>
    </Tooltip>
  );
}
