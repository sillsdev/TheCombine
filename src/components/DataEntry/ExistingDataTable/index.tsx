import { Drawer, Grid, List, SxProps } from "@mui/material";
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
    <List style={{ minWidth: "300px" }}>
      {props.domainWords.map((domainWord) => (
        <ImmutableExistingData
          key={`${domainWord.wordGuid}-${domainWord.senseGuid}`}
          gloss={domainWord.gloss}
          vernacular={domainWord.vernacular}
        />
      ))}
    </List>
  );

  const renderDrawer = (): ReactElement => (
    <Drawer
      role="presentation"
      anchor={"left"}
      open={props.drawerOpen}
      onClick={closeDrawer}
      onClose={closeDrawer}
      onKeyDown={closeDrawer}
      style={{ zIndex: theme.zIndex.drawer + 1 }}
    >
      {list()}
    </Drawer>
  );

  const sxScrollOverflow: SxProps = {
    maxHeight: Math.max(props.height ?? 0, windowHeight - appBarHeight),
    overflowY: "scroll",
  };

  const renderSidePanel = (): ReactElement => (
    <Grid item md={5} lg={4} sx={sxScrollOverflow}>
      {list()}
    </Grid>
  );

  return props.typeDrawer ? renderDrawer() : renderSidePanel();
}
