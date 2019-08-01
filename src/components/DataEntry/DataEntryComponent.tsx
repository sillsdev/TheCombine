import React from "react";
import { Paper, Container, Divider, Dialog } from "@material-ui/core";
import theme from "../../types/theme";

import { withLocalize, LocalizeContextProps } from "react-localize-redux";
import DomainTree from "../TreeView/SemanticDomain";
import TreeViewComponent from "../TreeView";
import DataEntryHeader from "./DataEntryHeader/DataEntryHeader";
import DataEntryTable from "./DataEntryTable/DataEntryTable";
import { SemanticDomain } from "../../types/word";

interface DataEntryProps {
  domain: DomainTree;
}

interface DataEntryState {
  displaySemanticDomain: boolean;
}

export class DataEntryComponent extends React.Component<
  DataEntryProps & LocalizeContextProps,
  DataEntryState
> {
  constructor(props: DataEntryProps & LocalizeContextProps) {
    super(props);
    this.state = {
      displaySemanticDomain: true
    };
  }

  render() {
    let semanticDomain: SemanticDomain = {
      name: this.props.domain.name,
      id: this.props.domain.id
    };

    return (
      <Container>
        <Paper
          style={{
            padding: theme.spacing(2),
            maxWidth: 800,
            marginLeft: "auto",
            marginRight: "auto"
          }}
        >
          <DataEntryHeader
            domain={this.props.domain}
            displaySemanticDomainView={(isGettingSemanticdomain: boolean) =>
              this.setState({ displaySemanticDomain: isGettingSemanticdomain })
            }
          />
          <Divider />
          <DataEntryTable
            domain={this.props.domain}
            semanticDomain={semanticDomain}
          />
        </Paper>

        <Dialog fullScreen open={this.state.displaySemanticDomain}>
          <TreeViewComponent
            returnControlToCaller={() =>
              this.setState({
                displaySemanticDomain: false
              })
            }
          />
        </Dialog>
      </Container>
    );
  }
}

export default withLocalize(DataEntryComponent);
