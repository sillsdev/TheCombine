import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid2,
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
        .then(setSuccess)
        .finally(() => setLoaded(true));
    }
  }, [token]);

  if (loaded && !success) {
    return (
      <InvalidLink
        bodyTextId="emailVerify.invalidText"
        titleTextId="emailVerify.invalidTitle"
      />
    );
  }

  return (
    <Grid2 container justifyContent="center">
      <Card sx={{ width: 450 }}>
        <CardHeader
          title={
            <Typography align="center" variant="h5">
              {t(success ? "emailVerify.success" : "emailVerify.verifying")}
            </Typography>
          }
        />
        <CardContent>
          {success && (
            <Button
              onClick={() => navigate(Path.ProjScreen)}
              variant="contained"
            >
              {t("emailVerify.returnButton")}
            </Button>
          )}
        </CardContent>
      </Card>
    </Grid2>
  );
}
