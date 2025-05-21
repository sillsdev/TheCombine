import { Help } from "@mui/icons-material";
import { Button, Card, CardContent, Grid, Typography } from "@mui/material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { Path } from "types/path";
import { openUserGuide } from "utilities/pathUtilities";

export interface InvalidLinkProps {
  textId: string;
}

export default function InvalidLink(props: InvalidLinkProps): ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const idAffix = "invalid-link";

  return (
    <Grid container justifyContent="center">
      <Card style={{ width: 450 }}>
        <CardContent>
          <Typography variant="h5" align="center" gutterBottom>
            {t(props.textId)}
          </Typography>
          {/* User Guide, Sign Up, and Log In buttons */}
          <Grid container justifyContent="flex-end" spacing={2}>
            <Grid item xs={4} sm={6}>
              <Button id={`${idAffix}-guide`} onClick={() => openUserGuide()}>
                <Help />
              </Button>
            </Grid>

            <Grid item xs={4} sm={3}>
              <Button
                id={`${idAffix}-signUp`}
                onClick={() => {
                  navigate(Path.Signup);
                }}
              >
                {t("login.signUp")}
              </Button>
            </Grid>

            <Grid item xs={4} sm={3}>
              <Button
                id={`${idAffix}-login`}
                onClick={() => {
                  navigate(Path.Login);
                }}
              >
                {t("login.login")}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Grid>
  );
}
