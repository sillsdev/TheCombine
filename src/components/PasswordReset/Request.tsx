import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid2,
  Stack,
  Typography,
} from "@mui/material";
import { FormEvent, ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

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
    <Grid2 container justifyContent="center">
      <Card sx={{ width: 450 }}>
        <CardHeader
          title={
            <Typography align="center" variant="h5">
              {t("passwordReset.resetRequestTitle")}
            </Typography>
          }
        />

        <CardContent>
          {isDone ? (
            <Stack alignItems="flex-start" spacing={2}>
              <Typography>{t("passwordReset.resetDone")}</Typography>

              <Button
                data-testid={PasswordRequestIds.ButtonLogin}
                id={PasswordRequestIds.ButtonLogin}
                onClick={() => navigate(Path.Login)}
                variant="contained"
              >
                {t("login.backToLogin")}
              </Button>
            </Stack>
          ) : (
            <form onSubmit={onSubmit}>
              <Stack alignItems="flex-start" spacing={1}>
                <Typography>
                  {t("passwordReset.resetRequestInstructions")}
                </Typography>

                <NormalizedTextField
                  fullWidth
                  helperText={isError && t("passwordReset.resetFail")}
                  id={PasswordRequestIds.FieldEmailOrUsername}
                  inputProps={{
                    "data-testid": PasswordRequestIds.FieldEmailOrUsername,
                  }}
                  label={t("passwordReset.emailOrUsername")}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  required
                  value={emailOrUsername}
                />

                <Captcha setSuccess={setIsVerified} />

                <LoadingDoneButton
                  buttonProps={{
                    "data-testid": PasswordRequestIds.ButtonSubmit,
                    id: PasswordRequestIds.ButtonSubmit,
                    type: "submit",
                    variant: "contained",
                  }}
                  disabled={!emailOrUsername || !isVerified}
                  loading={isLoading}
                >
                  {t("passwordReset.submit")}
                </LoadingDoneButton>
              </Stack>
            </form>
          )}
        </CardContent>
      </Card>
    </Grid2>
  );
}
