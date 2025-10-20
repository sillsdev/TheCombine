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
import { reset } from "rootRedux/actions";
import { useAppDispatch } from "rootRedux/hooks";
import { Path } from "types/path";

export enum EmailVerifyTextId {
  ButtonReturn = "emailVerify.returnButton",
  InvalidLinkBody = "emailVerify.invalidText",
  InvalidLinkTitle = "emailVerify.invalidTitle",
  TitleSuccess = "emailVerify.success",
  TitleVerifying = "emailVerify.verifying",
}

export default function EmailVerify(): ReactElement {
  const dispatch = useAppDispatch();
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

  useEffect(() => {
    if (success) {
      // Trigger logout to force user to re-login (since we don't sync state between tabs).
      dispatch(reset());
    }
  }, [dispatch, success]);

  if (loaded && !success) {
    return (
      <InvalidLink
        bodyTextId={EmailVerifyTextId.InvalidLinkBody}
        titleTextId={EmailVerifyTextId.InvalidLinkTitle}
      />
    );
  }

  return (
    <Grid2 container justifyContent="center">
      <Card sx={{ width: 450 }}>
        <CardHeader
          title={
            <Typography align="center" variant="h5">
              {t(
                success
                  ? EmailVerifyTextId.TitleSuccess
                  : EmailVerifyTextId.TitleVerifying
              )}
            </Typography>
          }
        />
        <CardContent>
          {success && (
            <Button onClick={() => navigate(Path.Login)} variant="contained">
              {t(EmailVerifyTextId.ButtonReturn)}
            </Button>
          )}
        </CardContent>
      </Card>
    </Grid2>
  );
}
