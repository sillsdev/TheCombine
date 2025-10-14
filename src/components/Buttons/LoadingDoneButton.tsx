import { Check } from "@mui/icons-material";
import { Button, CircularProgress } from "@mui/material";
import { ButtonProps } from "@mui/material/Button";
import { ReactElement, ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { themeColors } from "types/theme";

interface LoadingDoneButtonProps {
  buttonProps?: ButtonProps;
  children?: ReactNode;
  disabled?: boolean;
  done?: boolean;
  doneText?: ReactNode | string;
  loading?: boolean;
}

/**
 * A button that shows a spinning wheel when loading and "done" when done
 */
export default function LoadingDoneButton(
  props: LoadingDoneButtonProps
): ReactElement {
  const { t } = useTranslation();

  return (
    <Button
      type="submit"
      variant="contained"
      {...props.buttonProps}
      disabled={props.disabled || props.loading}
      style={{
        backgroundColor: props.done ? themeColors.success : undefined,
        color: props.done ? "white" : undefined,
        ...props.buttonProps?.style,
      }}
    >
      {props.done ? (
        <>
          <Check />
          {props.doneText ?? t("buttons.done")}
        </>
      ) : (
        props.children
      )}
      {props.loading && !props.done && (
        <CircularProgress
          size={24}
          style={{
            color: themeColors.success,
            position: "absolute",
            top: "50%",
            left: "50%",
            marginTop: -12,
            marginLeft: -12,
          }}
        />
      )}
    </Button>
  );
}
