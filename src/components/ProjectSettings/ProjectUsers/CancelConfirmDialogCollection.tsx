import { IconButton, Menu, MenuItem, Tooltip } from "@material-ui/core";
import CancelConfirmDialog from "components/Buttons/CancelConfirmDialog";
import React, { useState } from "react";
import { Translate } from "react-localize-redux";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import { Permission } from "api/models";
import { addOrUpdateUserRole, removeUserRole } from "backend";
import { toast } from "react-toastify";
//styles the ToastContainer so that it appears on the upper right corner with the message.
import "react-toastify/dist/ReactToastify.min.css";

interface CancelConfirmDialogCollectionProps {
  userId: string;
  isProjectAdmin: boolean;
}

/**
 * Collection of dialogs to cancel or confirm an action used in
 * ActiveUsers.tsx
 */
export default function CancelConfirmDialogCollection(
  props: CancelConfirmDialogCollectionProps
) {
  const [removeUserDialogOpen, setRemoveUser] = useState<boolean>(false);
  const [makeAdminDialogOpen, setMakeAdmin] = useState<boolean>(false);
  const [removeAdminDialogOpen, setRemoveAdmin] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<Element | undefined>(undefined);

  function removeUser(userId: string) {
    removeUserRole([Permission.DeleteEditSettingsAndUsers], userId)
      .then(() => setRemoveUser(false))
      .then(() => setAnchorEl(undefined))
      .then(() => {
        toast(
          <Translate id="projectSettings.userManagement.userRemovedToastSuccess" />
        );
      })
      .catch((err: string) => {
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
      .then(() => setMakeAdmin(false))
      .then(() => setAnchorEl(undefined))
      .then(() => {
        toast(
          <Translate id="projectSettings.userManagement.makeAdminToastSuccess" />
        );
      })
      .catch((err: string) => {
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
      .then(() => setRemoveAdmin(false))
      .then(() => setAnchorEl(undefined))
      .then(() => {
        toast(
          <Translate id="projectSettings.userManagement.removeAdminToastSuccess" />
        );
      })
      .catch((err: string) => {
        console.error(err);
        toast(
          <Translate id="projectSettings.userManagement.removeAdminToastFailure" />
        );
      });
  }

  const adminOption = props.isProjectAdmin ? (
    <MenuItem onClick={() => setRemoveAdmin(true)}>
      <Translate id="buttons.removeAdmin" />
    </MenuItem>
  ) : (
    <MenuItem onClick={() => setMakeAdmin(true)}>
      <Translate id="buttons.makeAdmin" />
    </MenuItem>
  );

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
          onClick={(event) => {
            setAnchorEl(event.currentTarget);
          }}
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
        <MenuItem onClick={() => setRemoveUser(true)}>
          <Translate id="buttons.removeFromProject" />
        </MenuItem>
        {adminOption}
      </Menu>
    </React.Fragment>
  );
}
