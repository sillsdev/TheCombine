import { Box, Button, Grid2, Stack, Typography } from "@mui/material";
import { ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import validator from "validator";

import { isEmailOkay, requestEmailVerify, updateUser } from "backend";
import { getCurrentUser } from "backend/localStorage";
import { NormalizedTextField } from "utilities/fontComponents";

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
  const [currentUser] = useState(getCurrentUser()!);
  const [email, setEmail] = useState(currentUser.email);
  const [isTaken, setIsTaken] = useState(false);
  const [isValid, setIsValid] = useState(false);

  const { t } = useTranslation();

  useEffect(() => {
    setIsTaken(false);
    setIsValid(validator.isEmail(email));
  }, [email]);

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
        <NormalizedTextField
          autoFocus
          error={isTaken}
          fullWidth
          helperText={
            isTaken ? t(RequestEmailVerifyTextId.FieldEmailTaken) : undefined
          }
          label={t(RequestEmailVerifyTextId.FieldEmail)}
          onChange={(e) => setEmail(e.target.value)}
          required
          slotProps={{ htmlInput: { maxLength: 320 } }}
          value={email}
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
