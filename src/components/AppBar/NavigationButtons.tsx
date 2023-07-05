import { Button } from "@mui/material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import {
  TabProps,
  appBarHeight,
  buttonMinHeight,
  tabColor,
} from "components/AppBar/AppBarTypes";
import { Path } from "types/path";
import { useWindowSize } from "utilities/useWindowSize";

export const dataEntryButtonId = "data-entry";
export const dataCleanupButtonId = "data-cleanup";

const navButtonMaxWidthProportion = 0.12;

/** A button that redirects to the home page */
export default function NavigationButtons(props: TabProps): ReactElement {
  return (
    <>
      <NavButton
        buttonId={dataEntryButtonId}
        currentTab={props.currentTab}
        targetPath={Path.DataEntry}
        textId="appBar.dataEntry"
      />
      <NavButton
        buttonId={dataCleanupButtonId}
        currentTab={props.currentTab}
        targetPath={Path.Goals}
        textId="appBar.dataCleanup"
      />
    </>
  );
}

interface NavButtonProps extends TabProps {
  buttonId: string;
  targetPath: Path;
  textId: string;
}

function NavButton(props: NavButtonProps): ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { windowWidth } = useWindowSize();

  return (
    <Button
      id={props.buttonId}
      onClick={() => navigate(props.targetPath)}
      color="inherit"
      style={{
        background: tabColor(props.currentTab, props.targetPath),
        marginLeft: 2,
        marginRight: 2,
        maxHeight: appBarHeight,
        maxWidth: navButtonMaxWidthProportion * windowWidth,
        minHeight: buttonMinHeight,
        width: "fit-content",
      }}
    >
      {t(props.textId)}
    </Button>
  );
}
