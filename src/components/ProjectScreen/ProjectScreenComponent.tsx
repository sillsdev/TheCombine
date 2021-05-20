import { Grid } from "@material-ui/core";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { clearCurrentProject } from "components/Project/ProjectActions";
import ChooseProjectComponent from "components/ProjectScreen/ChooseProject";
import CreateProjectComponent from "components/ProjectScreen/CreateProject";

/** Where users create a project or choose an existing one */
export default function ProjectScreen() {
  const dispatch = useDispatch();
  /* Disable Data Entry, Data Cleanup, Project Settings until a project is selected or created. */
  useEffect(() => clearCurrentProject(dispatch));

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
