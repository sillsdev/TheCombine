import { Hidden, Stack } from "@mui/material";
import { ReactElement, useEffect } from "react";

import { clearCurrentProject } from "components/Project/ProjectActions";
import ChooseProject from "components/ProjectScreen/ChooseProject";
import CreateProject from "components/ProjectScreen/CreateProject";
import { resetTree } from "components/TreeView/Redux/TreeViewActions";
import { useAppDispatch } from "types/hooks";

/** Where users create a project or choose an existing one */
export default function ProjectScreen(): ReactElement {
  const dispatch = useAppDispatch();
  /* Disable Data Entry, Data Cleanup, Project Settings until a project is selected or created. */
  useEffect(() => {
    dispatch(clearCurrentProject());
    dispatch(resetTree());
  }, [dispatch]);

  return (
    <>
      <Hidden smUp>
        <Stack alignItems="center" spacing={2}>
          <ChooseProject />
          <CreateProject />
        </Stack>
      </Hidden>
      <Hidden smDown>
        <Stack direction="row" justifyContent="center" spacing={2}>
          <ChooseProject />
          <CreateProject />
        </Stack>
      </Hidden>
    </>
  );
}
