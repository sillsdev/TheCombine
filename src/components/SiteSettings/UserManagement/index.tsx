import { Grid } from "@mui/material";
import { ReactElement, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "react-modal";
import { toast } from "react-toastify";

import { User } from "api/models";
import { deleteUser, getAllUsers } from "backend";
import ConfirmDeletion from "components/SiteSettings/UserManagement/ConfirmDeletion";
import UserList from "components/SiteSettings/UserManagement/UserList";

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
  const [showModal, setShowModal] = useState(false);

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

  const handleOpenModal = (user: User): void => {
    setShowModal(true);
    setOpenUser(user);
  };
  const handleCloseModal = (): void => setShowModal(false);

  const delUser = (userId: string): void => {
    deleteUser(userId)
      .then(() => {
        toast.success(t("siteSettings.deleteUser.toastSuccess"));
        setOpenUser(undefined);
      })
      .catch((err) => {
        console.error(err);
        toast.error(t("siteSettings.deleteUser.toastFailure"));
      });
    handleCloseModal();
  };

  return (
    <>
      <Grid container spacing={1}>
        <UserList allUsers={allUsers} handleOpenModal={handleOpenModal} />
      </Grid>

      <Modal
        isOpen={showModal}
        style={customStyles}
        shouldCloseOnOverlayClick
        onRequestClose={handleCloseModal}
      >
        <ConfirmDeletion
          user={openUser}
          deleteUser={delUser}
          handleCloseModal={handleCloseModal}
        />
      </Modal>
    </>
  );
}
