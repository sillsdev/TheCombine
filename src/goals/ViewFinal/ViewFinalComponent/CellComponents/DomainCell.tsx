import React from "react";
import { Grid, Chip, Dialog, IconButton } from "@material-ui/core";
import Add from "@material-ui/icons/Add";

import { ViewFinalWord } from "../ViewFinalComponent";
import { SemanticDomain } from "../../../../types/word";
import TreeView from "../../../../components/TreeView";
import AlignedList from "./AlignedList";

interface DomainCellProps {
  rowData: ViewFinalWord;

  selectedDomain: SemanticDomain;
  addDomain: (
    id: string,
    senseIndex: number,
    newDomain: SemanticDomain
  ) => void;
  deleteDomain: (
    id: string,
    senseIndex: number,
    delDomain: SemanticDomain
  ) => void;
}

interface DomainCellState {
  addingDomains: boolean;
  senseToChange: number;
}

export default class DomainCell extends React.Component<
  DomainCellProps,
  DomainCellState
> {
  constructor(props: DomainCellProps) {
    super(props);
    // This data is set before any actions which depend on it, meaning that this line is a compiler-appeaser
    this.state = { addingDomains: false, senseToChange: 0 };

    this.addDomain = this.addDomain.bind(this);
    this.deleteDomain = this.deleteDomain.bind(this);
  }

  addDomain() {
    this.props.addDomain(
      this.props.rowData.id,
      this.state.senseToChange,
      this.props.selectedDomain
    );
    this.setState({
      addingDomains: false
    });
  }

  deleteDomain(toDelete: SemanticDomain) {
    this.props.deleteDomain(
      this.props.rowData.id,
      this.state.senseToChange,
      toDelete
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
