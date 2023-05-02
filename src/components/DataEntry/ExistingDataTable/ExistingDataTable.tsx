import { Drawer, Grid, List } from "@mui/material";
import React, { ReactElement } from "react";

import { SemanticDomain } from "api/models";
import { ImmutableExistingData } from "components/DataEntry/ExistingDataTable/ImmutableExistingData";
import theme from "types/theme";
import { DomainWord } from "types/word";

interface ExistingDataTableProps {
  domain: SemanticDomain;
  typeDrawer?: boolean;
  domainWords: DomainWord[];
  drawerOpen?: boolean;
  toggleDrawer: (openClosed: boolean) => void;
}

/*** Displays previously entered data in the specified domain.
 * If the window is wide enough, display as panel on right side.
 * Otherwise, have button to toggle pop-out drawer on left side.
 */
export default function ExistingDataTable(
  props: ExistingDataTableProps
): ReactElement {
  const closeDrawer = (): void => props.toggleDrawer(false);

  const list = (): ReactElement => {
    return (
      <List style={{ minWidth: "300px" }}>
        {props.domainWords.map((domainWord) => (
          <ImmutableExistingData
            key={`${domainWord.wordGuid}-${domainWord.senseGuid}`}
            vernacular={domainWord.vernacular}
            gloss={domainWord.gloss}
          />
        ))}
      </List>
    );
  };

  const renderDrawer = (): ReactElement => {
    return (
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
  };

  const renderSidePanel = (): ReactElement => {
    return (
      <Grid item md={5} lg={4}>
        {list()}
      </Grid>
    );
  };

  return props.domainWords.length ? (
    <React.Fragment>
      {props.typeDrawer ? renderDrawer() : renderSidePanel()}
    </React.Fragment>
  ) : (
    <div />
  );
}
