import { Box, Button, Stack, Typography } from "@mui/material";
import { Fragment, ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

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
  const [loading, setLoading] = useState(false);
  const [userProjects, setUserProjects] = useState<UserProjectInfo[]>([]);

  useEffect(() => {
    setUserProjects([]);
    if (props.user?.id) {
      setLoading(true);
      getUserProjects(props.user.id)
        .then((projects) => {
          setUserProjects(projects);
          setLoading(false);
        })
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
        <Typography align="center" sx={{ color: "warning.main" }} variant="h4">
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
            <Typography
              align="center"
              sx={{ color: "warning.main" }}
              variant="h6"
            >
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
