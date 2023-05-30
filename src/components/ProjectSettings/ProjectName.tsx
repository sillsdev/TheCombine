import { Button, Grid, TextField } from "@mui/material";
import { ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { Project } from "api/models";
import { asyncUpdateCurrentProject } from "components/Project/ProjectActions";
import { StoreState } from "types";
import { useAppDispatch, useAppSelector } from "types/hooks";

export default () => {
  const dispatch = useAppDispatch();
  const project = useAppSelector(
    (state: StoreState) => state.currentProjectState.project
  );
  const updateProject = async (proj: Project) => {
    dispatch(asyncUpdateCurrentProject(proj));
  };
  return <ProjectName project={project} updateProject={updateProject} />;
};

interface ProjectNameProps {
  project: Project;
  updateProject: (project: Project) => Promise<void>;
}

export function ProjectName(props: ProjectNameProps): ReactElement {
  const [projName, setProjName] = useState(props.project.name);
  const { t } = useTranslation();

  const updateProjectName = async (): Promise<void> => {
    await props
      .updateProject({ ...props.project, name: projName })
      .catch((err) => {
        console.error(err);
        toast.error(t("projectSettings.nameUpdateFailed"));
      });
  };

  return (
    <Grid container spacing={1}>
      <Grid item xs={12}>
        <TextField
          variant="standard"
          id="project-name"
          value={props.project.name}
          onChange={(e) => setProjName(e.target.value)}
          onBlur={() => updateProjectName()}
        />
      </Grid>
      <Grid item>
        <Button
          // No onClick necessary, as name updates on blur away from TextField.
          variant="contained"
          color="primary"
          id="project-name-save"
        >
          {t("buttons.save")}
        </Button>
      </Grid>
    </Grid>
  );
}
