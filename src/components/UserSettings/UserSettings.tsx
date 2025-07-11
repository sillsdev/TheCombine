import { Email, HelpOutline, Phone } from "@mui/icons-material";
import {
  Button,
  Card,
  CardContent,
  Grid2,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { FormEvent, Fragment, ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";

import { OffOnSetting, User } from "api/models";
import {
  getUserIdByEmailOrUsername,
  isEmailOrUsernameAvailable,
  updateUser,
} from "backend";
import { getAvatar, getCurrentUser } from "backend/localStorage";
import AnalyticsConsent from "components/AnalyticsConsent";
import { asyncLoadSemanticDomains } from "components/Project/ProjectActions";
import ClickableAvatar from "components/UserSettings/ClickableAvatar";
import { updateLangFromUser } from "i18n";
import { useAppDispatch } from "rootRedux/hooks";
import { RuntimeConfig } from "types/runtimeConfig";
import theme from "types/theme";
import { uiWritingSystems } from "types/writingSystem";
import { NormalizedTextField } from "utilities/fontComponents";

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

/** Text field of type="email" silently converted its input from Unicode to punycode.
This function trims whitespace, and converts to normalized Unicode. */
const normalizeEmail = (email: string): string =>
  punycode.toUnicode(email.trim()).normalize("NFC");

export function UserSettings(props: {
  user: User;
  setUser: (user?: User) => void;
}): ReactElement {
  const dispatch = useAppDispatch();

  const [name, setName] = useState(props.user.name);
  const [phone, setPhone] = useState(props.user.phone);
  const [email, setEmail] = useState(props.user.email);
  const [displayConsent, setDisplayConsent] = useState(false);
  const [analyticsOn, setAnalyticsOn] = useState(props.user.analyticsOn);
  const [uiLang, setUiLang] = useState(props.user.uiLang ?? "");
  const [glossSuggestion, setGlossSuggestion] = useState(
    props.user.glossSuggestion
  );
  const [emailTaken, setEmailTaken] = useState(false);
  const [avatar, setAvatar] = useState(getAvatar());

  const { t } = useTranslation();

  /** Checks whether email address is okay: unchanged or not taken by a different user. */
  async function isEmailOkay(): Promise<boolean> {
    const unicodeEmail = normalizeEmail(email);
    return (
      unicodeEmail === props.user.email ||
      (await isEmailOrUsernameAvailable(unicodeEmail)) ||
      (await getUserIdByEmailOrUsername(unicodeEmail)) === props.user.id
    );
  }

  const handleConsentChange = (consentVal?: boolean): void => {
    setAnalyticsOn(consentVal ?? analyticsOn);
    setDisplayConsent(false);
  };

  /** For the save button, true if nothing has changed. */
  const disabled =
    name === props.user.name &&
    phone === props.user.phone &&
    normalizeEmail(email) === props.user.email &&
    analyticsOn === props.user.analyticsOn &&
    uiLang === (props.user.uiLang ?? "") &&
    glossSuggestion === props.user.glossSuggestion;

  async function onSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (await isEmailOkay()) {
      await updateUser({
        ...props.user,
        name,
        phone,
        email: normalizeEmail(email),
        analyticsOn,
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
    <Grid2 container justifyContent="center">
      <Card sx={{ width: 450 }}>
        <CardContent>
          <form onSubmit={(e) => onSubmit(e)}>
            <Stack spacing={6}>
              {/* ID: avatar, name, username */}
              <Stack alignItems="center" direction="row" spacing={2}>
                <ClickableAvatar avatar={avatar} setAvatar={setAvatar} />

                <Grid2 size="grow">
                  <NormalizedTextField
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
                    style={{ margin: theme.spacing(1), marginInlineStart: 0 }}
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
                </Grid2>
              </Stack>

              {/* Contact: phone, email */}
              <Stack spacing={2}>
                <Typography variant="h6">
                  {t("userSettings.contact")}
                </Typography>

                <Stack alignItems="center" direction="row" spacing={1}>
                  <Phone />

                  <Grid2 size="grow">
                    <NormalizedTextField
                      id={UserSettingsIds.FieldPhone}
                      inputProps={{ "data-testid": UserSettingsIds.FieldPhone }}
                      fullWidth
                      variant="outlined"
                      value={phone}
                      label={t("userSettings.phone")}
                      onChange={(e) => setPhone(e.target.value)}
                      type="tel"
                    />
                  </Grid2>
                </Stack>

                <Stack alignItems="center" direction="row" spacing={1}>
                  <Email />

                  <Grid2 size="grow">
                    <TextField
                      id={UserSettingsIds.FieldEmail}
                      inputProps={{ "data-testid": UserSettingsIds.FieldEmail }}
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
                  </Grid2>
                </Stack>
              </Stack>

              {/* UI language */}
              <Stack alignItems="flex-start" spacing={2}>
                <Typography variant="h6">
                  {t("userSettings.uiLanguage")}
                </Typography>

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
              </Stack>

              {/* Gloss spelling suggestions */}
              <Stack alignItems="flex-start" spacing={2}>
                <Typography variant="h6">
                  {t("userSettings.glossSuggestion")}
                </Typography>

                <Stack direction="row">
                  <Select
                    data-testid={UserSettingsIds.SelectGlossSuggestion}
                    id={UserSettingsIds.SelectGlossSuggestion}
                    onChange={(e) =>
                      setGlossSuggestion(e.target.value as OffOnSetting)
                    }
                    value={glossSuggestion}
                    variant="standard"
                  >
                    <MenuItem value={OffOnSetting.Off}>
                      {t("projectSettings.autocomplete.off")}
                    </MenuItem>
                    <MenuItem value={OffOnSetting.On}>
                      {t("projectSettings.autocomplete.on")}
                    </MenuItem>
                  </Select>

                  <Tooltip
                    title={t("userSettings.glossSuggestionHint")}
                    placement={document.body.dir === "rtl" ? "left" : "right"}
                  >
                    <HelpOutline fontSize="small" />
                  </Tooltip>
                </Stack>
              </Stack>

              {/* Analytics consent */}
              {!RuntimeConfig.getInstance().isOffline() && (
                <Stack alignItems="flex-start" spacing={2}>
                  <Typography variant="h6">
                    {t("userSettings.analyticsConsent.title")}
                  </Typography>

                  <Typography>
                    {t(
                      analyticsOn
                        ? "userSettings.analyticsConsent.consentYes"
                        : "userSettings.analyticsConsent.consentNo"
                    )}
                  </Typography>

                  <Button
                    data-testid={UserSettingsIds.ButtonChangeConsent}
                    id={UserSettingsIds.ButtonChangeConsent}
                    onClick={() => setDisplayConsent(true)}
                    variant="outlined"
                  >
                    {t("userSettings.analyticsConsent.button")}
                  </Button>

                  {displayConsent && (
                    <AnalyticsConsent
                      onChangeConsent={handleConsentChange}
                      required={false}
                    />
                  )}
                </Stack>
              )}

              {/* Save button */}
              <Grid2 container justifyContent="flex-end">
                <Button
                  data-testid={UserSettingsIds.ButtonSubmit}
                  disabled={disabled}
                  id={UserSettingsIds.ButtonSubmit}
                  type="submit"
                  variant="contained"
                >
                  {t("buttons.save")}
                </Button>
              </Grid2>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Grid2>
  );
}
