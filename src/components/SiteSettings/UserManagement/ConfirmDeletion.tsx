import { Box, Button, Stack, Typography } from "@mui/material";
import { Fragment, ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { User } from "api/models";
import { getUserProjects, UserProjectInfo } from "backend";

interface ConfirmDeletionProps {
  user?: User;
  deleteUser: (userId: string) => void;
  handleCloseModal: () => void;
}

export default function ConfirmDeletion(
  props: ConfirmDeletionProps
): ReactElement {
  const { t } = useTranslation();
  const [userProjects, setUserProjects] = useState<UserProjectInfo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (props.user) {
      setLoading(true);
      getUserProjects(props.user.id)
        .then((projects) => {
          setUserProjects(projects);
        })
        .catch((err) => {
          console.error("Failed to fetch user projects:", err);
          setUserProjects([]);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setUserProjects([]);
    }
  }, [props.user]);

  if (!props.user) {
    return <Fragment />;
  }

  return (
    <Box sx={{ maxWidth: 500 }}>
      <Stack spacing={2}>
        <Typography align="center" sx={{ color: "red" }} variant="h4">
          {props.user.username}
        </Typography>

        <Typography align="center" variant="h6">
          {t("siteSettings.deleteUser.confirm")}
        </Typography>

        {loading ? (
          <Typography align="center">
            {t("siteSettings.deleteUser.loadingProjects")}
          </Typography>
        ) : userProjects.length > 0 ? (
          <>
            <Typography align="center" variant="subtitle1">
              {t("siteSettings.deleteUser.projectsTitle")}
            </Typography>
            <Box sx={{ maxHeight: 200, overflowY: "auto" }}>
              <Stack spacing={1}>
                {userProjects.map((project) => (
                  <Typography key={project.projectId} variant="body2">
                    • {project.projectName} ({project.role})
                  </Typography>
                ))}
              </Stack>
            </Box>
          </>
        ) : (
          <Typography align="center" variant="body2">
            {t("siteSettings.deleteUser.noProjects")}
          </Typography>
        )}

        <Stack direction="row" justifyContent="space-evenly">
          <Button
            color="secondary"
            id="user-delete-confirm"
            onClick={() => {
              if (props.user) {
                props.deleteUser(props.user.id);
              }
            }}
            variant="contained"
          >
            <Typography align="center" sx={{ color: "red" }} variant="h6">
              {t("buttons.delete")}
            </Typography>
          </Button>

          <Button
            color="secondary"
            id="user-delete-cancel"
            onClick={() => props.handleCloseModal()}
            variant="contained"
          >
            <Typography align="center" variant="h6">
              {t("buttons.cancel")}
            </Typography>
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
