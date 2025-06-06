import { Info } from "@mui/icons-material";
import { Button, Card, Stack, Typography } from "@mui/material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { Path } from "types/path";
import theme from "types/theme";
import { openUserGuide } from "utilities/pathUtilities";

const idAffix = "landing";

const buttonHeight = 56;
const buttonWidth = 144;
const iconButtonWidth = buttonWidth / 4;
const gap = parseInt(theme.spacing(1));
export const horizontalButtonsHeight = buttonHeight + gap;
const horizontalButtonsWidth = 2 * buttonWidth + iconButtonWidth + 2 * gap;
export const verticalButtonsWidth = buttonWidth + 2 * gap;

interface LandingButtonsProps {
  top?: boolean;
}

export default function LandingButtons(
  props: LandingButtonsProps
): ReactElement {
  const navigate = useNavigate();
  return (
    <Card style={{ padding: gap, maxWidth: horizontalButtonsWidth }}>
      <Stack
        direction={props.top ? "row" : "column"}
        justifyContent="space-around"
        spacing={1}
      >
        <SignUpButton />
        <LandingButton
          onClick={() => navigate(Path.Login)}
          textId="login.login"
          buttonId={`${idAffix}-login`}
        />
        <LandingButton
          onClick={() => openUserGuide()}
          textId="userMenu.userGuide"
          buttonId={`${idAffix}-guide`}
          icon={props.top ? <Info /> : undefined}
        />
      </Stack>
    </Card>
  );
}

interface SignUpButtonProps {
  buttonIdPrefix?: string;
}
export function SignUpButton(props: SignUpButtonProps): ReactElement {
  const navigate = useNavigate();

  return (
    <LandingButton
      onClick={() => navigate(Path.Signup)}
      textId="login.signUp"
      buttonId={`${props.buttonIdPrefix ?? idAffix}-signUp`}
      filled
    />
  );
}

interface LandingButtonProps {
  buttonId: string;
  buttonLabel?: string;
  filled?: boolean;
  icon?: ReactElement;
  onClick: () => void;
  textId: string;
}

/** Button for the Landing Page. (Prop `icon` overrides `textId`.) */
function LandingButton(props: LandingButtonProps): ReactElement {
  const { t } = useTranslation();

  return (
    <Button
      aria-label={props.buttonLabel}
      color="primary"
      data-testid={props.buttonId}
      id={props.buttonId}
      onClick={props.onClick}
      style={{
        height: buttonHeight,
        width: props.icon ? iconButtonWidth : buttonWidth,
      }}
      variant={props.filled ? "contained" : "outlined"}
    >
      {props.icon || (
        <Typography variant="subtitle1">{t(props.textId)}</Typography>
      )}
    </Button>
  );
}
