import { Box, Grid2, Stack, Typography } from "@mui/material";
import { ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import validator from "validator";

import { Role } from "api/models";
import * as backend from "backend";
import { getProjectId } from "backend/localStorage";
import LoadingDoneButton from "components/Buttons/LoadingDoneButton";
import { NormalizedTextField } from "utilities/fontComponents";

export enum EmailInviteTextId {
  ButtonSubmit = "buttons.invite",
  TextFieldEmail = "projectSettings.invite.emailLabel",
  TextFieldMessage = "projectSettings.invite.emailMessage",
  ToastUserExists = "projectSettings.invite.userExists",
  TypographyTitle = "projectSettings.invite.inviteByEmailLabel",
}

interface InviteProps {
  addToProject: (userId: string) => void;
  close: () => void;
}

export default function EmailInvite(props: InviteProps): ReactElement {
  const [email, setEmail] = useState("");
  const [isDone, setIsDone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [message, setMessage] = useState("");

  const { t } = useTranslation();

  const onSubmit = async (): Promise<void> => {
    setIsLoading(true);
    if (await backend.isEmailOrUsernameAvailable(email)) {
      await backend.emailInviteToProject(
        getProjectId(),
        Role.Harvester,
        email,
        message
      );
    } else {
      props.addToProject(await backend.getUserIdByEmailOrUsername(email));
      toast.info(t(EmailInviteTextId.ToastUserExists));
    }
    setIsDone(true);
    setIsLoading(false);
    props.close();
  };

  useEffect(() => {
    setIsValid(validator.isEmail(email) && email !== "example@gmail.com");
  }, [email]);

  return (
    <Box sx={{ width: 450 }}>
      <Stack alignContent="center" spacing={2}>
        {/* Title */}
        <Typography variant="h5" align="center">
          {t(EmailInviteTextId.TypographyTitle)}
        </Typography>

        {/* Email address input */}
        <NormalizedTextField
          autoFocus
          fullWidth
          id="project-user-invite-email"
          label={t(EmailInviteTextId.TextFieldEmail)}
          onChange={(e) => setEmail(e.target.value)}
          required
          slotProps={{ htmlInput: { maxLength: 320 } }}
        />

        {/* Email message input */}
        <NormalizedTextField
          fullWidth
          id="project-user-invite-message"
          label={t(EmailInviteTextId.TextFieldMessage)}
          onChange={(e) => setMessage(e.target.value)}
          slotProps={{ htmlInput: { maxLength: 10000 } }}
        />

        {/* Submit button */}
        <Grid2 container justifyContent="flex-end">
          <LoadingDoneButton
            disabled={!isValid}
            loading={isLoading}
            done={isDone}
            buttonProps={{
              id: "project-user-invite-submit",
              onClick: () => onSubmit(),
              variant: "contained",
            }}
          >
            {t(EmailInviteTextId.ButtonSubmit)}
          </LoadingDoneButton>
        </Grid2>
      </Stack>
    </Box>
  );
}
