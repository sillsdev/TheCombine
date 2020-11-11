import { Button } from "@material-ui/core";
import React from "react";
import { useSelector } from "react-redux";

import history, { path } from "../../history";
import { CurrentTab, tabColor } from "../../types/currentTab";

interface ProjectNameButtonProps {
  currentTab: CurrentTab;
}

/** A button that redirects to the project settings */
export default function ProjectNameButton(props: ProjectNameButtonProps) {
  const projectName = useSelector((state: any) => state.currentProject.name);

  return (
    <React.Fragment>
      <Button
        id="project-name"
        onClick={() => {
          history.push(path.projSettings);
        }}
        color="inherit"
        style={{
          background: tabColor(props.currentTab, CurrentTab.ProjectSettings),
        }}
      >
        {projectName}
      </Button>
    </React.Fragment>
  );
}
