import React from "react";
import { Avatar, Button, Menu, MenuItem } from "@material-ui/core";
import { Translate } from "react-localize-redux";
import { ExitToApp, Person, Settings } from "@material-ui/icons";

import history from "../../history";
import theme from "../../types/theme";
import { avatarSrc } from "../../backend";
import { getCurrentUser, getProjectId } from "../../backend/localStorage";

/**
 * Avatar in appbar with dropdown (Project settings, user settings, log out)
 */
export default function UserMenu() {
  const [anchorElement, setAnchorElement] = React.useState<null | HTMLElement>(
    null
  );
  const [avatar, setAvatar] = React.useState<null | string>(null);

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    setAnchorElement(event.currentTarget);
  }

  function handleClose() {
    setAnchorElement(null);
  }

  async function getAvatar() {
    const user = getCurrentUser()!;
    const a = await avatarSrc(user);
    setAvatar(a);
  }

  getAvatar();

  return (
    <div>
      <Button
        aria-controls="user-menu"
        aria-haspopup="true"
        onClick={handleClick}
      >
      {avatar?
      <Avatar alt="User avatar" src={avatar} />
      : <Person style={{ fontSize: 60 }} />}
      </Button>
      <Menu
        getContentAnchorEl={null}
        id="user-menu"
        anchorEl={anchorElement}
        keepMounted
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
        {/* Don't show project settings in the menu if a project hasn't been selected. */}
        {getProjectId() !== "" && (
          <MenuItem
            onClick={() => {
              history.push("/project-settings");
            }}
          >
            <Settings style={{ marginRight: theme.spacing(1) }} />
            <Translate id="userMenu.projectSettings" />
          </MenuItem>
        )}

        <MenuItem
          onClick={() => {
            history.push("/user-settings");
          }}
        >
          <Person style={{ marginRight: theme.spacing(1) }} />
          <Translate id="userMenu.userSettings" />
        </MenuItem>

        <MenuItem
          onClick={() => {
            history.push("/login");
          }}
        >
          <ExitToApp style={{ marginRight: theme.spacing(1) }} />
          <Translate id="userMenu.logout" />
        </MenuItem>
      </Menu>
    </div>
  );
}
