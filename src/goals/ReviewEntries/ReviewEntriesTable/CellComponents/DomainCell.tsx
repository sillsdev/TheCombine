import { Add } from "@mui/icons-material";
import { Chip, Dialog, Grid, IconButton } from "@mui/material";
import { ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

import { SemanticDomain } from "api/models";
import Overlay from "components/Overlay";
import TreeView from "components/TreeView";
import AlignedList, {
  SPACER,
} from "goals/ReviewEntries/ReviewEntriesTable/CellComponents/AlignedList";
import {
  ColumnId,
  ReviewEntriesSense,
  ReviewEntriesWord,
} from "goals/ReviewEntries/ReviewEntriesTypes";
import { StoreState } from "types";
import { newSemanticDomainForMongoDB } from "types/semanticDomain";
import { themeColors } from "types/theme";

interface DomainCellProps {
  rowData: ReviewEntriesWord;
  editDomains?: (guid: string, newDomains: SemanticDomain[]) => void;
}

export default function DomainCell(props: DomainCellProps): ReactElement {
  const [addingDomains, setAddingDomains] = useState<boolean>(false);
  const [senseToChange, setSenseToChange] = useState<
    ReviewEntriesSense | undefined
  >();

  const sortingByThis = useSelector(
    (state: StoreState) => state.reviewEntriesState.sortBy === ColumnId.Domains
  );
  const selectedDomain = useSelector(
    (state: StoreState) => state.treeViewState.currentDomain
  );

  function prepAddDomain(sense: ReviewEntriesSense): void {
    setAddingDomains(true);
    setSenseToChange(sense);
  }

  function addDomain(): void {
    setAddingDomains(false);
    if (props.editDomains && senseToChange) {
      if (!selectedDomain) {
        throw new Error(
          "Cannot add domain without the selectedDomain property."
        );
      }
      if (selectedDomain.mongoId == "") {
        throw new Error("SelectedSemanticDomainTreeNode have no mongoId.");
      }
      if (senseToChange.domains.some((d) => d.id === selectedDomain.id)) {
        toast.error(
          t("reviewEntries.duplicateDomain", { val: selectedDomain.id })
        );
        return;
      }
      props.editDomains(senseToChange.guid, [
        ...senseToChange.domains,
        newSemanticDomainForMongoDB(selectedDomain),
      ]);
    }
  }

  function deleteDomain(
    toDelete: SemanticDomain,
    sense: ReviewEntriesSense
  ): void {
    if (props.editDomains) {
      props.editDomains(
        sense.guid,
        sense.domains.filter((domain) => domain.id !== toDelete.id)
      );
    }
  }

  function getChipStyle(
    senseIndex: number,
    domainIndex: number
  ): { backgroundColor?: string } {
    return sortingByThis && senseIndex === 0 && domainIndex === 0
      ? { backgroundColor: themeColors.highlight as string }
      : {};
  }
  const { t } = useTranslation();

  return (
    <>
      <AlignedList
        key={`domainCell:${props.rowData.id}`}
        listId={`domains${props.rowData.id}`}
        contents={props.rowData.senses.map((sense, senseIndex) => (
          <Overlay key={sense.guid} on={sense.deleted}>
            <Grid container direction="row" spacing={2}>
              {sense.domains.length > 0 ? (
                sense.domains.map((domain, domainIndex) => (
                  <Grid item key={`${domain.id}_${domain.name}`}>
                    <Chip
                      color={sense.deleted ? "secondary" : "default"}
                      style={getChipStyle(senseIndex, domainIndex)}
                      label={`${domain.id}: ${domain.name}`}
                      onDelete={
                        props.editDomains && !sense.deleted
                          ? () => deleteDomain(domain, sense)
                          : undefined
                      }
                      id={`sense-${sense.guid}-domain-${domainIndex}`}
                    />
                  </Grid>
                ))
              ) : (
                <Grid item xs>
                  <Chip
                    label={t("reviewEntries.noDomain")}
                    color={sortingByThis ? "default" : "secondary"}
                    style={getChipStyle(senseIndex, 0)}
                  />
                </Grid>
              )}
              {props.editDomains && !sense.deleted && (
                <IconButton
                  onClick={() => prepAddDomain(sense)}
                  id={`sense-${sense.guid}-domain-add`}
                  size="large"
                >
                  <Add />
                </IconButton>
              )}
            </Grid>
          </Overlay>
        ))}
        bottomCell={props.editDomains ? SPACER : undefined}
      />
      <Dialog fullScreen open={addingDomains}>
        <TreeView
          exit={() => setAddingDomains(false)}
          returnControlToCaller={addDomain}
        />
      </Dialog>
    </>
  );
}
