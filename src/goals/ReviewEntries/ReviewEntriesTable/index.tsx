import MaterialTable, { OrderByCollection } from "@material-table/core";
import { Typography } from "@mui/material";
import { createSelector } from "@reduxjs/toolkit";
import { enqueueSnackbar } from "notistack";
import React, { ReactElement, createRef, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import columns from "goals/ReviewEntries/ReviewEntriesTable/CellColumns";
import tableIcons from "goals/ReviewEntries/ReviewEntriesTable/icons";
import {
  ColumnId,
  ReviewEntriesWord,
} from "goals/ReviewEntries/ReviewEntriesTypes";
import { StoreState } from "types";

interface ReviewEntriesTableProps {
  onRowUpdate: (
    newData: ReviewEntriesWord,
    oldData?: ReviewEntriesWord
  ) => Promise<void>;
  onSort: (columnId?: ColumnId) => void;
}

interface PageState {
  pageSize: number;
  pageSizeOptions: number[];
}

// Remove the duplicates from an array
function removeDuplicates<T>(array: T[]): T[] {
  return [...new Set(array)];
}

function getPageSizeOptions(max: number): number[] {
  return removeDuplicates(ROWS_PER_PAGE.map((num) => Math.min(max, num)));
}

function getPageState(wordCount: number): PageState {
  const pageSizeOptions = getPageSizeOptions(wordCount);
  return { pageSize: pageSizeOptions[0], pageSizeOptions };
}

// Constants
const ROWS_PER_PAGE = [10, 50, 200];
const tableRef: React.RefObject<any> = createRef();

export default function ReviewEntriesTable(
  props: ReviewEntriesTableProps
): ReactElement {
  // https://redux.js.org/usage/deriving-data-selectors#optimizing-selectors-with-memoization
  const wordsSelector = createSelector(
    [(state: StoreState) => state.reviewEntriesState.words],
    (words) => words.map((w) => new ReviewEntriesWord(w))
  );
  const allWords = useSelector(wordsSelector);
  const showDefinitions = useSelector(
    (state: StoreState) => state.currentProjectState.project.definitionsEnabled
  );
  const showGrammaticalInfo = useSelector(
    (state: StoreState) =>
      state.currentProjectState.project.grammaticalInfoEnabled
  );
  const { t } = useTranslation();
  const [maxRows, setMaxRows] = useState(allWords.length);
  const [pageState, setPageState] = useState(getPageState(allWords.length));
  const [scrollToTop, setScrollToTop] = useState(false);

  const updateMaxRows = (): void => {
    if (tableRef.current) {
      const tableRows = tableRef.current.state.data.length;
      if (tableRows !== maxRows) {
        setMaxRows(tableRows);
      }
    }
  };

  useEffect(() => {
    setPageState((prevState) => {
      const options = getPageSizeOptions(maxRows);
      let i = 0;
      while (i < options.length - 1 && options[i] < prevState.pageSize) {
        i++;
      }
      return { pageSize: options[i], pageSizeOptions: options };
    });
  }, [maxRows]);

  useEffect(() => {
    // onRowsPerPageChange={() => window.scrollTo({ top: 0 })} doesn't work.
    // This useEffect on an intermediate state triggers scrolling at the right time.
    if (scrollToTop) {
      window.scrollTo({ behavior: "smooth", top: 0 });
      setScrollToTop(false);
    }
  }, [scrollToTop]);

  const activeColumns = columns.filter(
    (c) =>
      (showDefinitions || c.id !== ColumnId.Definitions) &&
      (showGrammaticalInfo || c.id !== ColumnId.PartOfSpeech)
  );

  const onOrderCollectionChange = (order: OrderByCollection[]): void => {
    if (!order.length) {
      props.onSort(undefined);
    } else {
      props.onSort(activeColumns[order[0].orderBy].id as ColumnId);
    }
  };

  const materialTableLocalization = {
    body: {
      editRow: {
        cancelTooltip: t("buttons.cancel"),
        saveTooltip: t("buttons.save"),
      },
      editTooltip: t("reviewEntries.materialTable.body.edit"),
      emptyDataSourceMessage: t(
        "reviewEntries.materialTable.body.emptyDataSourceMessage"
      ),
      filterRow: {
        filterTooltip: t("reviewEntries.materialTable.body.filter"),
      },
    },
    header: {
      actions: t("reviewEntries.materialTable.body.edit"),
    },
    pagination: {
      labelDisplayedRows: t(
        "reviewEntries.materialTable.pagination.labelDisplayedRows"
      ),
      labelRows: t("reviewEntries.materialTable.pagination.labelRows"),
      labelRowsPerPage: t(
        "reviewEntries.materialTable.pagination.labelRowsPerPage"
      ),
      firstAriaLabel: t("reviewEntries.materialTable.pagination.first"),
      firstTooltip: t("reviewEntries.materialTable.pagination.first"),
      lastAriaLabel: t("reviewEntries.materialTable.pagination.last"),
      lastTooltip: t("reviewEntries.materialTable.pagination.last"),
      nextAriaLabel: t("reviewEntries.materialTable.pagination.next"),
      nextTooltip: t("reviewEntries.materialTable.pagination.next"),
      previousAriaLabel: t("reviewEntries.materialTable.pagination.previous"),
      previousTooltip: t("reviewEntries.materialTable.pagination.previous"),
    },
    toolbar: {
      searchAriaLabel: t("reviewEntries.materialTable.toolbar.search"),
      searchPlaceholder: t("reviewEntries.materialTable.toolbar.search"),
      searchTooltip: t("reviewEntries.materialTable.toolbar.search"),
    },
  };

  return (
    <MaterialTable<ReviewEntriesWord>
      tableRef={tableRef}
      icons={tableIcons}
      title={
        <Typography component="h1" variant="h4">
          {t("reviewEntries.title")}
        </Typography>
      }
      columns={activeColumns}
      data={allWords}
      onFilterChange={updateMaxRows}
      onOrderCollectionChange={onOrderCollectionChange}
      onRowsPerPageChange={() => setScrollToTop(true)}
      editable={{
        onRowUpdate: (
          newData: ReviewEntriesWord,
          oldData?: ReviewEntriesWord
        ) =>
          new Promise(async (resolve, reject) => {
            await props
              .onRowUpdate(newData, oldData)
              .then(resolve)
              .catch((reason) => {
                enqueueSnackbar(t(reason));
                reject(reason);
              });
          }),
      }}
      options={{ draggable: false, filtering: true, ...pageState }}
      localization={materialTableLocalization}
    />
  );
}
