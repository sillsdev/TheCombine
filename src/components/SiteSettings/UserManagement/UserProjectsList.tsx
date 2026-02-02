import { List, ListItem, Typography } from "@mui/material";
import { Fragment, ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { UserProjectInfo } from "api/models";
import { getUserProjects } from "backend";
import { compareUserProjectInfo } from "utilities/userProjectUtilities";

interface UserProjectsListProps {
  onLoaded?: () => void;
  userId: string;
}

export default function UserProjectsList(
  props: UserProjectsListProps
): ReactElement {
  const [projInfo, setProjInfo] = useState<UserProjectInfo[] | undefined>();

  const { t } = useTranslation();

  useEffect(() => {
    let canceled = false;
    setProjInfo(undefined);
    if (props.userId) {
      getUserProjects(props.userId)
        .then((pi) => {
          if (canceled) {
            return;
          }
          setProjInfo(pi.toSorted(compareUserProjectInfo));
          props.onLoaded?.();
        })
        .catch((err) => {
          console.error("Failed to fetch user projects:", err);
          toast.warning(t("siteSettings.deleteUser.projectsLoadError"));
        });
    }
    return () => {
      canceled = true;
    };
  }, [props.onLoaded, props.userId, t]);

  if (!props.userId) {
    return <Fragment />;
  }

  if (!projInfo) {
    return (
      <Typography align="center">
        {t("siteSettings.deleteUser.loadingProjects")}
      </Typography>
    );
  }

  if (!projInfo.length) {
    return (
      <Typography align="center">
        {t("siteSettings.deleteUser.noProjects")}
      </Typography>
    );
  }

  return (
    <>
      <Typography>{t("siteSettings.deleteUser.projectsTitle")}</Typography>
      <List dense disablePadding sx={{ maxHeight: 500, overflowY: "auto" }}>
        {projInfo.map((info) => (
          <ListItem key={info.projectId}>
            <Typography
              sx={info.projectIsActive ? {} : { color: "text.secondary" }}
            >
              • {info.projectName} (
              {t(`projectSettings.roles.${info.role.toLowerCase()}`)})
            </Typography>
          </ListItem>
        ))}
      </List>
    </>
  );
}
