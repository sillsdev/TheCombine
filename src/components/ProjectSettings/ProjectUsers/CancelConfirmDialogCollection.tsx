import {
  IconButton,
  Menu,
  MenuItem,
  MenuItemProps,
  Tooltip,
} from "@material-ui/core";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import React, { useState } from "react";
import { Translate } from "react-localize-redux";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
//styles the ToastContainer so that it appears on the upper right corner with the message.
import "react-toastify/dist/ReactToastify.min.css";

import { Permission } from "api/models";
import { addOrUpdateUserRole, removeUserRole } from "backend";
import CancelConfirmDialog from "components/Buttons/CancelConfirmDialog";
import { asyncRefreshCurrentProjectUsers } from "components/Project/ProjectActions";

interface CancelConfirmDialogCollectionProps {
  userId: string;
  isProjectOwner: boolean;
  userIsProjectAdmin: boolean;
}

/**
 * Collection of dialogs to cancel or confirm an action used in
 * ActiveUsers.tsx
 */
export default function CancelConfirmDialogCollection(
  props: CancelConfirmDialogCollectionProps
) {
  const dispatch = useDispatch();
  const [removeUserDialogOpen, setRemoveUser] = useState<boolean>(false);
  const [makeAdminDialogOpen, setMakeAdmin] = useState<boolean>(false);
  const [removeAdminDialogOpen, setRemoveAdmin] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<Element | undefined>(undefined);

  function removeUser(userId: string) {
    removeUserRole([Permission.DeleteEditSettingsAndUsers], userId)
      .then(() => {
        setRemoveUser(false);
        setAnchorEl(undefined);
        toast(
          <Translate id="projectSettings.userManagement.userRemovedToastSuccess" />
        );
        dispatch(asyncRefreshCurrentProjectUsers());
      })
      .catch((err) => {
        console.error(err);
        toast(
          <Translate id="projectSettings.userManagement.userRemovedToastFailure" />
        );
      });
  }

  function makeAdmin(userId: string) {
    addOrUpdateUserRole(
      [
        Permission.WordEntry,
        Permission.Unused,
        Permission.MergeAndCharSet,
        Permission.ImportExport,
        Permission.DeleteEditSettingsAndUsers,
      ],
      userId
    )
      .then(() => {
        setMakeAdmin(false);
        setAnchorEl(undefined);
        toast(
          <Translate id="projectSettings.userManagement.makeAdminToastSuccess" />
        );
        dispatch(asyncRefreshCurrentProjectUsers());
      })
      .catch((err) => {
        console.error(err);
        toast(
          <Translate id="projectSettings.userManagement.makeAdminToastFailure" />
        );
      });
  }

  function removeAdmin(userId: string) {
    addOrUpdateUserRole(
      [Permission.MergeAndCharSet, Permission.Unused, Permission.WordEntry],
      userId
    )
      .then(() => {
        setRemoveAdmin(false);
        setAnchorEl(undefined);
        toast(
          <Translate id="projectSettings.userManagement.removeAdminToastSuccess" />
        );
        dispatch(asyncRefreshCurrentProjectUsers());
      })
      .catch((err) => {
        console.error(err);
        toast(
          <Translate id="projectSettings.userManagement.removeAdminToastFailure" />
        );
      });
  }

  const managementOptions: React.ReactElement<MenuItemProps>[] = [
    <MenuItem key="removeUser" onClick={() => setRemoveUser(true)}>
      <Translate id="buttons.removeFromProject" />
    </MenuItem>,
  ];
  if (props.isProjectOwner) {
    const adminOption = props.userIsProjectAdmin ? (
      <MenuItem key="removeAdmin" onClick={() => setRemoveAdmin(true)}>
        <Translate id="buttons.removeAdmin" />
      </MenuItem>
    ) : (
      <MenuItem key="addAdmin" onClick={() => setMakeAdmin(true)}>
        <Translate id="buttons.makeAdmin" />
      </MenuItem>
    );
    managementOptions.push(adminOption);
  }

  return (
    <React.Fragment>
      <CancelConfirmDialog
        open={removeUserDialogOpen}
        textId="projectSettings.userManagement.removeUserWarning"
        handleCancel={() => setRemoveUser(false)}
        handleAccept={() => removeUser(props.userId)}
      />
      <CancelConfirmDialog
        open={makeAdminDialogOpen}
        textId="projectSettings.userManagement.makeAdminWarning"
        handleCancel={() => setMakeAdmin(false)}
        handleAccept={() => makeAdmin(props.userId)}
      />
      <CancelConfirmDialog
        open={removeAdminDialogOpen}
        textId="projectSettings.userManagement.removeAdminWarning"
        handleCancel={() => setRemoveAdmin(false)}
        handleAccept={() => removeAdmin(props.userId)}
      />
      <Tooltip
        title={<Translate id="projectSettings.userManagement.manageUser" />}
        placement="right"
      >
        <IconButton
          id="user-options"
          onClick={(event) => setAnchorEl(event.currentTarget)}
        >
          <MoreVertIcon />
        </IconButton>
      </Tooltip>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(undefined)}
      >
        {managementOptions}
      </Menu>
    </React.Fragment>
  );
}
