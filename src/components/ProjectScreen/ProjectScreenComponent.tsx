//external modules
import * as React from "react";
import { Grid } from "@material-ui/core";
import AppBarComponent from "../AppBar/AppBarComponent";
import ChooseProjectComponent from "./ChooseProject";
import CreateProjectComponent from "./CreateProject";
import { setProjectId } from "../../backend/localStorage";

/** Where users create a project or choose an existing one */
export default class ProjectScreen extends React.Component {
  render() {
    /* Disable Data Entry, Data Cleanup, Project Settings until a project is selected or created. */
    setProjectId("");
    return (
      <div className="CreateProject">
        <AppBarComponent />
        <Grid container justify="center" spacing={2}>
          <Grid item xs={12} sm={6}>
            <Grid container justify="flex-end">
              <ChooseProjectComponent />
            </Grid>
          </Grid>
          <Grid item xs={12} sm={6}>
            <CreateProjectComponent />
          </Grid>
        </Grid>
      </div>
    );
  }
}
