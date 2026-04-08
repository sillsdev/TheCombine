import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import {
  Button,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";
import { type ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { type LexboxAuthStatus } from "api/models";
import {
  getLexboxAuthStatus,
  getLexboxLoginUrl,
  logoutLexboxUser,
} from "backend";
import LoadingButton from "components/Buttons/LoadingButton";

interface LexboxLoginProps {
  text?: string;
  onStatusChange?: (loggedIn: boolean) => void;
}

export default function LexboxLogin(props: LexboxLoginProps): ReactElement {
  const [actionLoading, setActionLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [status, setStatus] = useState<LexboxAuthStatus | undefined>();
  const [statusLoading, setStatusLoading] = useState(true);

  const { t } = useTranslation();

  const loadStatus = async (): Promise<void> => {
    setStatusLoading(true);
    try {
      setStatus(await getLexboxAuthStatus());
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

  useEffect(() => {
    setIsLoggedIn(status?.isLoggedIn ?? false);
  }, [status?.isLoggedIn]);

  useEffect(() => {
    props.onStatusChange?.(isLoggedIn);
  }, [props.onStatusChange, isLoggedIn]);

  const handleLogin = (): void => {
    if (!window.open(getLexboxLoginUrl())) {
      toast.error("Failed to open login window");
    }
  };

  const handleLogout = async (): Promise<void> => {
    setActionLoading(true);
    try {
      await logoutLexboxUser();
      await loadStatus();
    } finally {
      setActionLoading(false);
      setMenuAnchor(null);
    }
  };

  if (!status?.isLoggedIn) {
    return (
      <LoadingButton
        buttonProps={{ onClick: handleLogin, variant: "outlined" }}
        loading={actionLoading || statusLoading}
      >
        {props.text ?? t("login.login")}
      </LoadingButton>
    );
  }

  return (
    <>
      <Button
        onClick={(e) => setMenuAnchor(e.currentTarget)}
        startIcon={<AccountCircleIcon />}
        variant="outlined"
      >
        {status?.loggedInAs || t("login.login")}
      </Button>

      <Menu
        anchorEl={menuAnchor}
        onClose={() => setMenuAnchor(null)}
        open={Boolean(menuAnchor)}
      >
        <MenuItem disabled={actionLoading} onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>

          <ListItemText>{t("userMenu.logout")}</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
