import React from "react";
import {
  LocalizeContextProps,
  Translate,
  withLocalize
} from "react-localize-redux";
import {
  Container,
  Grid,
  Chip,
  Dialog,
  IconButton,
  GridList,
  GridListTile
} from "@material-ui/core";
import Add from "@material-ui/icons/Add";

import { ViewFinalWord } from "../ViewFinalComponent";
import { SemanticDomain } from "../../../../types/word";
import TreeView from "../../../../components/TreeView";
import AlignedList from "./AlignedList";

interface DomainCellProps {
  rowData: ViewFinalWord;

  selectedDomain: SemanticDomain;
  addDomain: (domain: SemanticDomain, id: string, sense: number) => void;
  deleteDomain: (domain: SemanticDomain, id: string, sense: number) => void;
}

interface DomainCellState {
  addingDomains: boolean;
  senseToChange: number;
}

class DomainCell extends React.Component<
  DomainCellProps & LocalizeContextProps,
  DomainCellState
> {
  constructor(props: DomainCellProps & LocalizeContextProps) {
    super(props);
    // This data is set before any actions which depend on it, meaning that this line is a compiler-appeaser
    this.state = { addingDomains: false, senseToChange: 0 };

    this.addDomain = this.addDomain.bind(this);
    this.deleteDomain = this.deleteDomain.bind(this);
  }

  addDomain() {
    this.props.addDomain(
      this.props.selectedDomain,
      this.props.rowData.id,
      this.state.senseToChange
    );
    this.setState({
      addingDomains: false
    });
  }

  deleteDomain(toDelete: SemanticDomain) {
    this.props.deleteDomain(
      toDelete,
      this.props.rowData.id,
      this.state.senseToChange
    );
  }

  render() {
    return (
      <AlignedList
        contents={this.props.rowData.senses.map((value, senseIndex) => (
          <Grid container direction="row" spacing={2}>
            {value.domains.length > 0 &&
              value.domains.map(domain => (
                <Grid item xs>
                  <Chip
                    label={`${domain.number}: ${domain.name}`}
                    onDelete={() => this.deleteDomain(domain)}
                  />
                </Grid>
              ))}
            <IconButton
              onClick={() =>
                this.setState({
                  addingDomains: true,
                  senseToChange: senseIndex
                })
              }
            >
              <Add />
              <Dialog fullScreen open={this.state.addingDomains}>
                <TreeView returnControlToCaller={this.addDomain} />
              </Dialog>
            </IconButton>
          </Grid>
        ))}
        bottomCell={null}
      />
      // <Grid item xs>
      //   <Chip label={<Add />} style={{ opacity: 0.01 }} />
      // </Grid>
      //</Grid>
      //</React.Fragment>
    );
  }
}

// Create
export default withLocalize(DomainCell);
