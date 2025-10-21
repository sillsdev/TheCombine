import { Help } from "@mui/icons-material";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid2,
  Stack,
  Typography,
} from "@mui/material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { Path } from "types/path";
import { openUserGuide } from "utilities/pathUtilities";

export interface InvalidLinkProps {
  bodyTextId?: string;
  titleTextId: string;
}

export default function InvalidLink(props: InvalidLinkProps): ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const idAffix = "invalid-link";

  return (
    <Grid2 container justifyContent="center">
      <Card sx={{ width: 450 }}>
        <CardHeader
          title={
            <Typography align="center" variant="h5">
              {t(props.titleTextId)}
            </Typography>
          }
        />

        <CardContent>
          <Stack spacing={2}>
            {props.bodyTextId ? (
              <Typography>{t(props.bodyTextId)}</Typography>
            ) : null}

            {/* User Guide, Sign Up, and Log In buttons */}
            <Grid2 container spacing={2}>
              <Grid2 size="grow">
                <Button id={`${idAffix}-guide`} onClick={() => openUserGuide()}>
                  <Help />
                </Button>
              </Grid2>

              <Button
                id={`${idAffix}-signUp`}
                onClick={() => {
                  navigate(Path.Signup);
                }}
                variant="contained"
              >
                {t("login.signUp")}
              </Button>

              <Button
                id={`${idAffix}-login`}
                onClick={() => {
                  navigate(Path.Login);
                }}
                variant="contained"
              >
                {t("login.login")}
              </Button>
            </Grid2>
          </Stack>
        </CardContent>
      </Card>
    </Grid2>
  );
}
