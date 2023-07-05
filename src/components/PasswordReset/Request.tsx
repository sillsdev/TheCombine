import { Card, Grid, TextField, Typography } from "@mui/material";
import { FormEvent, ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { isEmailTaken, isUsernameTaken, resetPasswordRequest } from "backend";
import { LoadingDoneButton } from "components/Buttons";
import { useAppDispatch } from "types/hooks";
import { Path } from "types/path";

export default function ResetRequest(): ReactElement {
  const dispatch = useAppDispatch();
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [isDone, setIsDone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const onSubmit = (event: FormEvent<HTMLElement>): void => {
    event.preventDefault();
    setIsLoading(true);
    setTimeout(() => tryResetRequest(), 1000);
  };

  const tryResetRequest = async (): Promise<void> => {
    setIsLoading(true);
    const exists =
      (await isEmailTaken(emailOrUsername)) ||
      (await isUsernameTaken(emailOrUsername));
    if (exists) {
      await resetPasswordRequest(emailOrUsername);
      setIsDone(true);
      setTimeout(() => navigate(Path.Login), 1000);
    } else {
      setIsNotFound(true);
    }
    setIsLoading(false);
  };

  const setTextField = (text: string): void => {
    setEmailOrUsername(text);
    setIsNotFound(false);
  };

  return (
    <div>
      <Grid container justifyContent="center">
        <Card style={{ padding: 10, width: 450 }}>
          <Typography variant="h5" align="center">
            {t("passwordReset.resetRequestTitle")}
          </Typography>
          <Typography variant="subtitle1" align="center">
            {t("passwordReset.resetRequestInstructions")}
          </Typography>
          <form onSubmit={onSubmit}>
            <Grid item>
              <TextField
                id="password-reset-request-text"
                required
                type="text"
                variant="outlined"
                label={t("passwordReset.emailOrUsername")}
                value={emailOrUsername}
                style={{ width: "100%" }}
                error={isNotFound}
                helperText={isNotFound && t("passwordReset.notFoundError")}
                margin="normal"
                onChange={(e) => setTextField(e.target.value)}
              />
            </Grid>
            <Grid item>
              <LoadingDoneButton
                disabled={!emailOrUsername}
                loading={isLoading}
                done={isDone}
                buttonProps={{
                  onClick: () => onSubmit,
                  variant: "contained",
                  color: "primary",
                  id: "password-reset-request",
                }}
              >
                {t("passwordReset.submit")}
              </LoadingDoneButton>
            </Grid>
          </form>
        </Card>
      </Grid>
    </div>
  );
}
