import React from "react";
import { Grid, Chip, Dialog, IconButton } from "@material-ui/core";
import Add from "@material-ui/icons/Add";

import {
  ReviewEntriesWord,
  ReviewEntriesSense
} from "../ReviewEntriesComponent";
import { SemanticDomain } from "../../../../types/word";
import TreeView from "../../../../components/TreeView";
import AlignedList, { SPACER } from "./AlignedList";
import { Translate } from "react-localize-redux";
import { highlight } from "../../../../types/theme";

interface DomainCellProps {
  rowData: ReviewEntriesWord;
  selectedDomain: SemanticDomain;
  sortingByDomains: boolean;
  editDomains?: (senseId: string, newDomains: SemanticDomain[]) => void;
}

interface DomainCellState {
  addingDomains: boolean;
  senseToChange: ReviewEntriesSense;
}

export default class DomainCell extends React.Component<
  DomainCellProps,
  DomainCellState
> {
  constructor(props: DomainCellProps) {
    super(props);
    // This data is set before any actions which depend on it, meaning that this line is a compiler-appeaser
    this.state = {
      addingDomains: false,
      senseToChange: {} as ReviewEntriesSense
    };

    this.prepAddDomain = this.prepAddDomain.bind(this);
    this.addDomain = this.addDomain.bind(this);
    this.deleteDomain = this.deleteDomain.bind(this);
  }

  private prepAddDomain(sense: ReviewEntriesSense) {
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

  private deleteDomain(toDelete: SemanticDomain, sense: ReviewEntriesSense) {
    if (this.props.editDomains)
      this.props.editDomains(
        sense.senseId,
        sense.domains.filter(domain => domain.id !== toDelete.id)
      );
  }

  private getChipStyle(senseIndex: number, domainIndex: number) {
    return this.props.sortingByDomains && senseIndex === 0 && domainIndex === 0
      ? { backgroundColor: highlight }
      : {};
  }

  render() {
    return (
      <React.Fragment>
        <AlignedList
          contents={this.props.rowData.senses.map((sense, senseIndex) => (
            <Grid container direction="row" spacing={2}>
              {sense.domains.length > 0 ? (
                sense.domains.map((domain, domainIndex) => (
                  <Grid item key={`domainFor${sense.senseId}-${senseIndex}`}>
                    <Chip
                      color={sense.deleted ? "secondary" : "default"}
                      style={this.getChipStyle(senseIndex, domainIndex)}
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
                    label={<Translate id="reviewEntries.nodomain" />}
                    color={
                      this.props.sortingByDomains ? "default" : "secondary"
                    }
                    style={this.getChipStyle(senseIndex, 0)}
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
