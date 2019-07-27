import React from "react";
import { Paper, Container, Divider, Dialog } from "@material-ui/core";
import theme from "../../types/theme";

import {
  TranslateFunction,
  withLocalize,
  LocalizeContextProps
} from "react-localize-redux";
import DomainTree from "../TreeView/SemanticDomain";
import TreeViewComponent from "../TreeView";
import DataEntryHeader from "../DataEntry/DataEntryHeader/DataEntryHeader";
import SpellChecker from "../DataEntry/spellChecker";
import DataEntryTable from "./DataEntryTable/DataEntryTable";

interface DataEntryProps {
  domain: DomainTree;
  translate: TranslateFunction;
}

interface DataEntryState {
  gettingSemanticDomain: boolean;
}

export class DataEntryComponent extends React.Component<
  DataEntryProps & LocalizeContextProps,
  DataEntryState
> {
  constructor(props: DataEntryProps & LocalizeContextProps) {
    super(props);
    this.state = {
      gettingSemanticDomain: true
    };
  }

  render() {
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
            notifyOfGettingSemanticDomain={(isGettingSemanticdomain: boolean) =>
              this.setState({ gettingSemanticDomain: isGettingSemanticdomain })
            }
          />
          <Divider />
          <DataEntryTable
            domain={this.props.domain}
            spellChecker={new SpellChecker()}
            semanticDomain={this.props.domain}
          />
        </Paper>

        <Dialog fullScreen open={this.state.gettingSemanticDomain}>
          <TreeViewComponent
            returnControlToCaller={() =>
              this.setState({
                gettingSemanticDomain: false
              })
            }
          />
        </Dialog>
      </Container>
    );
  }
}

export default withLocalize(DataEntryComponent);
