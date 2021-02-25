import { Chip, Dialog, Grid, IconButton } from "@material-ui/core";
import { Add } from "@material-ui/icons";
import React, { useState } from "react";
import { Translate } from "react-localize-redux";
import { useSelector } from "react-redux";

import TreeView from "components/TreeView";
import AlignedList, {
  SPACER,
} from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/AlignedList";
import {
  ReviewEntriesSense,
  ReviewEntriesWord,
} from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";
import { StoreState } from "types";
import { themeColors } from "types/theme";
import { SemanticDomain } from "types/word";

interface DomainCellProps {
  rowData: ReviewEntriesWord;
  sortingByDomains: boolean;
  editDomains?: (senseId: string, newDomains: SemanticDomain[]) => void;
}

export default function DomainCell(props: DomainCellProps) {
  const [addingDomains, setAddingDomains] = useState<boolean>(false);
  const [senseToChange, setSenseToChange] = useState<
    ReviewEntriesSense | undefined
  >();
  const selectedDomain = useSelector(
    (state: StoreState) => state.treeViewState?.currentDomain
  );

  function prepAddDomain(sense: ReviewEntriesSense) {
    setAddingDomains(true);
    setSenseToChange(sense);
  }

  function addDomain() {
    setAddingDomains(false);
    if (props.editDomains && senseToChange) {
      if (!selectedDomain)
        throw new Error(
          "Cannot add domain without the selectedDomain property."
        );
      props.editDomains(senseToChange.senseId, [
        ...senseToChange.domains,
        {
          name: selectedDomain.name,
          id: selectedDomain.id,
        },
      ]);
    }
  }

  function deleteDomain(toDelete: SemanticDomain, sense: ReviewEntriesSense) {
    if (props.editDomains)
      props.editDomains(
        sense.senseId,
        sense.domains.filter((domain) => domain.id !== toDelete.id)
      );
  }

  function getChipStyle(senseIndex: number, domainIndex: number) {
    return props.sortingByDomains && senseIndex === 0 && domainIndex === 0
      ? { backgroundColor: themeColors.highlight }
      : {};
  }

  return (
    <React.Fragment>
      <AlignedList
        key={`domainCell:${props.rowData.id}`}
        listId={`domains${props.rowData.id}`}
        contents={props.rowData.senses.map((sense, senseIndex) => (
          <Grid container direction="row" spacing={2}>
            {sense.domains.length > 0 ? (
              sense.domains.map((domain, domainIndex) => (
                <Grid
                  item
                  key={`${domain.name}::${props.rowData.id}:${sense.senseId}`}
                >
                  <Chip
                    color={sense.deleted ? "secondary" : "default"}
                    style={getChipStyle(senseIndex, domainIndex)}
                    label={`${domain.id}: ${domain.name}`}
                    onDelete={
                      props.editDomains && !sense.deleted
                        ? () => deleteDomain(domain, sense)
                        : undefined
                    }
                  />
                </Grid>
              ))
            ) : (
              <Grid item xs key={`noDomain${sense.senseId}`}>
                <Chip
                  label={<Translate id="reviewEntries.noDomain" />}
                  color={props.sortingByDomains ? "default" : "secondary"}
                  style={getChipStyle(senseIndex, 0)}
                />
              </Grid>
            )}
            {props.editDomains && !sense.deleted && (
              <IconButton
                key={`buttonFor${sense.senseId}`}
                onClick={() => prepAddDomain(sense)}
              >
                <Add />
              </IconButton>
            )}
          </Grid>
        ))}
        bottomCell={props.editDomains ? SPACER : null}
      />
      <Dialog fullScreen open={addingDomains}>
        <TreeView returnControlToCaller={addDomain} />
      </Dialog>
    </React.Fragment>
  );
}
