import { Box, Button, Stack, Typography } from "@mui/material";
import { Fragment, ReactElement } from "react";
import { useTranslation } from "react-i18next";

import { User } from "api/models";

interface ConfirmDeletionProps {
  user?: User;
  deleteUser: (userId: string) => void;
  handleCloseModal: () => void;
}

export default function ConfirmDeletion(
  props: ConfirmDeletionProps
): ReactElement {
  const { t } = useTranslation();

  if (!props.user) {
    return <Fragment />;
  }
  return (
    <Box sx={{ maxWidth: 500 }}>
      <Stack spacing={2}>
        <Typography align="center" sx={{ color: "red" }} variant="h4">
          {props.user.username}
        </Typography>

        <Typography align="center" variant="h6">
          {t("siteSettings.deleteUser.confirm")}
        </Typography>

        <Stack direction="row" justifyContent="space-evenly">
          <Button
            color="secondary"
            id="user-delete-confirm"
            onClick={() => {
              if (props.user) {
                props.deleteUser(props.user.id);
              }
            }}
            variant="contained"
          >
            <Typography align="center" sx={{ color: "red" }} variant="h6">
              {t("buttons.delete")}
            </Typography>
          </Button>

          <Button
            color="secondary"
            id="user-delete-cancel"
            onClick={() => props.handleCloseModal()}
            variant="contained"
          >
            <Typography align="center" variant="h6">
              {t("buttons.cancel")}
            </Typography>
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
