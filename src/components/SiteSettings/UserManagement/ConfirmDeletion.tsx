import { Box, Button, List, ListItem, Stack, Typography } from "@mui/material";
import { Fragment, ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { User, UserProjectInfo } from "api/models";
import { getUserProjects } from "backend";
import { compareProjectInfo } from "components/SiteSettings/UserManagement/utilities";

interface ConfirmDeletionProps {
  user?: User;
  deleteUser: (userId: string) => void;
  handleCloseModal: () => void;
}

export default function ConfirmDeletion(
  props: ConfirmDeletionProps
): ReactElement {
  const [projInfo, setProjInfo] = useState<UserProjectInfo[] | undefined>();

  const { t } = useTranslation();

  useEffect(() => {
    setProjInfo(undefined);
    if (props.user?.id) {
      getUserProjects(props.user.id)
        .then((pi) => setProjInfo(pi.sort(compareProjectInfo)))
        .catch((err) => {
          console.error("Failed to fetch user projects:", err);
          toast.warning(t("siteSettings.deleteUser.projectsLoadError"));
        });
    }
  }, [props.user?.id, t]);

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

        {projInfo === undefined ? (
          <Typography align="center">
            {t("siteSettings.deleteUser.loadingProjects")}
          </Typography>
        ) : projInfo.length ? (
          <>
            <Typography>
              {t("siteSettings.deleteUser.projectsTitle")}
            </Typography>
            <List
              dense
              disablePadding
              sx={{ maxHeight: 300, overflowY: "auto" }}
            >
              {projInfo.map((info) => (
                <ListItem key={info.projectId}>
                  <Typography
                    sx={info.projectIsActive ? {} : { color: "text.secondary" }}
                  >
                    • {info.projectName} (
                    {t(`projectSettings.roles.${`${info.role}`.toLowerCase()}`)}
                    )
                  </Typography>
                </ListItem>
              ))}
            </List>
          </>
        ) : (
          <Typography align="center">
            {t("siteSettings.deleteUser.noProjects")}
          </Typography>
        )}

        <Stack direction="row" justifyContent="space-evenly">
          <Button
            color="secondary"
            disabled={!props.user?.id || projInfo === undefined}
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
