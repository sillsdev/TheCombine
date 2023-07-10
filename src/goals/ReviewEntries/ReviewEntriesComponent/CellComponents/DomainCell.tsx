import { Add } from "@mui/icons-material";
import { Chip, Dialog, Grid, IconButton } from "@mui/material";
import React, { ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import { SemanticDomain } from "api/models";
import { getCurrentUser } from "backend/localStorage";
import TreeView from "components/TreeView";
import AlignedList, {
  SPACER,
} from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/AlignedList";
import {
  ReviewEntriesSense,
  ReviewEntriesWord,
} from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";
import { StoreState } from "types";
import { newSemanticDomainForMongoDB } from "types/semanticDomain";
import { themeColors } from "types/theme";

interface DomainCellProps {
  rowData: ReviewEntriesWord;
  sortingByThis?: boolean;
  editDomains?: (guid: string, newDomains: SemanticDomain[]) => void;
}

export default function DomainCell(props: DomainCellProps): ReactElement {
  const [addingDomains, setAddingDomains] = useState<boolean>(false);
  const [senseToChange, setSenseToChange] = useState<
    ReviewEntriesSense | undefined
  >();
  const selectedDomain = useSelector(
    (state: StoreState) => state.treeViewState?.currentDomain
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
        throw new Error("SelectedSemanticDomainTreeNode have no mongoId");
      }
      props.editDomains(senseToChange.guid, [
        ...senseToChange.domains,
        (function () {
          const tempSemanticDomain = newSemanticDomainForMongoDB(
            selectedDomain.mongoId!,
            selectedDomain.guid,
            selectedDomain.name,
            selectedDomain.id
          );
          tempSemanticDomain.userId = getCurrentUser()?.id;
          tempSemanticDomain.created = new Date().toISOString();
          return tempSemanticDomain;
        })(),
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
    return props.sortingByThis && senseIndex === 0 && domainIndex === 0
      ? { backgroundColor: themeColors.highlight as string }
      : {};
  }
  const { t } = useTranslation();

  return (
    <React.Fragment>
      <AlignedList
        key={`domainCell:${props.rowData.id}`}
        listId={`domains${props.rowData.id}`}
        contents={props.rowData.senses.map((sense, senseIndex) => (
          <Grid container direction="row" spacing={2} key={senseIndex}>
            {sense.domains.length > 0 ? (
              sense.domains.map((domain, domainIndex) => (
                <Grid
                  item
                  key={`${domain.name}::${props.rowData.id}:${sense.guid}`}
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
                    id={`sense-${sense.guid}-domain-${domainIndex}`}
                  />
                </Grid>
              ))
            ) : (
              <Grid item xs key={`noDomain${sense.guid}`}>
                <Chip
                  label={t("reviewEntries.noDomain")}
                  color={props.sortingByThis ? "default" : "secondary"}
                  style={getChipStyle(senseIndex, 0)}
                />
              </Grid>
            )}
            {props.editDomains && !sense.deleted && (
              <IconButton
                key={`buttonFor${sense.guid}`}
                onClick={() => prepAddDomain(sense)}
                id={`sense-${sense.guid}-domain-add`}
                size="large"
              >
                <Add />
              </IconButton>
            )}
          </Grid>
        ))}
        bottomCell={props.editDomains ? SPACER : undefined}
      />
      <Dialog fullScreen open={addingDomains}>
        <TreeView
          exit={() => setAddingDomains(false)}
          returnControlToCaller={addDomain}
        />
      </Dialog>
    </React.Fragment>
  );
}
