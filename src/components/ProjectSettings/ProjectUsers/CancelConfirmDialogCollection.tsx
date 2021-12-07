import { IconButton, Menu, MenuItem, Tooltip } from "@material-ui/core";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import React, { useState } from "react";
import { Translate } from "react-localize-redux";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

import { Permission } from "api/models";
import { addOrUpdateUserRole, removeUserRole } from "backend";
import CancelConfirmDialog from "components/Buttons/CancelConfirmDialog";
import { asyncRefreshCurrentProjectUsers } from "components/Project/ProjectActions";

const idAffix = "user-options";
const idRemoveUser = `${idAffix}-remove`;
const idAddAdmin = `${idAffix}-admin-add`;
const idRemoveAdmin = `${idAffix}-admin-remove`;
const idMakeOwner = `${idAffix}-owner-make`;

interface CancelConfirmDialogCollectionProps {
  userId: string;
  currentUserId: string;
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
  const [makeOwnerDialogOpen, setMakeOwner] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<Element | undefined>(undefined);

  function removeUser(userId: string) {
    removeUserRole([Permission.DeleteEditSettingsAndUsers], userId)
      .then(() => {
        setRemoveUser(false);
        setAnchorEl(undefined);
        toast.success(
          <Translate id="projectSettings.userManagement.userRemovedToastSuccess" />
        );
        dispatch(asyncRefreshCurrentProjectUsers());
      })
      .catch((err) => {
        console.error(err);
        toast.error(
          <Translate id="projectSettings.userManagement.userRemovedToastFailure" />
        );
      });
  }

  function makeAdmin(userId: string) {
    addOrUpdateUserRole(
      [
        Permission.WordEntry,
        Permission.Unused,
        Permission.MergeAndReviewEntries,
        Permission.ImportExport,
        Permission.DeleteEditSettingsAndUsers,
      ],
      userId
    )
      .then(() => {
        setMakeAdmin(false);
        setAnchorEl(undefined);
        toast.success(
          <Translate id="projectSettings.userManagement.makeAdminToastSuccess" />
        );
        dispatch(asyncRefreshCurrentProjectUsers());
      })
      .catch((err) => {
        console.error(err);
        toast.error(
          <Translate id="projectSettings.userManagement.makeAdminToastFailure" />
        );
      });
  }

  function removeAdmin(userId: string) {
    addOrUpdateUserRole(
      [
        Permission.MergeAndReviewEntries,
        Permission.Unused,
        Permission.WordEntry,
      ],
      userId
    )
      .then(() => {
        setRemoveAdmin(false);
        setAnchorEl(undefined);
        toast.success(
          <Translate id="projectSettings.userManagement.removeAdminToastSuccess" />
        );
        dispatch(asyncRefreshCurrentProjectUsers());
      })
      .catch((err) => {
        console.error(err);
        toast.error(
          <Translate id="projectSettings.userManagement.removeAdminToastFailure" />
        );
      });
  }

  function makeOwner(userId: string) {
    addOrUpdateUserRole(
      [
        Permission.WordEntry,
        Permission.Unused,
        Permission.MergeAndReviewEntries,
        Permission.ImportExport,
        Permission.DeleteEditSettingsAndUsers,
        Permission.Owner,
      ],
      userId
    )
      .then(() => {
        addOrUpdateUserRole(
          [
            Permission.WordEntry,
            Permission.Unused,
            Permission.MergeAndReviewEntries,
            Permission.ImportExport,
            Permission.DeleteEditSettingsAndUsers,
          ],
          props.currentUserId
        );
      })
      .then(() => {
        setMakeOwner(false);
        setAnchorEl(undefined);
        toast.success(
          <Translate id="projectSettings.userManagement.makeOwnerToastSuccess" />
        );
        dispatch(asyncRefreshCurrentProjectUsers());
      })
      .catch((err) => {
        console.error(err);
        toast.error(
          <Translate id="projectSettings.userManagement.makeOwnerToastFailure" />
        );
      });
  }

  const managementOptions = [
    <MenuItem
      key={idRemoveUser}
      id={idRemoveUser}
      onClick={() => setRemoveUser(true)}
    >
      <Translate id="buttons.removeFromProject" />
    </MenuItem>,
  ];
  if (props.isProjectOwner) {
    const adminOption = props.userIsProjectAdmin ? (
      <MenuItem
        key={idRemoveAdmin}
        id={idRemoveAdmin}
        onClick={() => setRemoveAdmin(true)}
      >
        <Translate id="buttons.removeAdmin" />
      </MenuItem>
    ) : (
      <MenuItem
        key={idAddAdmin}
        id={idAddAdmin}
        onClick={() => setMakeAdmin(true)}
      >
        <Translate id="buttons.makeAdmin" />
      </MenuItem>
    );
    managementOptions.push(adminOption);

    if (props.userIsProjectAdmin) {
      managementOptions.push(
        <MenuItem
          key={idMakeOwner}
          id={idMakeOwner}
          onClick={() => setMakeOwner(true)}
        >
          <Translate id="buttons.makeOwner" />
        </MenuItem>
      );
    }
  }

  return (
    <React.Fragment>
      <CancelConfirmDialog
        open={removeUserDialogOpen}
        textId="projectSettings.userManagement.removeUserWarning"
        handleCancel={() => setRemoveUser(false)}
        handleConfirm={() => removeUser(props.userId)}
        buttonIdCancel={`${idRemoveUser}-cancel`}
        buttonIdConfirm={`${idRemoveUser}-confirm`}
      />
      <CancelConfirmDialog
        open={makeAdminDialogOpen}
        textId="projectSettings.userManagement.makeAdminWarning"
        handleCancel={() => setMakeAdmin(false)}
        handleConfirm={() => makeAdmin(props.userId)}
        buttonIdCancel={`${idAddAdmin}-cancel`}
        buttonIdConfirm={`${idAddAdmin}-confirm`}
      />
      <CancelConfirmDialog
        open={removeAdminDialogOpen}
        textId="projectSettings.userManagement.removeAdminWarning"
        handleCancel={() => setRemoveAdmin(false)}
        handleConfirm={() => removeAdmin(props.userId)}
        buttonIdCancel={`${idRemoveAdmin}-cancel`}
        buttonIdConfirm={`${idRemoveAdmin}-confirm`}
      />
      <CancelConfirmDialog
        open={makeOwnerDialogOpen}
        textId="projectSettings.userManagement.makeOwnerWarning"
        handleCancel={() => setMakeOwner(false)}
        handleConfirm={() => makeOwner(props.userId)}
        buttonIdCancel={`${idMakeOwner}-cancel`}
        buttonIdConfirm={`${idMakeOwner}-confirm`}
      />
      <Tooltip
        title={<Translate id="projectSettings.userManagement.manageUser" />}
        placement="right"
      >
        <IconButton
          id={idAffix}
          onClick={(event) => setAnchorEl(event.currentTarget)}
        >
          <MoreVertIcon />
        </IconButton>
      </Tooltip>
      <Menu
        id={`${idAffix}-menu`}
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
