//external modules
import * as React from "react";
import { Grid } from "@material-ui/core";
import AppBarComponent from "../AppBar/AppBarComponent";
import ChooseProjectComponent from "./ChooseProject";
import CreateProjectComponent from "./CreateProject";

/** Where users create a project or choose an existing one */
export default class ProjectScreen extends React.Component {
  render() {
    //visual definition
    return (
      <div className="CreateProject">
        <AppBarComponent />
        <Grid container justify="center" spacing={2}>
          <Grid item>
            <ChooseProjectComponent />
          </Grid>
          <Grid item>
            <CreateProjectComponent />
          </Grid>
        </Grid>
      </div>
    );
  }
}
