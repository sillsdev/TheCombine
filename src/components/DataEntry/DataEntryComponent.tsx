import React from "react";
import { Paper, Container, Divider, Dialog } from "@material-ui/core";
import theme from "../../types/theme";
import { CurrentTab } from "../../types/currentTab";

import { withLocalize, LocalizeContextProps } from "react-localize-redux";
import DomainTree from "../TreeView/SemanticDomain";
import TreeViewComponent from "../TreeView";
import DataEntryHeader from "./DataEntryHeader/DataEntryHeader";
import DataEntryTable from "./DataEntryTable/DataEntryTable";
import { SemanticDomain } from "../../types/word";
import AppBarComponent from "../AppBar/AppBarComponent";

interface DataEntryProps {
  domain: DomainTree;
}

interface DataEntryState {
  displaySemanticDomain: boolean;
}

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

  render() {
    let semanticDomain: SemanticDomain = {
      name: this.props.domain.name,
      id: this.props.domain.id,
    };

    return (
      <React.Fragment>
        <AppBarComponent currentTab={CurrentTab.DataEntry} />
        <Container>
          <Paper
            style={{
              padding: theme.spacing(2),
              maxWidth: 800,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            <DataEntryHeader domain={this.props.domain} />
            <Divider />
            <DataEntryTable
              domain={this.props.domain}
              semanticDomain={semanticDomain}
              displaySemanticDomainView={(isGettingSemanticdomain: boolean) => {
                this.setState({
                  displaySemanticDomain: isGettingSemanticdomain,
                });
              }}
            />
          </Paper>

          <Dialog fullScreen open={this.state.displaySemanticDomain}>
            <AppBarComponent currentTab={CurrentTab.DataEntry} />
            <TreeViewComponent
              returnControlToCaller={() =>
                this.setState({
                  displaySemanticDomain: false,
                })
              }
            />
          </Dialog>
        </Container>
      </React.Fragment>
    );
  }
}

export default withLocalize(DataEntryComponent);
