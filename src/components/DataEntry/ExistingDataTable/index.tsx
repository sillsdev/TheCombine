import { Drawer, Grid2, List, SxProps } from "@mui/material";
import { Fragment, ReactElement } from "react";

import { SemanticDomain } from "api/models";
import { appBarHeight } from "components/AppBar/AppBarTypes";
import ImmutableExistingData from "components/DataEntry/ExistingDataTable/ImmutableExistingData";
import theme from "types/theme";
import { DomainWord } from "types/word";
import { useWindowSize } from "utilities/useWindowSize";

interface ExistingDataTableProps {
  domain: SemanticDomain;
  domainWords: DomainWord[];
  drawerOpen?: boolean;
  height?: number;
  toggleDrawer: (openClosed: boolean) => void;
  typeDrawer?: boolean;
}

/**
 * Displays previously entered data in the specified domain.
 * If the window is wide enough, display as panel on right side.
 * Otherwise, have button to toggle pop-out drawer on left side.
 */
export default function ExistingDataTable(
  props: ExistingDataTableProps
): ReactElement {
  const { windowHeight } = useWindowSize();

  if (!props.domainWords.length) {
    return <Fragment />;
  }

  const closeDrawer = (): void => props.toggleDrawer(false);

  const list = (): ReactElement => (
    <List sx={{ minWidth: "300px" }}>
      {props.domainWords.map((w, i) => (
        <ImmutableExistingData
          glosses={w.glosses}
          index={i}
          key={`${w.wordGuid}-${w.senseGuid}`}
          vernacular={w.vernacular}
        />
      ))}
    </List>
  );

  const renderDrawer = (): ReactElement => (
    <Drawer
      anchor={document.body.dir === "rtl" ? "right" : "left"}
      open={props.drawerOpen}
      onClick={closeDrawer}
      onClose={closeDrawer}
      onKeyDown={closeDrawer}
      role="presentation"
      sx={{ zIndex: theme.zIndex.drawer + 1 }}
    >
      {list()}
    </Drawer>
  );

  const sxScrollOverflow: SxProps = {
    maxHeight: Math.max(props.height ?? 0, windowHeight - appBarHeight),
    overflowY: "scroll",
  };

  const renderSidePanel = (): ReactElement => (
    <Grid2 size={{ md: 5, lg: 4, xl: 3 }} sx={sxScrollOverflow}>
      {list()}
    </Grid2>
  );

  return props.typeDrawer ? renderDrawer() : renderSidePanel();
}
