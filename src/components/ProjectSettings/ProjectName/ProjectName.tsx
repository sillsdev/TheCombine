import React from "react";
import { TextField, Grid, Button } from "@material-ui/core";

import { updateProject } from "../../../backend";
import { Project } from "../../../types/project";
import { Translate } from "react-localize-redux";

interface NameProps {
  project: Project;
  setCurrentProject: (project: Project) => void;
}

function ProjectName(props: NameProps) {
  const [projectName, setProjectName] = React.useState<string>(
    props.project.name
  );

  function updateName() {
    // Update backend
    updateProject({
      ...props.project,
      name: projectName,
    });

    // Update redux store
    props.setCurrentProject({
      ...props.project,
      name: projectName,
    });
  }

  return (
    <Grid container spacing={1}>
      <Grid item xs={12}>
        <TextField
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          onBlur={() => updateName()}
        />
      </Grid>
      <Grid item>
        <Button
          variant="contained"
          color={projectName !== props.project.name ? "primary" : "default"}
          onClick={() => updateName()}
        >
          <Translate id="projectSettings.language.save" />
        </Button>
      </Grid>
    </Grid>
  );
}

export default ProjectName;
