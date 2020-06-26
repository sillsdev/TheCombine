import React from "react";
import { SemanticDomain, DomainWord } from "../../../types/word";
import { ImmutableExistingData } from "./ImmutableExistingData/ImmutableExistingData";
import { Button, Drawer, Grid, List } from "@material-ui/core";
import ListIcon from "@material-ui/icons/List";
import theme from "../../../types/theme";

interface ExistingDataTableProps {
  domain: SemanticDomain;
  typeDrawer: boolean;
  domainWords: DomainWord[];
  display: boolean;
}

interface ExistingDataTableStates {
  open: boolean;
  isSmallScreen: boolean;
}

/*Displays previously entered data in a panel to the right of the DataEntryTable */
export class ExistingDataTable extends React.Component<
  ExistingDataTableProps,
  ExistingDataTableStates
> {
  constructor(props: ExistingDataTableProps) {
    super(props);
    this.state = {
      open: false,
      isSmallScreen: false,
    };
  }

  toggleDrawer = (openClose: boolean) => (
    event: React.KeyboardEvent | React.MouseEvent
  ) => {
    if (
      event.type === "keydown" &&
      ((event as React.KeyboardEvent).key === "Tab" ||
        (event as React.KeyboardEvent).key === "Shift")
    ) {
      return;
    }
    this.setState({
      open: openClose,
    });
  };

  list() {
    let domainWords: DomainWord[] = this.props.domainWords;
    return (
      <div
        onClick={this.toggleDrawer(false)}
        onKeyDown={this.toggleDrawer(false)}
      >
        <List>
          {domainWords.map((domainWord) => (
            <ImmutableExistingData
              key={domainWord.word.id}
              vernacular={domainWord.word.vernacular}
              gloss={domainWord.gloss.def}
            />
          ))}
        </List>
      </div>
    );
  }

  renderDrawer() {
    if (this.props.typeDrawer) {
      return (
        <React.Fragment>
          <Button
            style={{ marginTop: theme.spacing(2) }}
            onClick={this.toggleDrawer(true)}
          >
            <ListIcon fontSize={"default"} color={"inherit"} />
          </Button>
          <Drawer
            role="presentation"
            anchor={"left"}
            open={this.state.open}
            onClose={this.toggleDrawer(false)}
          >
            {this.list()}
          </Drawer>
        </React.Fragment>
      );
    }
    return null;
  }

  renderSidePanel() {
    if (!this.props.typeDrawer) {
      return (
        <React.Fragment>
          <Grid item>{this.list()}</Grid>
        </React.Fragment>
      );
    }
    return null;
  }
  /*Make an interface that has the Word and an array of numbers to reference the senses desired to be displayed*/
  render() {
    if (this.props.domainWords.length > 0 && this.props.display) {
      return (
        <React.Fragment>
          {this.props.typeDrawer ? this.renderDrawer() : this.renderSidePanel()}
        </React.Fragment>
      );
    }
    return null;
  }
}
