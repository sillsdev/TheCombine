import { Button, Card, Grid, Typography } from "@mui/material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { Path } from "types/path";
import theme from "types/theme";
import { openUserGuide } from "utilities/pathUtilities";

const idAffix = "landing";

const buttonHeight = 50;
const buttonWidth = 145;

export const horizontalButtonsHeight =
  buttonHeight + parseInt(theme.spacing(2));
const horizontalButtonsWidth = 3 * buttonWidth + parseInt(theme.spacing(7));

const verticalButtonsHeight = 3 * buttonHeight + parseInt(theme.spacing(7));
const verticalButtonsWidth = buttonWidth + parseInt(theme.spacing(2));

interface LandingButtonsProps {
  top?: boolean;
}

export default function LandingButtons(
  props: LandingButtonsProps
): ReactElement {
  const navigate = useNavigate();
  return (
    <Card
      style={{
        height: props.top ? horizontalButtonsHeight : verticalButtonsHeight,
        width: props.top ? horizontalButtonsWidth : verticalButtonsWidth,
      }}
    >
      <Grid
        container
        justifyContent="space-around"
        alignItems="center"
        style={{ height: "100%" }}
      >
        <SignUpButton />
        <LandingButton
          onClick={() => navigate(Path.Login)}
          textId="login.login"
          buttonId={`${idAffix}-login`}
        />
        <LandingButton
          onClick={openUserGuide}
          textId="userMenu.userGuide"
          buttonId={`${idAffix}-guide`}
        />
      </Grid>
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
      onClick={() => navigate(Path.SignUp)}
      textId="login.signUp"
      buttonId={`${props.buttonIdPrefix ?? idAffix}-signUp`}
      filled
    />
  );
}

interface LandingButtonProps {
  onClick: () => void;
  textId: string;
  buttonId: string;
  filled?: boolean;
}
function LandingButton(props: LandingButtonProps): ReactElement {
  const { t } = useTranslation();

  return (
    <Grid item style={{ textAlign: "center" }}>
      <Button
        variant={props.filled ? "contained" : "outlined"}
        color="primary"
        onClick={props.onClick}
        style={{ height: buttonHeight, width: buttonWidth }}
        id={props.buttonId}
      >
        <Typography variant="subtitle1">{t(props.textId)}</Typography>
      </Button>
    </Grid>
  );
}
