import { Tooltip, IconButton } from "@mui/material";
import { MouseEventHandler, ReactElement, ReactNode } from "react";
import { useTranslation } from "react-i18next";

interface IconButtonWithTooltipProps {
  disabled?: boolean;
  icon: ReactElement;
  text?: ReactNode;
  /** `textId` will only be used if `text` is null or undefined. */
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
          id={props.buttonId}
          data-testid={props.buttonId}
          disabled={props.disabled || !props.onClick}
          onClick={props.onClick}
          size={props.size || "medium"}
        >
          {props.icon}
        </IconButton>
      </span>
    </Tooltip>
  );
}
