import { IconButton, Tooltip } from "@mui/material";
import { MouseEventHandler, ReactElement, ReactNode } from "react";
import { useTranslation } from "react-i18next";

export interface IconButtonWithTooltipProps {
  buttonId?: string;
  buttonLabel?: string;
  disabled?: boolean;
  icon: ReactElement;
  text?: ReactNode;
  /** `textId` will only be used if `text` is null or undefined. */
  textId?: string;
  size?: "large" | "medium" | "small";
  onClick?: MouseEventHandler<HTMLButtonElement>;
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
          aria-label={props.buttonLabel}
          data-testid={props.buttonId}
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
