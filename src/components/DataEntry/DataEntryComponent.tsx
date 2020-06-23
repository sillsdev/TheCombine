import React from "react";
import { Paper, Divider, Dialog, Grid, Drawer, Hidden } from "@material-ui/core";
import theme from "../../types/theme";

import { withLocalize, LocalizeContextProps } from "react-localize-redux";
import { SemanticDomain } from "../../types/word";
import DomainTree from "../TreeView/SemanticDomain";
import TreeViewComponent from "../TreeView";
import DataEntryHeader from "./DataEntryHeader/DataEntryHeader";
import DataEntryTable from "./DataEntryTable/DataEntryTable";
import AppBarComponent from "../AppBar/AppBarComponent";
import { ExistingDataTable } from "./ExistingDataTable/ExistingDataTable";
import { updateAllWords } from "../../goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesActions";

interface DataEntryProps {
  domain: DomainTree;
}

interface DataEntryState {
  displaySemanticDomain: boolean;
  reducedSize: boolean;
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
      reducedSize: (window.innerWidth * 7) / 10 < window.innerHeight,
    };
  }

  handleWindowSizeChange = () => {
    this.setState({
      reducedSize: (window.innerWidth * 7) / 10 < window.innerHeight,
    });
  };

  componentDidMount() {
    window.addEventListener("resize", this.handleWindowSizeChange);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleWindowSizeChange);
  }

  renderExistingDataTable() {
    return (
      <React.Fragment >
        <ExistingDataTable domain={this.props.domain} />
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

        <Grid container justify="center" spacing={3} direction={"row"}>
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
          <Hidden >
          {this.renderExistingDataTable()}
          </Hidden >
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
