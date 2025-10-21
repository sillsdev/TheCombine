import {
  ExitToApp,
  Info,
  Person,
  SettingsApplications,
} from "@mui/icons-material";
import {
  Avatar,
  Button,
  Menu,
  MenuItem,
  type Theme,
  Typography,
  useMediaQuery,
} from "@mui/material";
import {
  type CSSProperties,
  type ForwardedRef,
  type MouseEvent,
  type ReactElement,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import * as LocalStorage from "backend/localStorage";
import {
  type TabProps,
  buttonMinHeight,
  shortenName,
  tabColor,
} from "components/AppBar/AppBarTypes";
import { useAppSelector } from "rootRedux/hooks";
import { Path } from "types/path";
import { RuntimeConfig } from "types/runtimeConfig";
import { openUserGuide } from "utilities/pathUtilities";

const idAffix = "user-menu";

const enum usernameLength {
  lg = 12,
  xl = 24,
}

/**
 * Avatar in AppBar with dropdown UserMenu
 */
export default function UserMenu(props: TabProps): ReactElement {
  const isAdmin = useAppSelector((state) => state.loginState.isAdmin);

  const [anchorElement, setAnchorElement] = useState<HTMLElement | undefined>();
  const avatar = LocalStorage.getAvatar();
  const username = LocalStorage.getCurrentUser()?.username;

  const horizontal = document.body.dir === "rtl" ? "left" : "right";
  const isLgUp = useMediaQuery<Theme>((th) => th.breakpoints.up("lg"));
  const isXl = useMediaQuery<Theme>((th) => th.breakpoints.only("xl"));
  const nameLength = isXl ? usernameLength.xl : usernameLength.lg;

  function handleClick(event: MouseEvent<HTMLButtonElement>): void {
    setAnchorElement(event.currentTarget);
  }

  function handleClose(): void {
    setAnchorElement(undefined);
  }

  return (
    <>
      <Button
        aria-controls="user-menu"
        aria-haspopup="true"
        color="secondary"
        id={`avatar-${idAffix}`}
        onClick={handleClick}
        style={{
          background: tabColor(props.currentTab, Path.UserSettings),
          minHeight: buttonMinHeight,
          minWidth: 0,
          padding: 0,
        }}
      >
        {!!username && isLgUp && (
          <Typography style={{ marginInline: 5 }}>
            {shortenName(username, nameLength)}
          </Typography>
        )}
        {avatar ? (
          <Avatar alt="User avatar" src={avatar} />
        ) : (
          <Person style={{ fontSize: 40 }} />
        )}
      </Button>
      <Menu
        anchorEl={anchorElement}
        anchorOrigin={{ horizontal, vertical: "bottom" }}
        id={idAffix}
        onClose={handleClose}
        open={Boolean(anchorElement)}
        transformOrigin={{ horizontal, vertical: "top" }}
      >
        <UserMenuList isAdmin={isAdmin} onSelect={handleClose} />
      </Menu>
    </>
  );
}

interface UserMenuListProps {
  isAdmin: boolean;
  onSelect: () => void;
  forwardedRef?: ForwardedRef<any>;
}

/**
 * UserMenu options: site settings (for admins), user settings, log out
 */
export function UserMenuList(props: UserMenuListProps): ReactElement {
  const combineAppRelease = RuntimeConfig.getInstance().appRelease();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const iconStyle: CSSProperties = { marginInlineEnd: 6 };

  return (
    <div ref={props.forwardedRef}>
      {/* Only show Site Settings link to Admin users. */}
      {props.isAdmin && (
        <MenuItem
          id={`${idAffix}-admin`}
          onClick={() => {
            navigate(Path.SiteSettings);
            props.onSelect();
          }}
        >
          <SettingsApplications style={iconStyle} />
          {t("userMenu.siteSettings")}
        </MenuItem>
      )}

      <MenuItem
        id={`${idAffix}-user`}
        onClick={() => {
          navigate(Path.UserSettings);
          props.onSelect();
        }}
      >
        <Person style={iconStyle} />
        {t("userMenu.userSettings")}
      </MenuItem>

      <MenuItem
        id={`${idAffix}-guide`}
        onClick={() => {
          openUserGuide();
          props.onSelect();
        }}
      >
        <Info style={iconStyle} />
        {t("userMenu.userGuide")}
      </MenuItem>

      <MenuItem
        id={`${idAffix}-logout`}
        onClick={() => {
          navigate(Path.Login);
          props.onSelect();
        }}
      >
        <ExitToApp style={iconStyle} />
        {t("userMenu.logout")}
      </MenuItem>

      <MenuItem
        disabled
        id={`${idAffix}-version`}
        style={{ justifyContent: "center" }}
      >
        {combineAppRelease}
      </MenuItem>
    </div>
  );
}
