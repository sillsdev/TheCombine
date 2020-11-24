import { Grid } from "@material-ui/core";
import { List, People } from "@material-ui/icons";
import React from "react";
import { Translate } from "react-localize-redux";

import BaseSettingsComponent from "../BaseSettings/BaseSettingsComponent";
import ProjectManagement from "./ProjectManagement/ProjectManagement";
import UserManagment from "./UserManagment/UserManagment";

export default function SiteSettingsComponent() {
  return (
    <Grid container justify="center" spacing={6}>
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
        body={<UserManagment />}
      />
    </Grid>
  );
}
