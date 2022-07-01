import {
  Button,
  Grid,
  Typography,
  CardContent,
  Card,
  CardActions,
} from "@material-ui/core";
import React from "react";
import { useTranslation } from "react-i18next";

import { User } from "api/models";

interface ConfirmDeletionProps {
  user?: User;
  deleteUser: (userId: string) => void;
  handleCloseModal: () => void;
}

export default function ConfirmDeletion(props: ConfirmDeletionProps) {
  const { t } = useTranslation();

  if (props.user) {
    return (
      <React.Fragment>
        <Grid container justifyContent="center">
          <Card style={{ width: 500 }}>
            <CardContent>
              <Typography
                align="center"
                variant="h5"
                style={{ color: "primary" }}
              >
                {props.user.username}
              </Typography>
              <Typography align="center" variant="h6">
                {t("siteSettings.deleteUser.confirm")}
              </Typography>
            </CardContent>
            <CardActions>
              <Grid container justifyContent="space-evenly">
                <Grid item xs={6} sm={3}>
                  <Button
                    variant="contained"
                    onClick={() => {
                      if (props.user) props.deleteUser(props.user.id);
                    }}
                    color="secondary"
                    id="user-delete-confirm"
                  >
                    <Typography
                      align="center"
                      variant="h6"
                      style={{ color: "red" }}
                    >
                      {t("buttons.delete")}
                    </Typography>
                  </Button>
                </Grid>
                <Grid item xs={6} sm={3}>
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
                </Grid>
              </Grid>
            </CardActions>
          </Card>
        </Grid>
      </React.Fragment>
    );
  }
  return null;
}
