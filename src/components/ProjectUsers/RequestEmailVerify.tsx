import {
  Box,
  Button,
  Grid2,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { ReactElement, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { isEmailOkay, requestEmailVerify, updateUser } from "backend";
import { getCurrentUser } from "backend/localStorage";
import { normalizeEmail } from "utilities/userUtilities";

export enum RequestEmailVerifyTextId {
  ButtonCancel = "buttons.cancel",
  ButtonSubmit = "userSettings.verifyEmail.button",
  FieldEmail = "login.email",
  FieldEmailTaken = "login.isTaken",
  Title = "userSettings.verifyEmail.title",
}

interface RequestEmailVerifyProps {
  onCancel: () => void;
  onSubmit: () => void;
}

export default function RequestEmailVerify(
  props: RequestEmailVerifyProps
): ReactElement {
  const emailRef = useRef<HTMLInputElement>(null);

  const [currentUser] = useState(getCurrentUser()!);
  const [email, setEmail] = useState(currentUser.email);
  const [emailPunycode, setEmailPunycode] = useState(currentUser.email);
  const [isTaken, setIsTaken] = useState(false);
  const [isValid, setIsValid] = useState(false);

  const { t } = useTranslation();

  useEffect(() => {
    setEmail(normalizeEmail(emailPunycode));
    setIsTaken(false);
  }, [emailPunycode]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setIsValid(emailRef.current?.checkValidity() ?? false);
    setEmailPunycode(e.target.value);
  };

  const onSubmit = async (): Promise<void> => {
    if (!(await isEmailOkay(email))) {
      setIsTaken(true);
      return;
    }

    if (email !== currentUser.email) {
      await updateUser({ ...currentUser, email });
    }
    await requestEmailVerify(email);
    props.onSubmit();
  };

  return (
    <Box sx={{ width: 450 }}>
      <Stack spacing={2}>
        {/* Title */}
        <Typography align="center" variant="h6">
          {t(RequestEmailVerifyTextId.Title)}
        </Typography>

        {/* Email address */}
        {/* Don't use NormalizedTextField for type="email".
        At best, it doesn't normalize, because of the punycode. */}
        <TextField
          autoComplete="email"
          autoFocus
          error={isTaken}
          fullWidth
          helperText={
            isTaken ? t(RequestEmailVerifyTextId.FieldEmailTaken) : undefined
          }
          label={t(RequestEmailVerifyTextId.FieldEmail)}
          onChange={handleEmailChange}
          ref={emailRef}
          required
          slotProps={{ htmlInput: { maxLength: 320 } }}
          type="email" // silently converts input to punycode
          value={emailPunycode}
        />

        {/* Buttons: cancel, submit */}
        <Grid2 container justifyContent="flex-end" spacing={2}>
          <Button onClick={props.onCancel} variant="outlined">
            {t(RequestEmailVerifyTextId.ButtonCancel)}
          </Button>

          <Button disabled={!isValid} onClick={onSubmit} variant="contained">
            {t(RequestEmailVerifyTextId.ButtonSubmit)}
          </Button>
        </Grid2>
      </Stack>
    </Box>
  );
}
