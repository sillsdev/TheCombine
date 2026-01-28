import { Box, List, ListItem, Stack, Typography } from "@mui/material";
import { Fragment, ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { User, UserProjectInfo } from "api/models";
import { getUserProjects } from "backend";
import { compareUserProjectInfo } from "utilities/userProjectUtilities";

interface UserProjectsDialogProps {
  user?: User;
}

export default function UserProjectsDialog(
  props: UserProjectsDialogProps
): ReactElement {
  const [projInfo, setProjInfo] = useState<UserProjectInfo[] | undefined>();

  const { t } = useTranslation();

  useEffect(() => {
    setProjInfo(undefined);
    if (props.user?.id) {
      getUserProjects(props.user.id)
        .then((pi) => setProjInfo(pi.sort(compareUserProjectInfo)))
        .catch((err) => {
          console.error("Failed to fetch user projects:", err);
          toast.warning(t("siteSettings.userProjects.projectsLoadError"));
        });
    }
  }, [props.user?.id, t]);

  if (!props.user) {
    return <Fragment />;
  }

  return (
    <Box sx={{ maxWidth: 500 }}>
      <Stack spacing={2}>
        <Typography align="center" variant="h4">
          {props.user.username}
        </Typography>

        <Typography align="center" variant="h6">
          {t("siteSettings.userProjects.title")}
        </Typography>

        {projInfo === undefined ? (
          <Typography align="center">
            {t("siteSettings.userProjects.loading")}
          </Typography>
        ) : projInfo.length ? (
          <List dense disablePadding sx={{ maxHeight: 400, overflowY: "auto" }}>
            {projInfo.map((info) => (
              <ListItem key={info.projectId}>
                <Typography
                  sx={info.projectIsActive ? {} : { color: "text.secondary" }}
                >
                  • {info.projectName} (
                  {t(`projectSettings.roles.${`${info.role}`.toLowerCase()}`)})
                </Typography>
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography align="center">
            {t("siteSettings.userProjects.noProjects")}
          </Typography>
        )}
      </Stack>
    </Box>
  );
}
