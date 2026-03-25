import { Box, Grid2, Stack, TextField, Typography } from "@mui/material";
import { ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { Role } from "api/models";
import * as backend from "backend";
import { getProjectId } from "backend/localStorage";
import LoadingDoneButton from "components/Buttons/LoadingDoneButton";
import { NormalizedTextField } from "utilities/fontComponents";
import { normalizeEmail } from "utilities/userUtilities";

export enum EmailInviteTextId {
  ButtonSubmit = "buttons.invite",
  TextFieldEmail = "projectSettings.invite.emailLabel",
  TextFieldMessage = "projectSettings.invite.emailMessage",
  ToastInvitationSent = "projectSettings.invite.invitationSent",
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

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setEmail(normalizeEmail(e.target.value));
    setIsValid(e.target.checkValidity());
  };

  const onSubmit = async (): Promise<void> => {
    if (!isValid || isLoading || isDone) {
      return;
    }

    setIsLoading(true);
    try {
      if (await backend.isEmailOrUsernameAvailable(email)) {
        await backend.emailInviteToProject(
          getProjectId(),
          Role.Harvester,
          email,
          message
        );
        toast.success(t(EmailInviteTextId.ToastInvitationSent));
      } else {
        props.addToProject(await backend.getUserIdByEmailOrUsername(email));
        toast.info(t(EmailInviteTextId.ToastUserExists));
      }
      setIsDone(true);
      props.close();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ width: 450 }}>
      <Stack alignContent="center" spacing={2}>
        {/* Title */}
        <Typography variant="h5" align="center">
          {t(EmailInviteTextId.TypographyTitle)}
        </Typography>

        {/* Email address input */}
        {/* Don't use NormalizedTextField for type="email".
        At best, it doesn't normalize, because of the punycode. */}
        <TextField
          autoComplete="off" // invitee's, not user's
          autoFocus
          fullWidth
          id="project-user-invite-email"
          label={t(EmailInviteTextId.TextFieldEmail)}
          onChange={handleEmailChange}
          required
          slotProps={{ htmlInput: { maxLength: 320 } }}
          type="email" // silently converts input to punycode
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
            buttonProps={{ onClick: onSubmit }}
            disabled={!isValid}
            done={isDone}
            loading={isLoading}
          >
            {t(EmailInviteTextId.ButtonSubmit)}
          </LoadingDoneButton>
        </Grid2>
      </Stack>
    </Box>
  );
}
