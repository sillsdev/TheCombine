import { Button, Hidden, Tooltip } from "@mui/material";
import { Settings } from "@mui/icons-material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import history, { Path } from "browserHistory";
import { StoreState } from "types";
import { tabColor } from "types/theme";

interface ProjectNameButtonProps {
  currentTab: Path;
}

/** A button that redirects to the project settings */
export default function ProjectNameButton(
  props: ProjectNameButtonProps
): ReactElement {
  const projectName = useSelector(
    (state: StoreState) => state.currentProjectState.project.name
  );
  const { t } = useTranslation();

  const background = tabColor(props.currentTab, Path.ProjSettings);
  return (
    <Tooltip title={t("userMenu.projectSettings")}>
      <Button
        id="project-name"
        onClick={() => history.push(Path.ProjSettings)}
        color="inherit"
        style={{ background }}
      >
        <Settings />
        <Hidden smDown>{projectName}</Hidden>
      </Button>
    </Tooltip>
  );
}
