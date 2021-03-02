import { Tooltip, IconButton } from "@material-ui/core";
import React from "react";
import { Translate } from "react-localize-redux";

interface IconButtonWithTooltipProps {
  icon: JSX.Element;
  textId: string;
  small?: boolean;
  onClick?: () => void;
}

export default function IconButtonWithTooltip(
  props: IconButtonWithTooltipProps
) {
  return (
    <Tooltip title={<Translate id={props.textId} />} placement="right">
      <IconButton
        onClick={props.onClick}
        size={props.small ? "small" : "medium"}
      >
        {props.icon}
      </IconButton>
    </Tooltip>
  );
}
