import MoreVertIcon from "@mui/icons-material/MoreVert";
import { IconButton, Menu, MenuItem, Tooltip } from "@mui/material";
import { ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { Role } from "api/models";
import { addOrUpdateUserRole, removeUserRole } from "backend";
import { CancelConfirmDialog } from "components/Dialogs";
import { asyncRefreshCurrentProjectUsers } from "components/Project/ProjectActions";
import { useAppDispatch } from "types/hooks";

const idAffix = "user-options";
const idRemoveUser = `${idAffix}-remove`;
const idAddEditor = `${idAffix}-editor-add`;
const idRemoveEditor = `${idAffix}-editor-remove`;
const idAddAdmin = `${idAffix}-admin-add`;
const idRemoveAdmin = `${idAffix}-admin-remove`;
const idMakeOwner = `${idAffix}-owner-make`;

interface CancelConfirmDialogCollectionProps {
  currentUserId: string;
  isProjectOwner: boolean;
  userId: string;
  userRole: Role;
}

/**
 * Collection of dialogs to cancel or confirm an action used in
 * ActiveProjectUsers.tsx
 */
export default function CancelConfirmDialogCollection(
  props: CancelConfirmDialogCollectionProps
): ReactElement {
  const dispatch = useAppDispatch();
  const [removeUserDialogOpen, setRemoveUser] = useState(false);
  const [makeEditorDialogOpen, setMakeEditor] = useState(false);
  const [removeEditorDialogOpen, setRemoveEditor] = useState(false);
  const [makeAdminDialogOpen, setMakeAdmin] = useState(false);
  const [removeAdminDialogOpen, setRemoveAdmin] = useState(false);
  const [makeOwnerDialogOpen, setMakeOwner] = useState(false);
  const [anchorEl, setAnchorEl] = useState<Element | undefined>(undefined);
  const { t } = useTranslation();

  function removeUser(userId: string): void {
    removeUserRole(userId)
      .then(() => {
        setRemoveUser(false);
        setAnchorEl(undefined);
        toast.success(
          t("projectSettings.userManagement.userRemovedToastSuccess")
        );
        dispatch(asyncRefreshCurrentProjectUsers());
      })
      .catch((err) => {
        console.error(err);
        toast.error(
          t("projectSettings.userManagement.userRemovedToastFailure")
        );
      });
  }

  async function updateUserRole(userId: string, role: Role): Promise<void> {
    if (role === Role.Owner) {
      throw new Error("Cannot use this function to change project owner.");
    }

    addOrUpdateUserRole(role, userId)
      .then(() => {
        setAnchorEl(undefined);
        toast.success(
          t("projectSettings.userManagement.userUpdateToastSuccess")
        );
        dispatch(asyncRefreshCurrentProjectUsers());
      })
      .catch((err) => {
        console.error(err);
        toast.error(t("projectSettings.userManagement.userUpdateToastFailure"));
      });
  }

  function removeEditor(userId: string): void {
    updateUserRole(userId, Role.Harvester).then(() => setRemoveEditor(false));
  }

  function makeEditor(userId: string): void {
    updateUserRole(userId, Role.Editor).then(() => setMakeEditor(false));
  }

  function makeAdmin(userId: string): void {
    updateUserRole(userId, Role.Administrator).then(() => setMakeAdmin(false));
  }

  function removeAdmin(userId: string): void {
    updateUserRole(userId, Role.Editor).then(() => setRemoveAdmin(false));
  }

  function makeOwner(userId: string): void {
    addOrUpdateUserRole(Role.Owner, userId)
      .then(() => {
        addOrUpdateUserRole(Role.Administrator, props.currentUserId);
      })
      .then(() => {
        setMakeOwner(false);
        setAnchorEl(undefined);
        toast.success(
          t("projectSettings.userManagement.makeOwnerToastSuccess")
        );
        dispatch(asyncRefreshCurrentProjectUsers());
      })
      .catch((err) => {
        console.error(err);
        toast.error(t("projectSettings.userManagement.makeOwnerToastFailure"));
      });
  }

  const managementOptions: ReactElement[] = [
    <MenuItem
      key={idRemoveUser}
      id={idRemoveUser}
      onClick={() => setRemoveUser(true)}
    >
      {t("projectSettings.userManagement.removeFromProject")}
    </MenuItem>,
  ];

  switch (props.userRole) {
    case Role.Harvester:
      managementOptions.push(
        <MenuItem
          key={idAddEditor}
          id={idAddEditor}
          onClick={() => setMakeEditor(true)}
        >
          {t("projectSettings.userManagement.makeEditor")}
        </MenuItem>
      );
      break;

    case Role.Editor:
      managementOptions.push(
        <MenuItem
          key={idRemoveEditor}
          id={idRemoveEditor}
          onClick={() => setRemoveEditor(true)}
        >
          {t("projectSettings.userManagement.removeEditor")}
        </MenuItem>
      );
      if (props.isProjectOwner) {
        managementOptions.push(
          <MenuItem
            key={idAddAdmin}
            id={idAddAdmin}
            onClick={() => setMakeAdmin(true)}
          >
            {t("projectSettings.userManagement.makeAdmin")}
          </MenuItem>
        );
      }
      break;

    case Role.Administrator:
      if (props.isProjectOwner) {
        managementOptions.push(
          <MenuItem
            key={idRemoveAdmin}
            id={idRemoveAdmin}
            onClick={() => setRemoveAdmin(true)}
          >
            {t("projectSettings.userManagement.removeAdmin")}
          </MenuItem>,
          <MenuItem
            key={idMakeOwner}
            id={idMakeOwner}
            onClick={() => setMakeOwner(true)}
          >
            {t("projectSettings.userManagement.makeOwner")}
          </MenuItem>
        );
      }
      break;

    default:
      break;
  }

  return (
    <>
      <CancelConfirmDialog
        open={removeUserDialogOpen}
        textId="projectSettings.userManagement.removeUserWarning"
        handleCancel={() => setRemoveUser(false)}
        handleConfirm={() => removeUser(props.userId)}
        buttonIdCancel={`${idRemoveUser}-cancel`}
        buttonIdConfirm={`${idRemoveUser}-confirm`}
      />
      <CancelConfirmDialog
        open={makeEditorDialogOpen}
        textId="projectSettings.userManagement.makeEditorWarning"
        handleCancel={() => setMakeEditor(false)}
        handleConfirm={() => makeEditor(props.userId)}
        buttonIdCancel={`${idAddAdmin}-cancel`}
        buttonIdConfirm={`${idAddAdmin}-confirm`}
      />
      <CancelConfirmDialog
        open={removeEditorDialogOpen}
        textId="projectSettings.userManagement.removeEditorWarning"
        handleCancel={() => setRemoveEditor(false)}
        handleConfirm={() => removeEditor(props.userId)}
        buttonIdCancel={`${idRemoveEditor}-cancel`}
        buttonIdConfirm={`${idRemoveEditor}-confirm`}
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
        title={t("projectSettings.userManagement.manageUser")}
        placement={document.body.dir === "rtl" ? "left" : "right"}
      >
        <IconButton
          id={idAffix}
          onClick={(event) => setAnchorEl(event.currentTarget)}
          size="large"
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
    </>
  );
}
