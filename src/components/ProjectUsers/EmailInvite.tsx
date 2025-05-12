import { Box, Grid2, Stack, Typography } from "@mui/material";
import { ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import validator from "validator";

import { Role, User } from "api/models";
import * as backend from "backend";
import { getProjectId } from "backend/localStorage";
import { LoadingDoneButton } from "components/Buttons";
import { NormalizedTextField } from "utilities/fontComponents";

interface InviteProps {
  addToProject: (user: User) => void;
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
      props.addToProject(await backend.getUserByEmailOrUsername(email));
      toast.info(t("projectSettings.invite.userExists"));
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
        <Typography variant="h5" align="center">
          {t("projectSettings.invite.inviteByEmailLabel")}
        </Typography>

        <NormalizedTextField
          autoFocus
          fullWidth
          id="project-user-invite-email"
          label={t("projectSettings.invite.emailLabel")}
          onChange={(e) => setEmail(e.target.value)}
          required
          slotProps={{ htmlInput: { maxLength: 100 } }}
        />

        <NormalizedTextField
          fullWidth
          id="project-user-invite-message"
          label={t("projectSettings.invite.emailMessage")}
          onChange={(e) => setMessage(e.target.value)}
          slotProps={{ htmlInput: { maxLength: 10000 } }}
        />

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
            {t("buttons.invite")}
          </LoadingDoneButton>
        </Grid2>
      </Stack>
    </Box>
  );
}
