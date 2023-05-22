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
  const { t } = useTranslation();

  return (
    <>
      <Button
        id={"data-entry"}
        onClick={() => history.push(Path.DataEntry)}
        color="inherit"
        style={{
          background: tabColor(props.currentTab, Path.DataEntry),
          maxHeight: appBarHeight,
          width: "min-content",
        }}
      >
        {t("appBar.dataEntry")}
      </Button>
      <Button
        id={"data-cleanup"}
        onClick={() => history.push(Path.Goals)}
        color="inherit"
        style={{
          background: tabColor(props.currentTab, Path.Goals),
          maxHeight: appBarHeight,
          width: "min-content",
        }}
      >
        {t("appBar.dataCleanup")}
      </Button>
    </>
  );
}
