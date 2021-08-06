import { Avatar, Button, Hidden, Menu, MenuItem } from "@material-ui/core";
import {
  ExitToApp,
  Help,
  Person,
  SettingsApplications,
} from "@material-ui/icons";
import React, { useState } from "react";
import { Translate } from "react-localize-redux";
import { useDispatch } from "react-redux";

import { getUser } from "backend";
import * as LocalStorage from "backend/localStorage";
import history, { openUserGuide, Path } from "browserHistory";
import { clearCurrentProject } from "components/Project/ProjectActions";
import theme, { tabColor } from "types/theme";

export async function getIsAdmin(): Promise<boolean> {
  const userId = LocalStorage.getUserId();
  const user = await getUser(userId);
  if (user) {
    return user.isAdmin;
  }
  return false;
}

interface UserMenuProps {
  currentTab: Path;
}

/**
 * Avatar in appbar with dropdown UserMenu
 */
export default function UserMenu(props: UserMenuProps) {
  const [anchorElement, setAnchorElement] = useState<null | HTMLElement>(null);
  const avatar = LocalStorage.getAvatar();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    setAnchorElement(event.currentTarget);
  }

  function handleClose() {
    setAnchorElement(null);
  }

  getIsAdmin().then(setIsAdmin);

  return (
    <React.Fragment>
      <Button
        aria-controls="user-menu"
        aria-haspopup="true"
        onClick={handleClick}
        color="secondary"
        style={{
          background: tabColor(props.currentTab, Path.UserSettings),
        }}
      >
        <Hidden smDown>{LocalStorage.getCurrentUser()?.username}</Hidden>
        {avatar ? (
          <Avatar alt="User avatar" src={avatar} />
        ) : (
          <Person style={{ fontSize: 40 }} />
        )}
      </Button>
      <Menu
        getContentAnchorEl={null}
        id="user-menu"
        anchorEl={anchorElement}
        open={Boolean(anchorElement)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <WrappedUserMenuList isAdmin={isAdmin} onSelect={handleClose} />
      </Menu>
    </React.Fragment>
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
export function UserMenuList(props: UserMenuListProps) {
  const { REACT_APP_VERSION } = process.env;
  const dispatch = useDispatch();
  return (
    <div ref={props.forwardedRef}>
      {/* Only show Site Settings link to Admin users. */}
      {props.isAdmin && (
        <MenuItem
          onClick={() => {
            dispatch(clearCurrentProject());
            history.push(Path.SiteSettings);
            props.onSelect();
          }}
        >
          <SettingsApplications style={{ marginRight: theme.spacing(1) }} />
          <Translate id="userMenu.siteSettings" />
        </MenuItem>
      )}

      <MenuItem
        onClick={() => {
          history.push(Path.UserSettings);
          props.onSelect();
        }}
      >
        <Person style={{ marginRight: theme.spacing(1) }} />
        <Translate id="userMenu.userSettings" />
      </MenuItem>

      <MenuItem
        onClick={() => {
          openUserGuide();
          props.onSelect();
        }}
      >
        <Help style={{ marginRight: theme.spacing(1) }} />
        <Translate id="userMenu.userGuide" />
      </MenuItem>

      <MenuItem
        onClick={() => {
          history.push(Path.Login);
          props.onSelect();
        }}
      >
        <ExitToApp style={{ marginRight: theme.spacing(1) }} />
        <Translate id="userMenu.logout" />
      </MenuItem>

      <MenuItem disabled style={{ justifyContent: "center" }}>
        v{REACT_APP_VERSION}
      </MenuItem>
    </div>
  );
}
