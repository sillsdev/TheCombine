import { Grid } from "@mui/material";
import React, { ReactElement, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "react-modal";
import { toast } from "react-toastify";

import { User } from "api/models";
import { deleteUser, getAllUsers } from "backend";
import ConfirmDeletion from "components/SiteSettings/UserManagement/ConfirmDeletion";
import UserList from "components/SiteSettings/UserManagement/UserList";
import { UpperRightToastContainer } from "components/Toast/UpperRightToastContainer";

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
  }, [setAllUsers, t]);

  useEffect(() => {
    Modal.setAppElement("body");
  }, [populateUsers]);

  useEffect(() => {
    if (!openUser) {
      populateUsers();
    }
  }, [openUser, populateUsers]);

  const handleOpenModal = (user: User) => {
    setShowModal(true);
    setOpenUser(user);
  };
  const handleCloseModal = () => setShowModal(false);

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
    <React.Fragment>
      <Grid container spacing={1}>
        <UserList allUsers={allUsers} handleOpenModal={handleOpenModal} />
        <UpperRightToastContainer />
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
    </React.Fragment>
  );
}
