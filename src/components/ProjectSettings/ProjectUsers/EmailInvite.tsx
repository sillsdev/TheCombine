import { Card, CardContent, Grid, TextField, Typography } from "@mui/material";
import { ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import validator from "validator";

import { User } from "api/models";
import * as backend from "backend";
import { getProjectId } from "backend/localStorage";
import LoadingDoneButton from "components/Buttons/LoadingDoneButton";

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
    if (await backend.isEmailTaken(email)) {
      const user = await backend.getUserByEmail(email);
      props.addToProject(user);
      toast.error(t("projectSettings.invite.userExists"));
    } else {
      await backend.emailInviteToProject(getProjectId(), email, message);
    }
    setIsDone(true);
    setIsLoading(false);
    props.close();
  };

  useEffect(() => {
    setIsValid(validator.isEmail(email) && email !== "example@gmail.com");
  }, [email, setIsValid]);

  return (
    <Card style={{ width: 450 }}>
      <CardContent>
        <Typography variant="h5" align="center" gutterBottom>
          {t("projectSettings.invite.inviteByEmailLabel")}
        </Typography>
        <TextField
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
        <TextField
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
