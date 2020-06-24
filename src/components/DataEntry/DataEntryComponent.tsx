import React from "react";
import { Paper, Divider, Dialog, Grid } from "@material-ui/core";
import theme from "../../types/theme";

import { withLocalize, LocalizeContextProps } from "react-localize-redux";
import { SemanticDomain } from "../../types/word";
import DomainTree from "../TreeView/SemanticDomain";
import TreeViewComponent from "../TreeView";
import DataEntryHeader from "./DataEntryHeader/DataEntryHeader";
import DataEntryTable from "./DataEntryTable/DataEntryTable";
import AppBarComponent from "../AppBar/AppBarComponent";
import { ExistingDataTable } from "./ExistingDataTable/ExistingDataTable";

interface DataEntryProps {
  domain: DomainTree;
}

interface DataEntryState {
  displaySemanticDomain: boolean;
}

const paperStyle = {
  padding: theme.spacing(2),
  maxWidth: 800,
  marginLeft: "auto",
  marginRight: "auto",
};

/**
 * Allows users to add words to a project, add senses to an existing word,
 * and add the current semantic domain to a sense
 */
export class DataEntryComponent extends React.Component<
  DataEntryProps & LocalizeContextProps,
  DataEntryState
> {
  constructor(props: DataEntryProps & LocalizeContextProps) {
    super(props);
    this.state = {
      displaySemanticDomain: true,
    };
  }

  renderExistingDataTable() {
    return (
      <React.Fragment >
        <ExistingDataTable 
        domain={this.props.domain} 
        typeDrawer={false} />
      </React.Fragment>
    );
  }

  render() {
    let semanticDomain: SemanticDomain = {
      name: this.props.domain.name,
      id: this.props.domain.id,
    };

    return (
      <React.Fragment>
        <AppBarComponent />

        <Grid container justify="center" spacing={3} wrap={"nowrap"}>
          <Grid item>
            <Paper style={paperStyle}>
              <DataEntryHeader domain={this.props.domain} />
              <Divider />
              <DataEntryTable
                domain={this.props.domain}
                semanticDomain={semanticDomain}
                displaySemanticDomainView={(
                  isGettingSemanticdomain: boolean
                ) => {
                  this.setState({
                    displaySemanticDomain: isGettingSemanticdomain,
                  });
                }}
              />
            </Paper>
          </Grid>
          {this.renderExistingDataTable()}
          <Dialog fullScreen open={this.state.displaySemanticDomain}>
            <AppBarComponent />
            <TreeViewComponent
              returnControlToCaller={() =>
                this.setState({
                  displaySemanticDomain: false,
                })
              }
            />
          </Dialog>
        </Grid>
      </React.Fragment>
    );
  }
}

export default withLocalize(DataEntryComponent);
