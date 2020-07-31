import React from "react";
import { Button } from "@material-ui/core";
import history from "../../history";
import { CurrentTab, tabColor } from "../../types/currentTab";
import { useSelector } from "react-redux";

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
          history.push("/project-settings");
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
