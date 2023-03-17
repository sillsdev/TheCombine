import { Tooltip, IconButton } from "@mui/material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  return (
    <Tooltip
      title={props.text ?? (props.textId ? t(props.textId) : false)}
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
