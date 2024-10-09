import { Stack, Theme, useMediaQuery } from "@mui/material";
import { ReactElement, useEffect } from "react";

import { clearCurrentProject } from "components/Project/ProjectActions";
import ChooseProject from "components/ProjectScreen/ChooseProject";
import CreateProject from "components/ProjectScreen/CreateProject";
import { resetTree } from "components/TreeView/Redux/TreeViewActions";
import { useAppDispatch } from "rootRedux/hooks";

/** Where users create a project or choose an existing one */
export default function ProjectScreen(): ReactElement {
  const dispatch = useAppDispatch();
  const isXs = useMediaQuery<Theme>((th) => th.breakpoints.only("xs"));

  /* Disable Data Entry, Data Cleanup, Project Settings until a project is selected or created. */
  useEffect(() => {
    dispatch(clearCurrentProject());
    dispatch(resetTree());
  }, [dispatch]);

  return (
    <Stack
      {...(isXs
        ? { alignItems: "center" }
        : { direction: "row", justifyContent: "center" })}
      spacing={2}
    >
      <ChooseProject />
      <CreateProject />
    </Stack>
  );
}
