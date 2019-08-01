import history from "../../history";
import React from "react";
import { Button, Menu, MenuItem, Avatar } from "@material-ui/core";
import { Translate } from "react-localize-redux";
import { Settings, ExitToApp, Person } from "@material-ui/icons";
import theme from "../../types/theme";

/**
 * Avatar in appbar with dropdown (Project settings, user settings, log out)
 */
export default function UserMenu() {
  const [anchorElement, setAnchorElement] = React.useState<null | HTMLElement>(
    null
  );

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    setAnchorElement(event.currentTarget);
  }

  function handleClose() {
    setAnchorElement(null);
  }

  return (
    <div>
      <Button
        aria-controls="user-menu"
        aria-haspopup="true"
        onClick={handleClick}
      >
        <Avatar
          alt="User Avatar"
          // TODO: get user's avatar
          src="https://material-ui.com/static/images/avatar/1.jpg"
        />
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
          horizontal: "right"
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right"
        }}
      >
        {/* Don't show project settings on the project creation page ("/") */}
        {history.location.pathname !== "/" && (
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
