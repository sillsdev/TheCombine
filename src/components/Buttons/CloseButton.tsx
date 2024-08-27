import { Close } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { CSSProperties, ReactElement } from "react";

interface CloseButtonProps {
  buttonId?: string;
  buttonLabel?: string;
  close: () => void;
}

export default function CloseButton(props: CloseButtonProps): ReactElement {
  const closeButtonStyle: CSSProperties = {
    position: "absolute",
    top: 0,
    ...(document.body.dir === "rtl" ? { left: 0 } : { right: 0 }),
  };

  return (
    <IconButton
      aria-label={props.buttonLabel ?? "Close"}
      data-testid={props.buttonId}
      id={props.buttonId}
      onClick={props.close}
      style={closeButtonStyle}
    >
      <Close />
    </IconButton>
  );
}
