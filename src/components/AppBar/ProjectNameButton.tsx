import React, { useState, useEffect } from "react";
import { Button } from "@material-ui/core";
import history from "../../history";
import { getProjectId } from "../../backend/localStorage";
import { getProject } from "../../backend/index";
import { Project } from "../../types/project";
import { CurrentTab } from "../../types/currentTab";
import { shade } from "../../types/theme";

function tabColor(currentTab: CurrentTab, tabName: CurrentTab) {
  const colors = ["inherit", shade];
  if (currentTab === tabName) {
    return colors[1];
  } else return colors[0];
}

interface ProjectNameButtonProps {
  currentTab: CurrentTab;
}

/** A button that redirects to the project settings */
export default function ProjectNameButton(props: ProjectNameButtonProps) {
  const [projectName, setProjectName] = useState("");

  useEffect(() => {
    const getProjectName = async () => {
      const project: Project = await getProject(getProjectId());
      setProjectName(project.name);
    };
    getProjectName();
  }, []);

  return (
    <React.Fragment>
      <Button
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
