import { createSelector } from "@reduxjs/toolkit";
import {
  createMRTColumnHelper,
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_Row,
} from "material-react-table";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import { DeleteCell } from "goals/ReviewEntries/ReviewEntriesTable/CellComponents";
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

export default function ReviewEntriesTable(
  props: ReviewEntriesTableProps
): ReactElement {
  // https://redux.js.org/usage/deriving-data-selectors#optimizing-selectors-with-memoization
  const wordsSelector = createSelector(
    [(state: StoreState) => state.reviewEntriesState.words],
    (words) => words.map((w) => new ReviewEntriesWord(w))
  );
  const allWords = useSelector(wordsSelector);
  /*const showDefinitions = useSelector(
    (state: StoreState) => state.currentProjectState.project.definitionsEnabled
  );
  const showGrammaticalInfo = useSelector(
    (state: StoreState) =>
      state.currentProjectState.project.grammaticalInfoEnabled
  );*/

  const { t } = useTranslation();

  const columnHelper = createMRTColumnHelper<ReviewEntriesWord>();

  type CellProps = { row: MRT_Row<ReviewEntriesWord> };

  const columns = [
    columnHelper.accessor("vernacular", {
      header: t("reviewEntries.columns.vernacular"),
    }),
    columnHelper.display({
      header: t("reviewEntries.columns.delete"),
      Cell: ({ row }: CellProps) => <DeleteCell rowData={row.original} />,
    }),
  ];

  const table = useMaterialReactTable({
    columns,
    data: allWords,
  });

  return <MaterialReactTable table={table} />;
}
