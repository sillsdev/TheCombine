import { Drawer, Grid, List } from "@material-ui/core";
import React from "react";

import { DomainWord, SemanticDomain } from "../../../types/word";
import { ImmutableExistingData } from "./ImmutableExistingData";

interface ExistingDataTableProps {
  domain: SemanticDomain;
  typeDrawer: boolean;
  domainWords: DomainWord[];
  drawerOpen: boolean;
  toggleDrawer: (openClosed: boolean) => void;
}

/*Displays previously entered data in a panel to the right of the DataEntryTable */
export class ExistingDataTable extends React.Component<ExistingDataTableProps> {
  closeDrawer = () => {
    this.props.toggleDrawer(false);
  };

  list() {
    let domainWords: DomainWord[] = this.props.domainWords;
    return (
      <List style={{ minWidth: "300px" }}>
        {domainWords.map((domainWord) => (
          <ImmutableExistingData
            key={domainWord.word.id}
            vernacular={domainWord.word.vernacular}
            gloss={domainWord.gloss ? domainWord.gloss.def : ""}
          />
        ))}
      </List>
    );
  }

  renderDrawer() {
    return (
      <React.Fragment>
        <div onClick={this.closeDrawer} onKeyDown={this.closeDrawer}>
          <Drawer
            role="presentation"
            anchor={"left"}
            open={this.props.drawerOpen}
            onClose={this.closeDrawer}
          >
            {this.list()}
          </Drawer>
        </div>
      </React.Fragment>
    );
  }

  renderSidePanel() {
    return (
      <React.Fragment>
        <Grid item md={5} lg={4}>
          {this.list()}
        </Grid>
      </React.Fragment>
    );
  }

  /*Make an interface that has the Word and an array of numbers to reference the senses desired to be displayed*/
  render() {
    if (this.props.domainWords.length > 0) {
      return (
        <React.Fragment>
          {this.props.typeDrawer ? this.renderDrawer() : this.renderSidePanel()}
        </React.Fragment>
      );
    }
    return null;
  }
}
