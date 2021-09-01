import { Tooltip, IconButton } from "@material-ui/core";
import { Translate } from "react-localize-redux";

interface IconButtonWithTooltipProps {
  icon: JSX.Element;
  textId: string;
  small?: boolean;
  onClick?: () => void;
  buttonId?: string;
}

export default function IconButtonWithTooltip(
  props: IconButtonWithTooltipProps
) {
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
