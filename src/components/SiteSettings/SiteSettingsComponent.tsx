import { Grid } from "@material-ui/core";
import { Announcement, List, People } from "@material-ui/icons";
import { Translate } from "react-localize-redux";

import BaseSettingsComponent from "components/BaseSettings/BaseSettingsComponent";
import Banners from "components/SiteSettings/Banners/Banners";
import ProjectManagement from "components/SiteSettings/ProjectManagement/ProjectManagement";
import UserManagement from "components/SiteSettings//UserManagement/UserManagement";

export default function SiteSettingsComponent() {
  return (
    <Grid container justifyContent="center" spacing={6}>
      {/* Project List */}
      <BaseSettingsComponent
        icon={<List />}
        title={<Translate id="projectSettings.projectList" />}
        body={<ProjectManagement />}
      />

      {/* User List */}
      <BaseSettingsComponent
        icon={<People />}
        title={<Translate id="projectSettings.userList" />}
        body={<UserManagement />}
      />

      {/* Banners */}
      <BaseSettingsComponent
        icon={<Announcement />}
        title={<Translate id="siteSettings.banners.title" />}
        body={<Banners />}
      />
    </Grid>
  );
}
