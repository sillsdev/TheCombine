import {
  ExitToApp,
  Info,
  Person,
  SettingsApplications,
} from "@mui/icons-material";
import {
  Avatar,
  Button,
  Hidden,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import React, { ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { isSiteAdmin } from "backend";
import * as LocalStorage from "backend/localStorage";
import {
  buttonMinHeight,
  shortenName,
  tabColor,
  TabProps,
} from "components/AppBar/AppBarTypes";
import { clearCurrentProject } from "components/Project/ProjectActions";
import { useAppDispatch } from "types/hooks";
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
  const [anchorElement, setAnchorElement] = useState<HTMLElement | undefined>();
  const avatar = LocalStorage.getAvatar();
  const [isAdmin, setIsAdmin] = useState(false);
  const username = LocalStorage.getCurrentUser()?.username;

  function handleClick(event: React.MouseEvent<HTMLButtonElement>): void {
    setAnchorElement(event.currentTarget);
  }

  function handleClose(): void {
    setAnchorElement(undefined);
  }

  isSiteAdmin().then(setIsAdmin);

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
        {username ? (
          <Hidden lgDown>
            <Typography style={{ marginLeft: 5, marginRight: 5 }}>
              <Hidden xlDown>{shortenName(username, usernameLength.xl)}</Hidden>
              <Hidden xlUp lgDown>
                {shortenName(username, usernameLength.lg)}
              </Hidden>
            </Typography>
          </Hidden>
        ) : (
          <React.Fragment />
        )}
        {avatar ? (
          <Avatar alt="User avatar" src={avatar} />
        ) : (
          <Person style={{ fontSize: 40 }} />
        )}
      </Button>
      <Menu
        anchorEl={anchorElement}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        id={idAffix}
        onClose={handleClose}
        open={Boolean(anchorElement)}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
      >
        <WrappedUserMenuList isAdmin={isAdmin} onSelect={handleClose} />
      </Menu>
    </>
  );
}

// <Menu> automatically applies a ref to its first child for anchoring. The
// following prevents a console warning: "Function components cannot be given refs.
// Attempts to access this ref will fail. Did you mean to use React.forwardRef()?"
const WrappedUserMenuList = React.forwardRef(
  (props: React.ComponentProps<typeof UserMenuList>, ref) => (
    <UserMenuList {...props} forwardedRef={ref} />
  )
);

interface UserMenuListProps {
  isAdmin: boolean;
  onSelect: () => void;
  forwardedRef?: React.ForwardedRef<any>;
}

/**
 * UserMenu options: site settings (for admins), user settings, log out
 */
export function UserMenuList(props: UserMenuListProps): ReactElement {
  const combineAppRelease = RuntimeConfig.getInstance().appRelease();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const iconStyle: React.CSSProperties =
    document.body.dir == "rtl" ? { marginLeft: 6 } : { marginRight: 6 };

  return (
    <div ref={props.forwardedRef}>
      {/* Only show Site Settings link to Admin users. */}
      {props.isAdmin && (
        <MenuItem
          id={`${idAffix}-admin`}
          onClick={() => {
            dispatch(clearCurrentProject());
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
