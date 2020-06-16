import React from "react";
import { Paper, Container, Divider, Dialog } from "@material-ui/core";
import theme from "../../types/theme";

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
  questionsVisible: boolean;
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
      questionsVisible: false,
    };
  }

  render() {
    let semanticDomain: SemanticDomain = {
      name: this.props.domain.name,
      id: this.props.domain.id,
    };

    return (
      <React.Fragment>
        <AppBarComponent />
        <Container>
          <Paper
            style={{
              padding: theme.spacing(2),
              maxWidth: 800,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            <DataEntryHeader
              domain={this.props.domain}
              questionsVisible={this.state.questionsVisible}
              setQuestionVisibility={(visibility: boolean) =>
                this.setState({ questionsVisible: visibility })
              }
            />
            <Divider />
            <DataEntryTable
              domain={this.props.domain}
              semanticDomain={semanticDomain}
              displaySemanticDomainView={(isGettingSemanticdomain: boolean) => {
                this.setState({
                  displaySemanticDomain: isGettingSemanticdomain,
                });
              }}
              hideQuestions={() => {
                this.setState({ questionsVisible: false });
              }}
            />
          </Paper>

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
        </Container>
      </React.Fragment>
    );
  }
}

export default withLocalize(DataEntryComponent);
