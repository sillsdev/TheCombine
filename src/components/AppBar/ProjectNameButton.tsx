import { Button, Hidden, Tooltip } from "@material-ui/core";
import { Settings } from "@material-ui/icons";
import React from "react";
import { Translate } from "react-localize-redux";
import { useSelector } from "react-redux";

import history, { Path } from "browserHistory";
import { tabColor } from "types/theme";

interface ProjectNameButtonProps {
  currentTab: Path;
}

/** A button that redirects to the project settings */
export default function ProjectNameButton(props: ProjectNameButtonProps) {
  const projectName = useSelector((state: any) => state.currentProject.name);

  return (
    <React.Fragment>
      <Tooltip title={<Translate id="userMenu.projectSettings" />}>
        <Button
          id="project-name"
          onClick={() => {
            history.push(Path.ProjSettings);
          }}
          color="inherit"
          style={{
            background: tabColor(props.currentTab, Path.ProjSettings),
          }}
        >
          <Settings />
          <Hidden xsDown>{projectName}</Hidden>
        </Button>
      </Tooltip>
    </React.Fragment>
  );
}
