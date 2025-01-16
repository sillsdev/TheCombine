import { Email, HelpOutline, Phone } from "@mui/icons-material";
import {
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { FormEvent, Fragment, ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";

import { AutocompleteSetting, User } from "api/models";
import { isEmailTaken, updateUser } from "backend";
import { getAvatar, getCurrentUser } from "backend/localStorage";
import AnalyticsConsent from "components/AnalyticsConsent";
import { asyncLoadSemanticDomains } from "components/Project/ProjectActions";
import ClickableAvatar from "components/UserSettings/ClickableAvatar";
import { updateLangFromUser } from "i18n";
import { useAppDispatch } from "rootRedux/hooks";
import theme from "types/theme";
import { uiWritingSystems } from "types/writingSystem";

// Chrome silently converts non-ASCII characters in a Textfield of type="email".
// Use punycode.toUnicode() to convert them from punycode back to Unicode.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const punycode = require("punycode/");

export enum UserSettingsIds {
  ButtonChangeConsent = "user-settings-change-consent",
  ButtonSubmit = "user-settings-submit",
  FieldEmail = "user-settings-email",
  FieldName = "user-settings-name",
  FieldPhone = "user-settings-phone",
  FieldUsername = "user-settings-username",
  SelectGlossSuggestion = "user-settings-gloss-suggestion",
  SelectUiLang = "user-settings-ui-lang",
}

export default function UserSettingsGetUser(): ReactElement {
  const [potentialUser, setPotentialUser] = useState(getCurrentUser());

  return potentialUser ? (
    <UserSettings user={potentialUser} setUser={setPotentialUser} />
  ) : (
    <Fragment />
  );
}

export function UserSettings(props: {
  user: User;
  setUser: (user?: User) => void;
}): ReactElement {
  const dispatch = useAppDispatch();

  const [name, setName] = useState(props.user.name);
  const [phone, setPhone] = useState(props.user.phone);
  const [email, setEmail] = useState(props.user.email);
  const [displayConsent, setDisplayConsent] = useState(false);
  const [otelConsent, setOtelConsent] = useState(props.user.otelConsent);
  const [uiLang, setUiLang] = useState(props.user.uiLang ?? "");
  const [glossSuggestion, setGlossSuggestion] = useState(
    props.user.glossSuggestion
  );
  const [emailTaken, setEmailTaken] = useState(false);
  const [avatar, setAvatar] = useState(getAvatar());

  const { t } = useTranslation();

  async function isEmailOkay(): Promise<boolean> {
    const unicodeEmail = punycode.toUnicode(email.toLowerCase());
    const unchanged = unicodeEmail === props.user.email.toLowerCase();
    return unchanged || !(await isEmailTaken(unicodeEmail));
  }

  const handleConsentChange = (consentVal?: boolean): void => {
    setOtelConsent(consentVal ?? otelConsent);
    setDisplayConsent(false);
  };

  const disabled =
    name === props.user.name &&
    phone === props.user.phone &&
    punycode.toUnicode(email) === props.user.email &&
    otelConsent === props.user.otelConsent &&
    uiLang === (props.user.uiLang ?? "") &&
    glossSuggestion === props.user.glossSuggestion;

  async function onSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (await isEmailOkay()) {
      await updateUser({
        ...props.user,
        name,
        phone,
        email: punycode.toUnicode(email),
        otelConsent,
        uiLang,
        glossSuggestion,
        hasAvatar: !!avatar,
      });

      // Update the i18n language and in-state semantic domains as needed.
      if (await updateLangFromUser()) {
        await dispatch(asyncLoadSemanticDomains());
      }

      enqueueSnackbar(t("userSettings.updateSuccess"));
      props.setUser(getCurrentUser());
    } else {
      setEmailTaken(true);
    }
  }

  return (
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
                    id={UserSettingsIds.FieldName}
                    fullWidth
                    variant="outlined"
                    value={name}
                    label={t("login.name")}
                    onChange={(e) => setName(e.target.value)}
                    inputProps={{
                      "data-testid": UserSettingsIds.FieldName,
                      maxLength: 100,
                    }}
                    style={{ margin: theme.spacing(1), marginLeft: 0 }}
                  />
                  <Typography
                    data-testid={UserSettingsIds.FieldUsername}
                    id={UserSettingsIds.FieldUsername}
                    style={{ color: "grey" }}
                    variant="subtitle2"
                  >
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
                      id={UserSettingsIds.FieldPhone}
                      inputProps={{
                        "data-testid": UserSettingsIds.FieldPhone,
                      }}
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
                      id={UserSettingsIds.FieldEmail}
                      inputProps={{
                        "data-testid": UserSettingsIds.FieldEmail,
                      }}
                      required
                      fullWidth
                      variant="outlined"
                      value={email}
                      label={t("login.email")}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailTaken(false);
                      }}
                      error={emailTaken}
                      helperText={
                        emailTaken ? t("login.emailTaken") : undefined
                      }
                      type="email"
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
                    data-testid={UserSettingsIds.SelectUiLang}
                    id={UserSettingsIds.SelectUiLang}
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

              <Grid item container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6">
                    {t("userSettings.glossSuggestion")}
                  </Typography>
                </Grid>

                <Grid item>
                  <Select
                    data-testid={UserSettingsIds.SelectGlossSuggestion}
                    id={UserSettingsIds.SelectGlossSuggestion}
                    onChange={(e) =>
                      setGlossSuggestion(e.target.value as AutocompleteSetting)
                    }
                    value={glossSuggestion}
                    variant="standard"
                  >
                    <MenuItem value={AutocompleteSetting.Off}>
                      {t("projectSettings.autocomplete.off")}
                    </MenuItem>
                    <MenuItem value={AutocompleteSetting.On}>
                      {t("projectSettings.autocomplete.on")}
                    </MenuItem>
                  </Select>
                </Grid>

                <Grid item>
                  <Tooltip
                    title={t("userSettings.glossSuggestionHint")}
                    placement={document.body.dir === "rtl" ? "left" : "right"}
                  >
                    <HelpOutline fontSize="small" />
                  </Tooltip>
                </Grid>
              </Grid>

              <Grid item container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6">
                    {t("userSettings.analyticsConsent.title")}
                  </Typography>
                </Grid>

                <Grid item>
                  <Typography>
                    {t(
                      otelConsent
                        ? "userSettings.analyticsConsent.consentYes"
                        : "userSettings.analyticsConsent.consentNo"
                    )}
                  </Typography>
                </Grid>

                <Grid item>
                  <Button
                    data-testid={UserSettingsIds.ButtonChangeConsent}
                    id={UserSettingsIds.ButtonChangeConsent}
                    onClick={() => setDisplayConsent(true)}
                    variant="outlined"
                  >
                    {t("userSettings.analyticsConsent.button")}
                  </Button>
                </Grid>
                {displayConsent ? (
                  <AnalyticsConsent
                    onChangeConsent={handleConsentChange}
                    required={false}
                  />
                ) : null}
              </Grid>

              <Grid item container justifyContent="flex-end">
                <Button
                  data-testid={UserSettingsIds.ButtonSubmit}
                  disabled={disabled}
                  id={UserSettingsIds.ButtonSubmit}
                  type="submit"
                  variant="contained"
                >
                  {t("buttons.save")}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </form>
      </Card>
    </Grid>
  );
}
