import React from "react";
import { Grid, Chip, Dialog, IconButton } from "@material-ui/core";
import Add from "@material-ui/icons/Add";

import { ViewFinalWord, ViewFinalSense } from "../ViewFinalComponent";
import { SemanticDomain } from "../../../../types/word";
import TreeView from "../../../../components/TreeView";
import AlignedList, { SPACER } from "./AlignedList";
import { Translate } from "react-localize-redux";

interface DomainCellProps {
  rowData: ViewFinalWord;
  selectedDomain: SemanticDomain;
  editDomains?: (senseId: string, newDomains: SemanticDomain[]) => void;
}

interface DomainCellState {
  addingDomains: boolean;
  senseToChange: ViewFinalSense;
}

export default class DomainCell extends React.Component<
  DomainCellProps,
  DomainCellState
> {
  constructor(props: DomainCellProps) {
    super(props);
    // This data is set before any actions which depend on it, meaning that this line is a compiler-appeaser
    this.state = { addingDomains: false, senseToChange: {} as ViewFinalSense };

    this.prepAddDomain = this.prepAddDomain.bind(this);
    this.addDomain = this.addDomain.bind(this);
    this.deleteDomain = this.deleteDomain.bind(this);
  }

  private prepAddDomain(sense: ViewFinalSense) {
    this.setState({
      addingDomains: true,
      senseToChange: sense
    });
  }

  private addDomain() {
    this.setState({
      addingDomains: false
    });
    if (this.props.editDomains)
      this.props.editDomains(this.state.senseToChange.senseId, [
        ...this.state.senseToChange.domains,
        {
          name: this.props.selectedDomain.name,
          id: this.props.selectedDomain.id
        }
      ]);
  }

  private deleteDomain(toDelete: SemanticDomain, sense: ViewFinalSense) {
    if (this.props.editDomains)
      this.props.editDomains(
        sense.senseId,
        sense.domains.filter(domain => domain.id !== toDelete.id)
      );
  }

  render() {
    return (
      <React.Fragment>
        <AlignedList
          contents={this.props.rowData.senses.map((sense, index) => (
            <Grid container direction="row" spacing={2}>
              {sense.domains.length > 0 ? (
                sense.domains.map(domain => (
                  <Grid item xs key={`domainFor${sense.senseId}-${index}`}>
                    <Chip
                      color={sense.deleted ? "default" : "primary"}
                      label={`${domain.id}: ${domain.name}`}
                      onDelete={
                        this.props.editDomains && !sense.deleted
                          ? () => this.deleteDomain(domain, sense)
                          : undefined
                      }
                    />
                  </Grid>
                ))
              ) : (
                <Grid item xs key={`noDomain${sense.senseId}`}>
                  <Chip
                    label={<Translate id="viewFinal.nodomain" />}
                    color="secondary"
                  />
                </Grid>
              )}
              {this.props.editDomains && !sense.deleted && (
                <IconButton
                  key={`buttonFor${sense.senseId}`}
                  onClick={() => this.prepAddDomain(sense)}
                >
                  <Add />
                </IconButton>
              )}
            </Grid>
          ))}
          bottomCell={this.props.editDomains ? SPACER : null}
        />
        <Dialog fullScreen open={this.state.addingDomains}>
          <TreeView returnControlToCaller={() => this.addDomain()} />
        </Dialog>
      </React.Fragment>
    );
  }
}
