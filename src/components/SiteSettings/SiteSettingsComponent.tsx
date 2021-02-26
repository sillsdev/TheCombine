import { Button, Grid } from "@material-ui/core";
import { List, People } from "@material-ui/icons";
import React from "react";
import { Translate } from "react-localize-redux";

import { populateAllGuids } from "backend";
import BaseSettingsComponent from "components/BaseSettings/BaseSettingsComponent";
import ProjectManagement from "components/SiteSettings/ProjectManagement/ProjectManagement";
import UserManagement from "components/SiteSettings//UserManagement/UserManagement";

export default function SiteSettingsComponent() {
  return (
    <Grid container justify="center" spacing={6}>
      {/* ToDo: Remove this Button after used on live server. */}
      <Button onClick={populateAllGuids} variant="contained" color="primary">
        Populate Guids
      </Button>

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
    </Grid>
  );
}
