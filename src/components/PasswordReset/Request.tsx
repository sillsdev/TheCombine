import { Button, Card, Grid, Typography } from "@mui/material";
import { FormEvent, ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { resetPasswordRequest } from "backend";
import { LoadingDoneButton } from "components/Buttons";
import Captcha from "components/Login/Captcha";
import { Path } from "types/path";
import { NormalizedTextField } from "utilities/fontComponents";

export enum PasswordRequestIds {
  ButtonLogin = "password-request-login",
  ButtonSubmit = "password-request-submit",
  FieldEmailOrUsername = "password-request-text",
}

export default function ResetRequest(): ReactElement {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [isDone, setIsDone] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const { t } = useTranslation();
  const navigate = useNavigate();

  const onSubmit = (event: FormEvent<HTMLElement>): void => {
    event.preventDefault();
    setIsError(false);
    setIsLoading(true);
    resetPasswordRequest(emailOrUsername)
      .then(() => {
        setIsDone(true);
      })
      .catch(() => {
        setIsError(true);
        setIsLoading(false);
      });
  };

  return (
    <Grid container justifyContent="center">
      <Card style={{ padding: 10, width: 450 }}>
        <Typography align="center" variant="h5">
          {t("passwordReset.resetRequestTitle")}
        </Typography>
        {isDone ? (
          <>
            <Typography>{t("passwordReset.resetDone")}</Typography>
            <Grid item>
              <Button
                data-testid={PasswordRequestIds.ButtonLogin}
                id={PasswordRequestIds.ButtonLogin}
                onClick={() => navigate(Path.Login)}
                type="button"
                variant="outlined"
              >
                {t("login.backToLogin")}
              </Button>
            </Grid>
          </>
        ) : (
          <>
            <Typography align="center" variant="subtitle1">
              {t("passwordReset.resetRequestInstructions")}
            </Typography>
            <form onSubmit={onSubmit}>
              <Grid item>
                <NormalizedTextField
                  helperText={isError && t("passwordReset.resetFail")}
                  id={PasswordRequestIds.FieldEmailOrUsername}
                  inputProps={{
                    "data-testid": PasswordRequestIds.FieldEmailOrUsername,
                  }}
                  label={t("passwordReset.emailOrUsername")}
                  margin="normal"
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  required
                  type="text"
                  style={{ width: "100%" }}
                  value={emailOrUsername}
                  variant="outlined"
                />
              </Grid>
              <Grid item>
                <Captcha setSuccess={setIsVerified} />
              </Grid>
              <Grid item>
                <LoadingDoneButton
                  buttonProps={{
                    color: "primary",
                    "data-testid": PasswordRequestIds.ButtonSubmit,
                    id: PasswordRequestIds.ButtonSubmit,
                    onClick: () => onSubmit,
                    variant: "contained",
                  }}
                  disabled={!emailOrUsername || !isVerified}
                  loading={isLoading}
                >
                  {t("passwordReset.submit")}
                </LoadingDoneButton>
              </Grid>
            </form>
          </>
        )}
      </Card>
    </Grid>
  );
}
