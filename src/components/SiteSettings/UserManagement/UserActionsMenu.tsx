import { DeleteForever, Folder, MoreVert, VpnKey } from "@mui/icons-material";
import { IconButton, Menu, MenuItem } from "@mui/material";
import { ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";

import { User } from "api/models";

const idAffix = "user-actions";
const idDelete = `${idAffix}-delete`;
const idProjects = `${idAffix}-projects`;

interface UserActionsMenuProps {
  user: User;
  disabled: boolean;
  onDeleteClick: () => void;
  onProjectsClick: () => void;
}

export default function UserActionsMenu(
  props: UserActionsMenuProps
): ReactElement {
  const [anchorEl, setAnchorEl] = useState<Element | undefined>(undefined);
  const { t } = useTranslation();

  return (
    <>
      <IconButton
        disabled={props.disabled}
        id={`${idAffix}-${props.user.username}`}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        style={{ minWidth: 0 }}
      >
        {props.disabled ? <VpnKey /> : <MoreVert />}
      </IconButton>
      <Menu
        id={`${idAffix}-menu-${props.user.username}`}
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(undefined)}
      >
        <MenuItem
          id={idProjects}
          onClick={() => {
            setAnchorEl(undefined);
            props.onProjectsClick();
          }}
        >
          <Folder style={{ marginInlineEnd: 6 }} />
          {t("siteSettings.userActions.projects")}
        </MenuItem>
        <MenuItem
          id={idDelete}
          onClick={() => {
            setAnchorEl(undefined);
            props.onDeleteClick();
          }}
        >
          <DeleteForever style={{ marginInlineEnd: 6 }} />
          {t("buttons.delete")}
        </MenuItem>
      </Menu>
    </>
  );
}
