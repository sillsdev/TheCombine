import {
  Email,
  HelpOutline,
  MarkEmailRead,
  MarkEmailUnread,
  Phone,
} from "@mui/icons-material";
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
import { FormEvent, Fragment, ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { OffOnSetting, User } from "api/models";
import { isEmailOkay, requestEmailVerify, updateUser } from "backend";
import { getAvatar, getCurrentUser } from "backend/localStorage";
import AnalyticsConsent from "components/AnalyticsConsent";
import IconButtonWithTooltip from "components/Buttons/IconButtonWithTooltip";
import { asyncLoadSemanticDomains } from "components/Project/ProjectActions";
import ClickableAvatar from "components/UserSettings/ClickableAvatar";
import { updateLangFromUser } from "i18n";
import { useAppDispatch, useAppSelector } from "rootRedux/hooks";
import { StoreState } from "rootRedux/types";
import { RuntimeConfig } from "types/runtimeConfig";
import theme from "types/theme";
import { uiWritingSystems } from "types/writingSystem";
import { NormalizedTextField } from "utilities/fontComponents";
import { normalizeEmail } from "utilities/userUtilities";

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

export enum UserSettingsTextId {
  ButtonChangeConsent = "userSettings.analyticsConsent.button",
  ButtonSubmit = "buttons.save",
  FieldEmail = "login.email",
  FieldEmailTaken = "login.emailTaken",
  FieldName = "login.name",
  FieldPhone = "userSettings.phone",
  SelectGlossSuggestionOff = "projectSettings.autocomplete.off",
  SelectGlossSuggestionOn = "projectSettings.autocomplete.on",
  SelectUiLangDefault = "userSettings.uiLanguageDefault",
  ToastEmailVerificationFailed = "userSettings.emailVerify.verificationFailed",
  ToastEmailVerificationSent = "userSettings.emailVerify.verificationSent",
  ToastUpdateSuccess = "userSettings.updateSuccess",
  TooltipEmailUnverified = "userSettings.emailVerify.emailUnverified",
  TooltipEmailVerified = "userSettings.emailVerify.emailVerified",
  TooltipEmailVerifying = "userSettings.emailVerify.emailVerifying",
  TooltipGlossSuggestion = "userSettings.glossSuggestionHint",
  TypographyAnalyticsConsent = "userSettings.analyticsConsent.title",
  TypographyAnalyticsConsentNo = "userSettings.analyticsConsent.consentNo",
  TypographyAnalyticsConsentYes = "userSettings.analyticsConsent.consentYes",
  TypographyContact = "userSettings.contact",
  TypographyGlossSuggestion = "userSettings.glossSuggestion",
  TypographyUiLang = "userSettings.uiLanguage",
  TypographyUsername = "login.username",
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
  const isEmailVerified = useAppSelector(
    (state: StoreState) => state.loginState.isEmailVerified
  );

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
  const [emailVerifySent, setEmailVerifySent] = useState(false);

  const { t } = useTranslation();

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
    if (await isEmailOkay(normalizeEmail(email))) {
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

      toast.success(t(UserSettingsTextId.ToastUpdateSuccess));
      props.setUser(getCurrentUser());
    } else {
      setEmailTaken(true);
    }
  }

  async function sendVerifyEmail(): Promise<void> {
    await requestEmailVerify(email)
      .then(() => {
        setEmailVerifySent(true);
        toast.success(t(UserSettingsTextId.ToastEmailVerificationSent));
      })
      .catch(() =>
        toast.error(t(UserSettingsTextId.ToastEmailVerificationFailed))
      );
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
                    label={t(UserSettingsTextId.FieldName)}
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
                    {t(UserSettingsTextId.TypographyUsername)}
                    {": "}
                    {props.user.username}
                  </Typography>
                </Grid2>
              </Stack>

              {/* Contact: phone, email */}
              <Stack spacing={2}>
                <Typography variant="h6">
                  {t(UserSettingsTextId.TypographyContact)}
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
                      label={t(UserSettingsTextId.FieldPhone)}
                      onChange={(e) => setPhone(e.target.value)}
                      type="tel"
                    />
                  </Grid2>
                </Stack>

                <Stack alignItems="center" direction="row" spacing={1}>
                  {!RuntimeConfig.getInstance().emailServicesEnabled() ? (
                    // Email icon if The Combine has no email capability.
                    <Email />
                  ) : isEmailVerified ? (
                    // Email-w/-check icon if email has been verified.
                    <Tooltip title={t(UserSettingsTextId.TooltipEmailVerified)}>
                      <MarkEmailRead />
                    </Tooltip>
                  ) : emailVerifySent ? (
                    // Disabled email-w/-dot button if verification is pending.
                    <IconButtonWithTooltip
                      icon={<MarkEmailUnread />}
                      textId={UserSettingsTextId.TooltipEmailVerifying}
                    />
                  ) : (
                    // Red email button if email never verified.
                    <IconButtonWithTooltip
                      icon={<Email sx={{ color: "error.main" }} />}
                      onClick={sendVerifyEmail}
                      textId={UserSettingsTextId.TooltipEmailUnverified}
                    />
                  )}

                  <Grid2 size="grow">
                    {/* Don't use NormalizedTextField for type="email".
                    At best, it doesn't normalize, because of the punycode. */}
                    <TextField
                      id={UserSettingsIds.FieldEmail}
                      inputProps={{ "data-testid": UserSettingsIds.FieldEmail }}
                      required
                      fullWidth
                      variant="outlined"
                      value={email}
                      label={t(UserSettingsTextId.FieldEmail)}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailTaken(false);
                      }}
                      error={emailTaken}
                      helperText={
                        emailTaken
                          ? t(UserSettingsTextId.FieldEmailTaken)
                          : undefined
                      }
                      type="email" // silently converts input to punycode
                    />
                  </Grid2>
                </Stack>
              </Stack>

              {/* UI language */}
              <Stack alignItems="flex-start" spacing={2}>
                <Typography variant="h6">
                  {t(UserSettingsTextId.TypographyUiLang)}
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
                      : () => t(UserSettingsTextId.SelectUiLangDefault)
                  }
                >
                  <MenuItem value={""}>
                    {t(UserSettingsTextId.SelectUiLangDefault)}
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
                  {t(UserSettingsTextId.TypographyGlossSuggestion)}
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
                      {t(UserSettingsTextId.SelectGlossSuggestionOff)}
                    </MenuItem>
                    <MenuItem value={OffOnSetting.On}>
                      {t(UserSettingsTextId.SelectGlossSuggestionOn)}
                    </MenuItem>
                  </Select>

                  <Tooltip
                    title={t(UserSettingsTextId.TooltipGlossSuggestion)}
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
                    {t(UserSettingsTextId.TypographyAnalyticsConsent)}
                  </Typography>

                  <Typography>
                    {t(
                      analyticsOn
                        ? UserSettingsTextId.TypographyAnalyticsConsentYes
                        : UserSettingsTextId.TypographyAnalyticsConsentNo
                    )}
                  </Typography>

                  <Button
                    data-testid={UserSettingsIds.ButtonChangeConsent}
                    id={UserSettingsIds.ButtonChangeConsent}
                    onClick={() => setDisplayConsent(true)}
                    variant="outlined"
                  >
                    {t(UserSettingsTextId.ButtonChangeConsent)}
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
                  {t(UserSettingsTextId.ButtonSubmit)}
                </Button>
              </Grid2>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Grid2>
  );
}
