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
import { meetsPasswordRequirements } from "utilities/userUtilities";

export enum PasswordResetTextId {
  ButtonSubmit = "passwordReset.submit",
  FieldPassword1 = "login.password",
  FieldPassword1Hint = "login.passwordRequirements",
  FieldPassword2 = "login.confirmPassword",
  FieldPassword2Error = "login.confirmPasswordError",
  Invalid = "passwordReset.invalidURL",
  ToastSuccess = "passwordReset.resetSuccess",
  ToastFail = "passwordReset.resetFail",
  Title = "passwordReset.resetTitle",
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
      toast.success(t(PasswordResetTextId.ToastSuccess));
    } else {
      toast.error(t(PasswordResetTextId.ToastFail));
    }
    navigate(Path.Login);
  };

  return isValidLink ? (
    <Grid2 container justifyContent="center">
      <Card sx={{ width: 450 }}>
        <CardHeader
          title={
            <Typography align="center" variant="h5">
              {t(PasswordResetTextId.Title)}
            </Typography>
          }
        />

        <CardContent>
          <Stack alignItems="flex-end" spacing={2}>
            <NormalizedTextField
              error={!passwordFitsRequirements}
              fullWidth
              helperText={
                !passwordFitsRequirements &&
                t(PasswordResetTextId.FieldPassword1Hint)
              }
              id="password-reset-password1"
              label={t(PasswordResetTextId.FieldPassword1)}
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
                t(PasswordResetTextId.FieldPassword2Error)
              }
              label={t(PasswordResetTextId.FieldPassword2)}
              onChange={(e) => onChangePassword(password, e.target.value)}
              type="password"
              value={passwordConfirm}
            />

            <Button
              disabled={!(passwordFitsRequirements && isPasswordConfirmed)}
              onClick={onSubmit}
              variant="contained"
            >
              {t(PasswordResetTextId.ButtonSubmit)}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Grid2>
  ) : (
    <InvalidLink titleTextId={PasswordResetTextId.Invalid} />
  );
}
