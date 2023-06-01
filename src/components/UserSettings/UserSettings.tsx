import { Email, Phone } from "@mui/icons-material";
import {
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { validate } from "email-validator";
import { useSnackbar } from "notistack";
import { FormEvent, Fragment, ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";

import { User } from "api/models";
import { isEmailTaken, updateUser } from "backend";
import { getAvatar, getCurrentUser } from "backend/localStorage";
import ClickableAvatar from "components/UserSettings/ClickableAvatar";
import { updateLangFromUser } from "i18n";
import theme from "types/theme";
import { uiWritingSystems } from "types/writingSystem";

const idAffix = "user-settings";

export default (): ReactElement => {
  const potentialUser = getCurrentUser();
  return potentialUser ? <UserSettings user={potentialUser} /> : <Fragment />;
};

export function UserSettings(props: { user: User }): ReactElement {
  const [name, setName] = useState(props.user.name);
  const [phone, setPhone] = useState(props.user.phone);
  const [uiLang, setUiLang] = useState(props.user.uiLang ?? "");
  const [email, setEmail] = useState(props.user.email);
  const [emailInvalid, setEmailInvalid] = useState(false);
  const [emailTaken, setEmailTaken] = useState(false);
  const [avatar, setAvatar] = useState(getAvatar());

  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();

  async function isEmailOkay(): Promise<boolean> {
    if (emailInvalid) {
      return false;
    }
    const unchanged = email.toLowerCase() === props.user.email.toLowerCase();
    if (unchanged) {
      return true;
    }
    if (await isEmailTaken(email)) {
      setEmailTaken(true);
      return false;
    }
    return true;
  }

  function onEmailChange(email: string): void {
    setEmail(email);
    setEmailInvalid(!validate(email));
    setEmailTaken(false);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (await isEmailOkay()) {
      await updateUser({ ...props.user, name, phone, email, uiLang });
      updateLangFromUser();
      enqueueSnackbar(t("userSettings.updateSuccess"));
    }
  }

  return (
    <>
      <Grid container justifyContent="center">
        <Card style={{ width: 450 }}>
          <form onSubmit={(e) => onSubmit(e)}>
            <CardContent>
              <Grid item container spacing={6}>
                <Grid item container spacing={2} alignItems="center">
                  <Grid item>
                    <ClickableAvatar avatar={avatar} setAvatar={setAvatar} />
                  </Grid>
                  <Grid item xs>
                    <TextField
                      id={`${idAffix}-name`}
                      fullWidth
                      variant="outlined"
                      value={name}
                      label={t("login.name")}
                      onChange={(e) => setName(e.target.value)}
                      inputProps={{ maxLength: 100 }}
                      style={{ margin: theme.spacing(1), marginLeft: 0 }}
                    />
                    <Typography variant="subtitle2" style={{ color: "grey" }}>
                      {t("login.username")}
                      {": "}
                      {props.user.username}
                    </Typography>
                  </Grid>
                </Grid>

                <Grid item container spacing={2}>
                  <Grid item>
                    <Typography variant="h6">
                      {t("userSettings.contact")}
                    </Typography>
                  </Grid>

                  <Grid item container spacing={1} alignItems="center">
                    <Grid item>
                      <Phone />
                    </Grid>
                    <Grid item xs>
                      <TextField
                        id={`${idAffix}-phone`}
                        fullWidth
                        variant="outlined"
                        value={phone}
                        label={t("userSettings.phone")}
                        onChange={(e) => setPhone(e.target.value)}
                        type="tel"
                      />
                    </Grid>
                  </Grid>

                  <Grid item container spacing={1} alignItems="center">
                    <Grid item>
                      <Email />
                    </Grid>
                    <Grid item xs>
                      <TextField
                        id={`${idAffix}-email`}
                        required
                        fullWidth
                        variant="outlined"
                        value={email}
                        label={t("login.email")}
                        onChange={(e) => onEmailChange(e.target.value)}
                        error={emailInvalid || emailTaken}
                        helperText={
                          emailInvalid
                            ? t("login.emailInvalid")
                            : emailTaken
                            ? t("login.emailTaken")
                            : undefined
                        }
                      />
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="h6">
                      {t("userSettings.uiLanguage")}
                    </Typography>
                  </Grid>

                  <Grid item>
                    <Select
                      variant="standard"
                      id="ui-language"
                      value={uiLang}
                      onChange={(e) => setUiLang(e.target.value ?? "")}
                      /* Use `displayEmpty` and a conditional `renderValue` function to force
                       * something to appear when the menu is closed and its value is "" */
                      displayEmpty
                      renderValue={
                        uiLang
                          ? undefined
                          : () => t("userSettings.uiLanguageDefault")
                      }
                    >
                      <MenuItem value={""}>
                        {t("userSettings.uiLanguageDefault")}
                      </MenuItem>
                      {uiWritingSystems.map((ws) => (
                        <MenuItem key={ws.bcp47} value={ws.bcp47}>
                          {`${ws.bcp47} (${ws.name})`}
                        </MenuItem>
                      ))}
                    </Select>
                  </Grid>
                </Grid>

                <Grid item container justifyContent="flex-end">
                  <Button
                    type="submit"
                    variant="contained"
                    id={`${idAffix}-save`}
                  >
                    {t("buttons.save")}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </form>
        </Card>
      </Grid>
    </>
  );
}
