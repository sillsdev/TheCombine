import { Avatar, Button, Menu, MenuItem } from "@material-ui/core";
import { ExitToApp, Person, SettingsApplications } from "@material-ui/icons";
import React, { useState } from "react";
import { Translate } from "react-localize-redux";

import { getUser } from "../../backend";
import * as LocalStorage from "../../backend/localStorage";
import history, { Path } from "../../history";
import theme from "../../types/theme";
import { User } from "../../types/user";

export async function getIsAdmin(): Promise<boolean> {
  const userId = LocalStorage.getUserId();
  return await getUser(userId)
    .then((user: User) => {
      return user.isAdmin;
    })
    .catch((err) => {
      console.log(err);
      return false;
    });
}

/**
 * Avatar in appbar with dropdown UserMenu
 */
export default function UserMenu() {
  const [anchorElement, setAnchorElement] = useState<null | HTMLElement>(null);
  const avatar = LocalStorage.getAvatar();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    setAnchorElement(event.currentTarget);
  }

  function handleClose() {
    setAnchorElement(null);
  }

  getIsAdmin().then((result) => setIsAdmin(result));

  return (
    <React.Fragment>
      <Button
        aria-controls="user-menu"
        aria-haspopup="true"
        onClick={handleClick}
        color="secondary"
      >
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
        <UserMenuList isAdmin={isAdmin} />
      </Menu>
    </React.Fragment>
  );
}

interface UserMenuListProps {
  isAdmin: boolean;
}

/**
 * UserMenu options: site settings (for admins), user settings, log out
 */
export function UserMenuList(props: UserMenuListProps) {
  const { REACT_APP_VERSION } = process.env;
  return (
    <React.Fragment>
      {/* Only show Site Settings link to Admin users. */}
      {props.isAdmin && (
        <MenuItem
          onClick={() => {
            LocalStorage.setProjectId("");
            history.push(Path.SiteSettings);
          }}
        >
          <SettingsApplications style={{ marginRight: theme.spacing(1) }} />
          <Translate id="userMenu.siteSettings" />
        </MenuItem>
      )}

      <MenuItem
        onClick={() => {
          history.push(Path.UserSettings);
        }}
      >
        <Person style={{ marginRight: theme.spacing(1) }} />
        <Translate id="userMenu.userSettings" />
      </MenuItem>

      <MenuItem
        onClick={() => {
          history.push(Path.Login);
        }}
      >
        <ExitToApp style={{ marginRight: theme.spacing(1) }} />
        <Translate id="userMenu.logout" />
      </MenuItem>
      <MenuItem disabled style={{ justifyContent: "center" }}>
        v{REACT_APP_VERSION}
      </MenuItem>
    </React.Fragment>
  );
}
