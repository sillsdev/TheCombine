import { Button } from "@mui/material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";

import history, { Path } from "browserHistory";
import { appBarHeight } from "components/AppBar/AppBarComponent";
import { tabColor } from "types/theme";

interface NavigationButtonsProps {
  currentTab: Path;
}

/** A button that redirects to the home page */
export default function NavigationButtons(
  props: NavigationButtonsProps
): ReactElement {
  return (
    <>
      <NavButton
        buttonId="data-entry"
        currentPath={props.currentTab}
        targetPath={Path.DataEntry}
        textId="appBar.dataEntry"
      />
      <NavButton
        buttonId="data-cleanup"
        currentPath={props.currentTab}
        targetPath={Path.Goals}
        textId="appBar.dataCleanup"
      />
    </>
  );
}

interface NavButtonProps {
  buttonId: string;
  currentPath: Path;
  targetPath: Path;
  textId: string;
}

function NavButton(props: NavButtonProps): ReactElement {
  const { t } = useTranslation();

  return (
    <Button
      id={props.buttonId}
      onClick={() => history.push(props.targetPath)}
      color="inherit"
      style={{
        background: tabColor(props.currentPath, props.targetPath),
        marginLeft: 2,
        marginRight: 2,
        maxHeight: appBarHeight,
        width: "min-content",
      }}
    >
      {t(props.textId)}
    </Button>
  );
}
