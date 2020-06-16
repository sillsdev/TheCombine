import React, { useState, useEffect } from "react";
import { Button } from "@material-ui/core";
import history from "../../history";
import { getProjectId } from "../../backend/localStorage";
import { getProject } from "../../backend/index";
import { Project } from "../../types/project";

/** A button that redirects to the project settings */
export default function ProjectNameButton() {
  const highlight: string = "#1976d2";
  const colors = ["inherit", highlight];
  const [page, setPage] = useState(history.location.pathname);
  const [projectName, setProjectName] = useState("");

  useEffect(() => {
    const getProjectName = async () => {
      const project: Project = await getProject(getProjectId());
      setProjectName(project.name);
    };
    getProjectName();
  }, []);

  return (
    <Button
      onClick={() => {
        history.push("/project-settings");
        setPage("/project-settings");
      }}
      color="inherit"
      style={{
        background: page === "/project-settings" ? colors[1] : colors[0],
      }}
    >
      {projectName}
    </Button>
  );
}
