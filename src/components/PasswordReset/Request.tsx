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
import LoadingDoneButton from "components/Buttons/LoadingDoneButton";
import Captcha from "components/Login/Captcha";
import { Path } from "types/path";
import { NormalizedTextField } from "utilities/fontComponents";

export enum ResetRequestTextId {
  ButtonSubmit = "passwordReset.submit",
  ButtonLogin = "login.backToLogin",
  Done = "passwordReset.resetDone",
  FieldEmailOrUsername = "passwordReset.emailOrUsername",
  FieldEmailOrUsernameError = "passwordReset.resetFail",
  Instructions = "passwordReset.resetRequestInstructions",
  Title = "passwordReset.resetRequestTitle",
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
              {t(ResetRequestTextId.Title)}
            </Typography>
          }
        />

        <CardContent>
          {isDone ? (
            <Stack alignItems="flex-end" spacing={2}>
              <Typography>{t(ResetRequestTextId.Done)}</Typography>

              <Button onClick={() => navigate(Path.Login)} variant="contained">
                {t(ResetRequestTextId.ButtonLogin)}
              </Button>
            </Stack>
          ) : (
            <form onSubmit={onSubmit}>
              <Stack spacing={1}>
                <Typography>{t(ResetRequestTextId.Instructions)}</Typography>

                <NormalizedTextField
                  fullWidth
                  helperText={
                    isError && t(ResetRequestTextId.FieldEmailOrUsernameError)
                  }
                  label={t(ResetRequestTextId.FieldEmailOrUsername)}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  required
                  value={emailOrUsername}
                />

                <Captcha setSuccess={setIsVerified} />

                {/* Back-to-login and Submit buttons */}
                <Stack direction="row" justifyContent="flex-end" spacing={2}>
                  <Button
                    onClick={() => navigate(Path.Login)}
                    variant="outlined"
                  >
                    {t(ResetRequestTextId.ButtonLogin)}
                  </Button>

                  <LoadingDoneButton
                    disabled={!emailOrUsername || !isVerified}
                    loading={isLoading}
                  >
                    {t(ResetRequestTextId.ButtonSubmit)}
                  </LoadingDoneButton>
                </Stack>
              </Stack>
            </form>
          )}
        </CardContent>
      </Card>
    </Grid2>
  );
}
