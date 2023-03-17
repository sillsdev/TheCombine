import { Grid } from "@mui/material";
import { useEffect } from "react";

import { clearCurrentProject } from "components/Project/ProjectActions";
import ChooseProjectComponent from "components/ProjectScreen/ChooseProject";
import CreateProjectComponent from "components/ProjectScreen/CreateProject";
import { useAppDispatch } from "types/hooks";

/** Where users create a project or choose an existing one */
export default function ProjectScreen() {
  const dispatch = useAppDispatch();
  /* Disable Data Entry, Data Cleanup, Project Settings until a project is selected or created. */
  useEffect(() => {
    dispatch(clearCurrentProject());
  });

  return (
    <Grid container justifyContent="center" spacing={2}>
      <Grid item xs={12} sm={6}>
        <Grid container justifyContent="flex-end">
          <ChooseProjectComponent />
        </Grid>
      </Grid>
      <Grid item xs={12} sm={6}>
        <CreateProjectComponent />
      </Grid>
    </Grid>
  );
}
