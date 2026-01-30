import { ReactElement, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "react-modal";
import { toast } from "react-toastify";

import { User } from "api/models";
import { deleteUser, getAllUsers } from "backend";
import ConfirmDeletion from "components/SiteSettings/UserManagement/ConfirmDeletion";
import UserList from "components/SiteSettings/UserManagement/UserList";
import UserProjects from "components/SiteSettings/UserManagement/UserProjects";

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
};

export default function UserManagement(): ReactElement {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [openUser, setOpenUser] = useState<User | undefined>();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showProjectsModal, setShowProjectsModal] = useState(false);

  const { t } = useTranslation();

  const populateUsers = useCallback(async (): Promise<void> => {
    await getAllUsers()
      .then(setAllUsers)
      .catch((err) => {
        console.error(err);
        toast.error(t("siteSettings.populateUsers.toastFailure"));
      });
  }, [t]);

  useEffect(() => {
    Modal.setAppElement("body");
  }, [populateUsers]);

  useEffect(() => {
    if (!openUser) {
      populateUsers();
    }
  }, [openUser, populateUsers]);

  const handleOpenDeleteModal = (user: User): void => {
    setShowDeleteModal(true);
    setOpenUser(user);
  };
  const handleCloseDeleteModal = (): void => setShowDeleteModal(false);

  const handleOpenProjectsModal = (user: User): void => {
    setShowProjectsModal(true);
    setOpenUser(user);
  };
  const handleCloseProjectsModal = (): void => setShowProjectsModal(false);

  const delUser = (userId: string): void => {
    deleteUser(userId)
      .then(() => {
        toast.success(t("siteSettings.deleteUser.toastSuccess"));
        setOpenUser(undefined);
        handleCloseDeleteModal();
      })
      .catch((err) => {
        console.error(err);
        toast.error(t("siteSettings.deleteUser.toastFailure"));
      });
  };

  return (
    <>
      <UserList
        allUsers={allUsers}
        handleOpenDeleteModal={handleOpenDeleteModal}
        handleOpenProjectsModal={handleOpenProjectsModal}
      />

      <Modal
        isOpen={showDeleteModal}
        style={customStyles}
        shouldCloseOnOverlayClick
        onRequestClose={handleCloseDeleteModal}
      >
        <ConfirmDeletion
          user={openUser}
          deleteUser={delUser}
          handleCloseModal={handleCloseDeleteModal}
        />
      </Modal>

      <Modal
        isOpen={showProjectsModal}
        style={customStyles}
        shouldCloseOnOverlayClick
        onRequestClose={handleCloseProjectsModal}
      >
        <UserProjects user={openUser} />
      </Modal>
    </>
  );
}
