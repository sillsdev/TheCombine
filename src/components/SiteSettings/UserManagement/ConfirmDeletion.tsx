import {
  Button,
  Grid,
  Typography,
  CardContent,
  Card,
  CardActions,
} from "@material-ui/core";
import React from "react";
import { Translate } from "react-localize-redux";
//styles the ToastContainer so that it appears on the upper right corner with the message.
import "react-toastify/dist/ReactToastify.min.css";

import { User } from "types/user";

interface ConfirmDeletionProps {
  user?: User;
  deleteUser: (userId: string) => void;
  handleCloseModal: () => void;
}

export default function ConfirmDeletion(props: ConfirmDeletionProps) {
  if (props.user) {
    return (
      <React.Fragment>
        <Grid container justify="center">
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
                <Translate id="siteSettings.deleteUser.confirm" />
              </Typography>
            </CardContent>
            <CardActions>
              <Grid container justify="space-evenly">
                <Grid item xs={6} sm={3}>
                  <Button
                    variant="contained"
                    onClick={() => {
                      if (props.user) props.deleteUser(props.user.id);
                    }}
                    color="secondary"
                  >
                    <Typography
                      align="center"
                      variant="h6"
                      style={{ color: "red" }}
                    >
                      <Translate id="buttons.delete" />
                    </Typography>
                  </Button>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Button
                    variant="contained"
                    onClick={() => props.handleCloseModal()}
                    color="secondary"
                  >
                    <Typography
                      align="center"
                      variant="h6"
                      style={{ color: "inherit" }}
                    >
                      <Translate id="buttons.cancel" />
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
