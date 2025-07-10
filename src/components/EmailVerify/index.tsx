import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid2,
  Stack,
  Typography,
} from "@mui/material";
import { type ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";

import { verifyEmail } from "backend";
import InvalidLink from "components/InvalidLink";
import { Path } from "types/path";

export default function EmailVerify(): ReactElement {
  const navigate = useNavigate();
  const { token } = useParams();
  const { t } = useTranslation();

  const [loaded, setLoaded] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (token) {
      verifyEmail(token)
        .then(() => setSuccess(true))
        .catch();
      setLoaded(true);
    }
  }, [token]);

  if (loaded && !success) {
    return <InvalidLink textId={"Email verification failed."} />;
  }

  return (
    <Grid2 container justifyContent="center">
      <Card sx={{ width: 450 }}>
        <CardHeader
          title={
            <Typography align="center" variant="h5">
              {t("Verifying email address")}
            </Typography>
          }
        />
        <CardContent>
          {success && (
            <Stack spacing={2}>
              <Typography>{t("Success!")}</Typography>
              <Button
                onClick={() => navigate(Path.AppRoot)}
                variant="contained"
              >
                {t("Return to The Combine")}
              </Button>
            </Stack>
          )}
        </CardContent>
      </Card>
    </Grid2>
  );
}
