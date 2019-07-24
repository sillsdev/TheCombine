import React from "react";
import { Grid, Chip, Dialog, IconButton } from "@material-ui/core";
import Add from "@material-ui/icons/Add";

import { ViewFinalWord } from "../ViewFinalComponent";
import { SemanticDomain } from "../../../../types/word";
import TreeView from "../../../../components/TreeView";
import AlignedList from "./AlignedList";

interface DomainCellProps {
  rowData: ViewFinalWord;
  editable: boolean;

  selectedDomain: SemanticDomain;
  addDomain: (id: string, senseId: string, newDomain: SemanticDomain) => void;
  deleteDomain: (
    id: string,
    senseId: string,
    delDomain: SemanticDomain
  ) => void;
}

interface DomainCellState {
  addingDomains: boolean;
  senseToChange: string;
}

export default class DomainCell extends React.Component<
  DomainCellProps,
  DomainCellState
> {
  constructor(props: DomainCellProps) {
    super(props);
    // This data is set before any actions which depend on it, meaning that this line is a compiler-appeaser
    this.state = { addingDomains: false, senseToChange: "" };

    this.prepAddDomain = this.prepAddDomain.bind(this);
    this.addDomain = this.addDomain.bind(this);
    this.deleteDomain = this.deleteDomain.bind(this);
  }

  private prepAddDomain(senseId: string) {
    this.setState({
      addingDomains: true,
      senseToChange: senseId
    });
  }

  private addDomain() {
    this.setState({
      addingDomains: false
    });
    this.props.addDomain(this.props.rowData.id, this.state.senseToChange, {
      name: this.props.selectedDomain.name,
      id: this.props.selectedDomain.id
    });
  }

  private deleteDomain(toDelete: SemanticDomain, senseId: string) {
    this.props.deleteDomain(this.props.rowData.id, senseId, toDelete);
  }

  render() {
    return (
      <React.Fragment>
        <AlignedList
          contents={this.props.rowData.senses.map((value, index) => (
            <Grid container direction="row" spacing={2}>
              {value.domains.length > 0 &&
                value.domains.map(domain => (
                  <Grid item xs key={`domain${index}`}>
                    <Chip
                      label={`${domain.id}: ${domain.name}`}
                      onDelete={
                        this.props.editable
                          ? () => this.deleteDomain(domain, value.senseId)
                          : undefined
                      }
                    />
                  </Grid>
                ))}
              {this.props.editable && (
                <IconButton
                  key={`buttonFor${value.senseId}`}
                  onClick={() => this.prepAddDomain(value.senseId)}
                >
                  <Add />
                </IconButton>
              )}
            </Grid>
          ))}
          bottomCell={null}
        />
        <Dialog fullScreen open={this.state.addingDomains}>
          <TreeView returnControlToCaller={() => this.addDomain()} />
        </Dialog>
      </React.Fragment>
    );
  }
}
