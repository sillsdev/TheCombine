import { Card, CardContent, Grid, Typography } from "@mui/material";
import { ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import validator from "validator";

import { Role } from "api/models";
import * as backend from "backend";
import { getProjectId } from "backend/localStorage";
import { LoadingDoneButton } from "components/Buttons";
import { NormalizedTextField } from "utilities/fontComponents";

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
    <Card style={{ width: 450 }}>
      <CardContent>
        <Typography variant="h5" align="center" gutterBottom>
          {t("projectSettings.invite.inviteByEmailLabel")}
        </Typography>
        <NormalizedTextField
          id="project-user-invite-email"
          required
          label={t("projectSettings.invite.emailLabel")}
          onChange={(e) => setEmail(e.target.value)}
          variant="outlined"
          style={{ width: "100%" }}
          margin="normal"
          autoFocus
          inputProps={{ maxLength: 100 }}
        />
        <NormalizedTextField
          id="project-user-invite-message"
          label="Message"
          onChange={(e) => setMessage(e.target.value)}
          variant="outlined"
          style={{ width: "100%" }}
          margin="normal"
        />
        <Grid container justifyContent="flex-end" spacing={2}>
          <Grid item>
            <LoadingDoneButton
              disabled={!isValid}
              loading={isLoading}
              done={isDone}
              buttonProps={{
                id: "project-user-invite-submit",
                onClick: () => onSubmit(),
                variant: "contained",
                color: "primary",
              }}
            >
              {t("buttons.invite")}
            </LoadingDoneButton>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
