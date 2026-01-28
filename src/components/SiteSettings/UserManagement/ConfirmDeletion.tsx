import { Box, Button, Stack, Typography } from "@mui/material";
import { Fragment, ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";

import { User } from "api/models";
import UserProjectsList from "components/SiteSettings/UserManagement/UserProjectsList";

interface ConfirmDeletionProps {
  user?: User;
  deleteUser: (userId: string) => void;
  handleCloseModal: () => void;
}

export default function ConfirmDeletion(
  props: ConfirmDeletionProps
): ReactElement {
  const [loaded, setLoaded] = useState(false);

  const { t } = useTranslation();

  if (!props.user) {
    return <Fragment />;
  }

  return (
    <Box sx={{ maxWidth: 500 }}>
      <Stack spacing={2}>
        <Typography align="center" sx={{ color: "error.main" }} variant="h4">
          {props.user.username}
        </Typography>

        <Typography align="center" variant="h6">
          {t("siteSettings.deleteUser.confirm")}
        </Typography>

        <UserProjectsList
          userId={props.user.id}
          onLoaded={() => setLoaded(true)}
        />

        <Stack direction="row" justifyContent="space-evenly">
          <Button
            color="secondary"
            disabled={!props.user?.id || !loaded}
            id="user-delete-confirm"
            onClick={() => props.deleteUser(props.user!.id)}
            variant="contained"
          >
            <Typography sx={{ color: "error.main" }}>
              {t("buttons.delete")}
            </Typography>
          </Button>

          <Button
            color="secondary"
            id="user-delete-cancel"
            onClick={() => props.handleCloseModal()}
            variant="contained"
          >
            <Typography>{t("buttons.cancel")}</Typography>
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
