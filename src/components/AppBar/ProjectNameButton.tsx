import { Button, Hidden, Tooltip } from "@material-ui/core";
import { Settings } from "@material-ui/icons";
import { Translate } from "react-localize-redux";
import { useSelector } from "react-redux";

import history, { Path } from "browserHistory";
import { StoreState } from "types";
import { tabColor } from "types/theme";

interface ProjectNameButtonProps {
  currentTab: Path;
}

/** A button that redirects to the project settings */
export default function ProjectNameButton(props: ProjectNameButtonProps) {
  const projectName = useSelector(
    (state: StoreState) => state.currentProjectState.project.name
  );
  const background = tabColor(props.currentTab, Path.ProjSettings);
  return (
    <Tooltip title={<Translate id="userMenu.projectSettings" />}>
      <Button
        id="project-name"
        onClick={() => history.push(Path.ProjSettings)}
        color="inherit"
        style={{ background }}
      >
        <Settings />
        <Hidden xsDown>{projectName}</Hidden>
      </Button>
    </Tooltip>
  );
}
