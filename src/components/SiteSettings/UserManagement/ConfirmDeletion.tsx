import {
  Button,
  Typography,
  CardContent,
  Card,
  CardActions,
  Stack,
} from "@mui/material";
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
    <>
      <Card style={{ maxWidth: 500 }}>
        <CardContent>
          <Typography align="center" variant="h5" style={{ color: "primary" }}>
            {props.user.username}
          </Typography>
          <Typography align="center" variant="h6">
            {t("siteSettings.deleteUser.confirm")}
          </Typography>
        </CardContent>
        <CardActions>
          <Stack direction="row" justifyContent="space-evenly" width="100%">
            <Button
              variant="contained"
              onClick={() => {
                if (props.user) {
                  props.deleteUser(props.user.id);
                }
              }}
              color="secondary"
              id="user-delete-confirm"
            >
              <Typography align="center" variant="h6" style={{ color: "red" }}>
                {t("buttons.delete")}
              </Typography>
            </Button>
            <Button
              variant="contained"
              onClick={() => props.handleCloseModal()}
              color="secondary"
              id="user-delete-cancel"
            >
              <Typography
                align="center"
                variant="h6"
                style={{ color: "inherit" }}
              >
                {t("buttons.cancel")}
              </Typography>
            </Button>
          </Stack>
        </CardActions>
      </Card>
    </>
  );
}
