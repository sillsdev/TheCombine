import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid2,
  Stack,
  Typography,
} from "@mui/material";
import { type FormEvent, type ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";

import { resetPassword, validateResetToken } from "backend";
import InvalidLink from "components/InvalidLink";
import { Path } from "types/path";
import { NormalizedTextField } from "utilities/fontComponents";
import { meetsPasswordRequirements } from "utilities/utilities";

export enum PasswordResetIds {
  Password = "PasswordReset.password",
  ConfirmPassword = "PasswordReset.confirm-password",
  SubmitButton = "PasswordReset.button.submit",
}

export default function PasswordReset(): ReactElement {
  const navigate = useNavigate();
  const { token } = useParams();
  const { t } = useTranslation();

  const [isPasswordConfirmed, setIsPasswordConfirmed] = useState(false);
  const [isValidLink, setIsValidLink] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordFitsRequirements, setPasswordFitsRequirements] =
    useState(false);

  useEffect(() => {
    if (token) {
      validateResetToken(token).then(setIsValidLink);
    }
  }, [token]);

  const onSubmit = async (e: FormEvent<HTMLElement>): Promise<void> => {
    if (token) {
      await asyncReset(token, password);
      e.preventDefault();
    }
  };

  const onChangePassword = (
    newPassword: string,
    newConfirmPassword: string
  ): void => {
    setPasswordFitsRequirements(meetsPasswordRequirements(newPassword));
    setIsPasswordConfirmed(newPassword === newConfirmPassword);
    setPassword(newPassword);
    setPasswordConfirm(newConfirmPassword);
  };

  const asyncReset = async (token: string, password: string): Promise<void> => {
    if (await resetPassword(token, password)) {
      toast.success(t("passwordReset.resetSuccess"));
    } else {
      toast.error(t("passwordReset.resetFail"));
    }
    navigate(Path.Login);
  };

  return isValidLink ? (
    <Grid2 container justifyContent="center">
      <Card sx={{ width: 450 }}>
        <CardHeader
          title={
            <Typography align="center" variant="h5">
              {t("passwordReset.resetTitle")}
            </Typography>
          }
        />

        <CardContent>
          <Stack alignItems="flex-end" spacing={2}>
            <NormalizedTextField
              error={!passwordFitsRequirements}
              fullWidth
              helperText={
                !passwordFitsRequirements && t("login.passwordRequirements")
              }
              id="password-reset-password1"
              inputProps={{ "data-testid": PasswordResetIds.Password }}
              label={t("login.password")}
              onChange={(e) =>
                onChangePassword(e.target.value, passwordConfirm)
              }
              type="password"
              value={password}
            />

            <NormalizedTextField
              error={!isPasswordConfirmed && passwordConfirm.length > 0}
              fullWidth
              helperText={
                !isPasswordConfirmed &&
                passwordConfirm.length > 0 &&
                t("login.confirmPasswordError")
              }
              id={PasswordResetIds.ConfirmPassword}
              inputProps={{ "data-testid": PasswordResetIds.ConfirmPassword }}
              label={t("login.confirmPassword")}
              onChange={(e) => onChangePassword(password, e.target.value)}
              type="password"
              value={passwordConfirm}
            />

            <Button
              data-testid={PasswordResetIds.SubmitButton}
              disabled={!(passwordFitsRequirements && isPasswordConfirmed)}
              id={PasswordResetIds.SubmitButton}
              onClick={onSubmit}
              variant="contained"
            >
              {t("passwordReset.submit")}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Grid2>
  ) : (
    <InvalidLink titleTextId="passwordReset.invalidURL" />
  );
}
