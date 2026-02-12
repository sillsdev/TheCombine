import { DeleteForever, Folder, MoreVert } from "@mui/icons-material";
import {
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";
import { ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";

import { User } from "api/models";

const idAffix = "user-actions";
const idDelete = `${idAffix}-delete`;
const idProjects = `${idAffix}-projects`;

export interface UserActionsMenuProps {
  disableDelete?: boolean;
  onDeleteClick: () => void;
  onProjectsClick: () => void;
  user: User;
}

export default function UserActionsMenu(
  props: UserActionsMenuProps
): ReactElement {
  const [anchorEl, setAnchorEl] = useState<Element | undefined>(undefined);
  const { t } = useTranslation();

  return (
    <>
      <IconButton
        id={`${idAffix}-${props.user.username}`}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        sx={{ minWidth: 0 }}
      >
        <MoreVert />
      </IconButton>

      <Menu
        id={`${idAffix}-menu-${props.user.username}`}
        anchorEl={anchorEl}
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
          <ListItemIcon>
            <Folder />
          </ListItemIcon>

          <ListItemText>{t("siteSettings.projectList")}</ListItemText>
        </MenuItem>

        <MenuItem
          disabled={props.disableDelete}
          id={idDelete}
          onClick={() => {
            setAnchorEl(undefined);
            props.onDeleteClick();
          }}
        >
          <ListItemIcon>
            <DeleteForever />
          </ListItemIcon>

          <ListItemText>{t("buttons.delete")}</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
