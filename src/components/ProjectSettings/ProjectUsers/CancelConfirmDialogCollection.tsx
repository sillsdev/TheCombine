import MoreVertIcon from "@mui/icons-material/MoreVert";
import { IconButton, Menu, MenuItem, Tooltip } from "@mui/material";
import { ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { Permission, Role } from "api/models";
import { addOrUpdateUserRole, removeUserRole } from "backend";
import { CancelConfirmDialog } from "components/Dialogs";
import { asyncRefreshCurrentProjectUsers } from "components/Project/ProjectActions";
import { useAppDispatch } from "types/hooks";

const idAffix = "user-options";
const idRemoveUser = `${idAffix}-remove`;
const idAddAdmin = `${idAffix}-admin-add`;
const idRemoveAdmin = `${idAffix}-admin-remove`;
const idMakeOwner = `${idAffix}-owner-make`;

interface CancelConfirmDialogCollectionProps {
  userId: string;
  currentUserId: string;
  isProjectOwner: boolean;
  userIsProjAdmin: boolean;
}

/**
 * Collection of dialogs to cancel or confirm an action used in
 * ActiveProjectUsers.tsx
 */
export default function CancelConfirmDialogCollection(
  props: CancelConfirmDialogCollectionProps
): ReactElement {
  const dispatch = useAppDispatch();
  const [removeUserDialogOpen, setRemoveUser] = useState<boolean>(false);
  const [makeAdminDialogOpen, setMakeAdmin] = useState<boolean>(false);
  const [removeAdminDialogOpen, setRemoveAdmin] = useState<boolean>(false);
  const [makeOwnerDialogOpen, setMakeOwner] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<Element | undefined>(undefined);
  const { t } = useTranslation();

  function removeUser(userId: string): void {
    removeUserRole([Permission.DeleteEditSettingsAndUsers], userId)
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

  function makeAdmin(userId: string): void {
    addOrUpdateUserRole(Role.Administrator, userId)
      .then(() => {
        setMakeAdmin(false);
        setAnchorEl(undefined);
        toast.success(
          t("projectSettings.userManagement.makeAdminToastSuccess")
        );
        dispatch(asyncRefreshCurrentProjectUsers());
      })
      .catch((err) => {
        console.error(err);
        toast.error(t("projectSettings.userManagement.makeAdminToastFailure"));
      });
  }

  function removeAdmin(userId: string): void {
    addOrUpdateUserRole(Role.Harvester, userId)
      .then(() => {
        setRemoveAdmin(false);
        setAnchorEl(undefined);
        toast.success(
          t("projectSettings.userManagement.removeAdminToastSuccess")
        );
        dispatch(asyncRefreshCurrentProjectUsers());
      })
      .catch((err) => {
        console.error(err);
        toast.error(
          t("projectSettings.userManagement.removeAdminToastFailure")
        );
      });
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
      {t("buttons.removeFromProject")}
    </MenuItem>,
  ];
  if (props.isProjectOwner) {
    const adminOption = props.userIsProjAdmin ? (
      <MenuItem
        key={idRemoveAdmin}
        id={idRemoveAdmin}
        onClick={() => setRemoveAdmin(true)}
      >
        {t("buttons.removeAdmin")}
      </MenuItem>
    ) : (
      <MenuItem
        key={idAddAdmin}
        id={idAddAdmin}
        onClick={() => setMakeAdmin(true)}
      >
        {t("buttons.makeAdmin")}
      </MenuItem>
    );
    managementOptions.push(adminOption);

    if (props.userIsProjAdmin) {
      managementOptions.push(
        <MenuItem
          key={idMakeOwner}
          id={idMakeOwner}
          onClick={() => setMakeOwner(true)}
        >
          {t("buttons.makeOwner")}
        </MenuItem>
      );
    }
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
