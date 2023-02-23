import { Grid } from "@mui/material";
import { Announcement, List, People } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

import BaseSettingsComponent from "components/BaseSettings/BaseSettingsComponent";
import Banners from "components/SiteSettings/Banners/Banners";
import ProjectManagement from "components/SiteSettings/ProjectManagement/ProjectManagement";
import UserManagement from "components/SiteSettings/UserManagement/UserManagement";

export default function SiteSettingsComponent() {
  const { t } = useTranslation();

  return (
    <Grid container justifyContent="center" spacing={6}>
      {/* Project List */}
      <BaseSettingsComponent
        icon={<List />}
        title={t("projectSettings.projectList")}
        body={<ProjectManagement />}
      />

      {/* User List */}
      <BaseSettingsComponent
        icon={<People />}
        title={t("projectSettings.userList")}
        body={<UserManagement />}
      />

      {/* Banners */}
      <BaseSettingsComponent
        icon={<Announcement />}
        title={t("siteSettings.banners.title")}
        body={<Banners />}
      />
    </Grid>
  );
}
