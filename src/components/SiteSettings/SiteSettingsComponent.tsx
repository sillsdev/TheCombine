import React from "react";
import {
  LocalizeContextProps,
  withLocalize,
  Translate,
} from "react-localize-redux";
import { Grid } from "@material-ui/core";
import { GetApp } from "@material-ui/icons";
import AppBarComponent from "../AppBar/AppBarComponent";
import BaseSettingsComponent from "../ProjectSettings/BaseSettingsComponent/BaseSettingsComponent";
import ProjectsExport from "./ProjectsExport";

class SiteSettingsComponent extends React.Component<LocalizeContextProps> {
  constructor(props: LocalizeContextProps) {
    super(props);
  }

  render() {
    return (
      <React.Fragment>
        <AppBarComponent />
        <Grid container justify="center" spacing={6}>
          {/* Project List */}
          <BaseSettingsComponent
            icon={<GetApp />}
            title={<Translate id="projectSettings.list" />}
            body={<ProjectsExport />}
          />
        </Grid>
      </React.Fragment>
    );
  }
}

export default withLocalize(SiteSettingsComponent);
