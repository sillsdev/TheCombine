import { Grid } from "@mui/material";
import { ReactElement, useEffect } from "react";

import { clearCurrentProject } from "components/Project/ProjectActions";
import ChooseProject from "components/ProjectScreen/ChooseProject";
import CreateProject from "components/ProjectScreen/CreateProject";
import { resetTreeAction } from "components/TreeView/TreeViewActions";
import { useAppDispatch } from "types/hooks";

/** Where users create a project or choose an existing one */
export default function ProjectScreen(): ReactElement {
  const dispatch = useAppDispatch();
  /* Disable Data Entry, Data Cleanup, Project Settings until a project is selected or created. */
  useEffect(() => {
    dispatch(clearCurrentProject());
    dispatch(resetTreeAction());
  });

  return (
    <Grid container justifyContent="center" spacing={2}>
      <Grid item xs={12} sm={6}>
        <Grid container justifyContent="flex-end">
          <ChooseProject />
        </Grid>
      </Grid>
      <Grid item xs={12} sm={6}>
        <CreateProject />
      </Grid>
    </Grid>
  );
}
