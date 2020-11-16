import { Grid } from "@material-ui/core";
import * as React from "react";

import { setProjectId } from "../../backend/localStorage";
import ChooseProjectComponent from "./ChooseProject";
import CreateProjectComponent from "./CreateProject";

/** Where users create a project or choose an existing one */
export default function ProjectScreen() {
  /* Disable Data Entry, Data Cleanup, Project Settings until a project is selected or created. */
  setProjectId("");

  return (
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
  );
}
