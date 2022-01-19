import { Avatar, Button, Hidden, Menu, MenuItem } from "@material-ui/core";
import {
  ExitToApp,
  Help,
  Person,
  SettingsApplications,
} from "@material-ui/icons";
import React, { ReactElement, useState } from "react";
import { Translate } from "react-localize-redux";
import { useDispatch } from "react-redux";

import { getUser } from "backend";
import * as LocalStorage from "backend/localStorage";
import history, { openUserGuide, Path } from "browserHistory";
import { clearCurrentProject } from "components/Project/ProjectActions";
import theme, { tabColor } from "types/theme";

const idAffix = "user-menu";

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
 * Avatar in AppBar with dropdown UserMenu
 */
export default function UserMenu(props: UserMenuProps): ReactElement {
  const [anchorElement, setAnchorElement] = useState<HTMLElement | undefined>();
  const avatar = LocalStorage.getAvatar();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  function handleClick(event: React.MouseEvent<HTMLButtonElement>): void {
    setAnchorElement(event.currentTarget);
  }

  function handleClose(): void {
    setAnchorElement(undefined);
  }

  getIsAdmin().then(setIsAdmin);

  return (
    <React.Fragment>
      <Button
        aria-controls="user-menu"
        aria-haspopup="true"
        onClick={handleClick}
        color="secondary"
        style={{ background: tabColor(props.currentTab, Path.UserSettings) }}
        id={`avatar-${idAffix}`}
      >
        <Hidden smDown>{LocalStorage.getCurrentUser()?.username}</Hidden>
        {avatar ? (
          <Avatar alt="User avatar" src={avatar} style={{ marginLeft: 5 }} />
        ) : (
          <Person style={{ fontSize: 40 }} />
        )}
      </Button>
      <Menu
        id={idAffix}
        anchorEl={anchorElement}
        open={Boolean(anchorElement)}
        onClose={handleClose}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
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
export function UserMenuList(props: UserMenuListProps): ReactElement {
  const { REACT_APP_VERSION } = process.env;
  const dispatch = useDispatch();
  return (
    <div ref={props.forwardedRef}>
      {/* Only show Site Settings link to Admin users. */}
      {props.isAdmin && (
        <MenuItem
          id={`${idAffix}-admin`}
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
        id={`${idAffix}-user`}
        onClick={() => {
          history.push(Path.UserSettings);
          props.onSelect();
        }}
      >
        <Person style={{ marginRight: theme.spacing(1) }} />
        <Translate id="userMenu.userSettings" />
      </MenuItem>

      <MenuItem
        id={`${idAffix}-guide`}
        onClick={() => {
          openUserGuide();
          props.onSelect();
        }}
      >
        <Help style={{ marginRight: theme.spacing(1) }} />
        <Translate id="userMenu.userGuide" />
      </MenuItem>

      <MenuItem
        id={`${idAffix}-logout`}
        onClick={() => {
          history.push(Path.Login);
          props.onSelect();
        }}
      >
        <ExitToApp style={{ marginRight: theme.spacing(1) }} />
        <Translate id="userMenu.logout" />
      </MenuItem>

      <MenuItem
        id={`${idAffix}-version`}
        disabled
        style={{ justifyContent: "center" }}
      >
        v{REACT_APP_VERSION}
      </MenuItem>
    </div>
  );
}
