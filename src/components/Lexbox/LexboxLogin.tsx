import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import {
  Button,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";
import { ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { type AuthStatus } from "api/models";
import { getAuthStatus, getExternalLoginUrl, logoutCurrentUser } from "backend";
import LoadingButton from "components/Buttons/LoadingButton";

interface LexboxLoginProps {
  text?: string;
  onStatusChange?: (status: "logged-in" | "logged-out") => void;
}

export default function LexboxLogin(props: LexboxLoginProps): ReactElement {
  const { t } = useTranslation();
  const [status, setStatus] = useState<AuthStatus | undefined>(undefined);
  const [statusLoading, setStatusLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const loadStatus = async (): Promise<void> => {
    setStatusLoading(true);
    try {
      setStatus(await getAuthStatus());
    } catch (err) {
      console.error("Failed to load auth status", err);
      setStatus(undefined);
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleLogin = async (): Promise<void> => {
    setActionLoading(true);
    try {
      const url = await getExternalLoginUrl();
      console.info("Opening Lexbox login URL:", url);
      if (url) {
        window.open(url);
      } else {
        console.error("Lexbox login URL is empty");
      }
    } catch (err) {
      console.error("Failed to get Lexbox login URL", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = async (): Promise<void> => {
    setActionLoading(true);
    try {
      logoutCurrentUser();
      await loadStatus();
      props.onStatusChange?.("logged-out");
    } finally {
      setActionLoading(false);
      setMenuAnchor(null);
    }
  };

  const isLoggedIn = status?.loggedIn ?? false;
  const menuOpen = Boolean(menuAnchor);
  const label = status?.loggedInAs ?? t("login.login");

  if (!isLoggedIn) {
    return (
      <LoadingButton
        loading={statusLoading || actionLoading}
        buttonProps={{ onClick: handleLogin, variant: "outlined" }}
      >
        {props.text ?? t("login.login")}
      </LoadingButton>
    );
  }

  return (
    <>
      <Button
        onClick={(event) => setMenuAnchor(event.currentTarget)}
        startIcon={<AccountCircleIcon />}
        variant="outlined"
      >
        {label}
      </Button>
      <Menu
        anchorEl={menuAnchor}
        open={menuOpen}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={handleLogout} disabled={actionLoading}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t("userMenu.logout")}</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
