import React from "react";
import {
  Paper,
  Container,
  Grid,
  Divider,
  Button,
  Dialog
} from "@material-ui/core";
import theme from "../../types/theme";

import {
  Translate,
  TranslateFunction,
  withLocalize,
  LocalizeContextProps
} from "react-localize-redux";
import DomainTree from "../TreeView/SemanticDomain";
import TreeViewComponent from "../TreeView";
import DataEntryHeader from "./DataEntryHeader/DataEntryHeader";
import { DataEntryTable } from "./Table/DataEntryTable";
import SpellChecker from "./Table/spellChecker";

interface DataEntryProps {
  domain: DomainTree;
  translate: TranslateFunction;
}

interface DataEntryState {
  gettingSemanticDomain: boolean;
}

export class DataEntry extends React.Component<
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
            translate={this.props.translate}
            spellChecker={new SpellChecker()}
          />
        </Paper>

        {/** Tree modal */}
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

export default withLocalize(DataEntry);
