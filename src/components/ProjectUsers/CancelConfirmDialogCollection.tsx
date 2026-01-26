import { Check, MoreVert } from "@mui/icons-material";
import { Icon, IconButton, Menu, MenuItem, Tooltip } from "@mui/material";
import { ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { Role } from "api/models";
import {
  addOrUpdateUserRole,
  changeProjectOwner,
  removeUserRole,
} from "backend";
import CancelConfirmDialog from "components/Dialogs/CancelConfirmDialog";
import { asyncRefreshProjectUsers } from "components/Project/ProjectActions";
import { useAppDispatch } from "rootRedux/hooks";

const idAffix = "user-options";
const idRemoveUser = `${idAffix}-remove`;
const idHarvester = `${idAffix}-harvester`;
const idEditor = `${idAffix}-editor`;
const idAdmin = `${idAffix}-admin`;
const idOwner = `${idAffix}-owner`;

interface CancelConfirmDialogCollectionProps {
  currentUserId: string;
  isProjectOwner: boolean;
  projectId: string;
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
  const [makeHarvesterDialogOpen, setMakeHarvester] = useState(false);
  const [makeEditorDialogOpen, setMakeEditor] = useState(false);
  const [makeAdminDialogOpen, setMakeAdmin] = useState(false);
  const [makeOwnerDialogOpen, setMakeOwner] = useState(false);
  const [anchorEl, setAnchorEl] = useState<Element | undefined>(undefined);
  const { t } = useTranslation();

  async function refreshUsers(): Promise<void> {
    await dispatch(asyncRefreshProjectUsers(props.projectId));
  }

  function removeUser(userId: string): void {
    removeUserRole(props.projectId, userId)
      .then(() => {
        setRemoveUser(false);
        setAnchorEl(undefined);
        toast.success(
          t("projectSettings.userManagement.userRemovedToastSuccess")
        );
        refreshUsers();
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

    addOrUpdateUserRole(props.projectId, role, userId)
      .then(() => {
        setAnchorEl(undefined);
        toast.success(
          t("projectSettings.userManagement.userRoleUpdateToastSuccess")
        );
        refreshUsers();
      })
      .catch((err) => {
        console.error(err);
        toast.error(
          t("projectSettings.userManagement.userRoleUpdateToastFailure")
        );
      });
  }

  function makeHarvester(userId: string): void {
    updateUserRole(userId, Role.Harvester).then(() => setMakeHarvester(false));
  }

  function makeEditor(userId: string): void {
    updateUserRole(userId, Role.Editor).then(() => setMakeEditor(false));
  }

  function makeAdmin(userId: string): void {
    updateUserRole(userId, Role.Administrator).then(() => setMakeAdmin(false));
  }

  function makeOwner(userId: string): void {
    changeProjectOwner(props.projectId, props.currentUserId, userId)
      .then(() => {
        setMakeOwner(false);
        setAnchorEl(undefined);
        toast.success(
          t("projectSettings.userManagement.makeOwnerToastSuccess")
        );
        refreshUsers();
      })
      .catch((err) => {
        console.error(err);
        toast.error(t("projectSettings.userManagement.makeOwnerToastFailure"));
      });
  }

  const managementOptions: ReactElement[] = [
    <MenuItem
      divider
      id={idRemoveUser}
      key={idRemoveUser}
      onClick={() => setRemoveUser(true)}
    >
      {t("projectSettings.userManagement.removeFromProject")}
    </MenuItem>,
    <MenuItem key="project-role" disabled>
      {t("projectSettings.userManagement.changeProjectRole")}
    </MenuItem>,
    <MenuItem
      disabled={props.userRole === Role.Harvester}
      id={idHarvester}
      key={idHarvester}
      onClick={() => setMakeHarvester(true)}
    >
      {props.userRole === Role.Harvester ? <Check /> : <Icon />}
      {t("projectSettings.roles.harvester")}
    </MenuItem>,
    <MenuItem
      disabled={props.userRole === Role.Editor}
      id={idEditor}
      key={idEditor}
      onClick={() => setMakeEditor(true)}
    >
      {props.userRole === Role.Editor ? <Check /> : <Icon />}
      {t("projectSettings.roles.editor")}
    </MenuItem>,
    <MenuItem
      disabled={props.userRole === Role.Administrator}
      divider={props.isProjectOwner && props.userRole === Role.Administrator}
      id={idAdmin}
      key={idAdmin}
      onClick={() => setMakeAdmin(true)}
    >
      {props.userRole === Role.Administrator ? <Check /> : <Icon />}
      {t("projectSettings.roles.administrator")}
    </MenuItem>,
  ];

  if (props.isProjectOwner && props.userRole === Role.Administrator) {
    managementOptions.push(
      <MenuItem key={idOwner} id={idOwner} onClick={() => setMakeOwner(true)}>
        {t("projectSettings.userManagement.makeOwner")}
      </MenuItem>
    );
  }

  return (
    <>
      <CancelConfirmDialog
        open={removeUserDialogOpen}
        text="projectSettings.userManagement.removeUserWarning"
        handleCancel={() => setRemoveUser(false)}
        handleConfirm={() => removeUser(props.userId)}
        buttonIdCancel={`${idRemoveUser}-cancel`}
        buttonIdConfirm={`${idRemoveUser}-confirm`}
        enableEnterKeyDown
      />
      <CancelConfirmDialog
        open={makeHarvesterDialogOpen}
        text="projectSettings.userManagement.makeHarvesterWarning"
        handleCancel={() => setMakeHarvester(false)}
        handleConfirm={() => makeHarvester(props.userId)}
        buttonIdCancel={`${idHarvester}-cancel`}
        buttonIdConfirm={`${idHarvester}-confirm`}
        enableEnterKeyDown
      />
      <CancelConfirmDialog
        open={makeEditorDialogOpen}
        text="projectSettings.userManagement.makeEditorWarning"
        handleCancel={() => setMakeEditor(false)}
        handleConfirm={() => makeEditor(props.userId)}
        buttonIdCancel={`${idEditor}-cancel`}
        buttonIdConfirm={`${idEditor}-confirm`}
        enableEnterKeyDown
      />
      <CancelConfirmDialog
        open={makeAdminDialogOpen}
        text="projectSettings.userManagement.makeAdminWarning"
        handleCancel={() => setMakeAdmin(false)}
        handleConfirm={() => makeAdmin(props.userId)}
        buttonIdCancel={`${idAdmin}-cancel`}
        buttonIdConfirm={`${idAdmin}-confirm`}
        enableEnterKeyDown
      />
      <CancelConfirmDialog
        open={makeOwnerDialogOpen}
        text="projectSettings.userManagement.makeOwnerWarning"
        handleCancel={() => setMakeOwner(false)}
        handleConfirm={() => makeOwner(props.userId)}
        buttonIdCancel={`${idOwner}-cancel`}
        buttonIdConfirm={`${idOwner}-confirm`}
        enableEnterKeyDown
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
          <MoreVert />
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
