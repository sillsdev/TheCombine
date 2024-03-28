import { Tooltip, IconButton } from "@mui/material";
import { MouseEventHandler, ReactElement, ReactNode } from "react";
import { useTranslation } from "react-i18next";

interface IconButtonWithTooltipProps {
  disabled?: boolean;
  icon: ReactElement;
  text?: ReactNode;
  textId?: string;
  size?: "large" | "medium" | "small";
  onClick?: MouseEventHandler<HTMLButtonElement>;
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
          size={props.size || "medium"}
          id={props.buttonId}
          disabled={props.disabled || !props.onClick}
        >
          {props.icon}
        </IconButton>
      </span>
    </Tooltip>
  );
}
