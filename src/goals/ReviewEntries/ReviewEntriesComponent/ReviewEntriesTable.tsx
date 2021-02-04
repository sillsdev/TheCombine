import MaterialTable from "@material-table/core";
import React from "react";
import { Translate } from "react-localize-redux";
import { useSelector } from "react-redux";

import columns from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/CellColumns";
import tableIcons from "goals/ReviewEntries/ReviewEntriesComponent/icons";
import { ReviewEntriesWord } from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";
import { StoreState } from "types";

interface ReviewEntriesTableProps {
  onRowUpdate: (
    newData: ReviewEntriesWord,
    oldData: ReviewEntriesWord
  ) => Promise<void>;
}

// Remove the duplicates from an array; sugar syntax, as the place it's used is already hideous enough without adding more
function removeDuplicates(array: any[]) {
  return [...new Set(array)];
}

// Constants
const ROWS_PER_PAGE: number[] = [10, 100, 1000];

export default function ReviewEntriesTable(props: ReviewEntriesTableProps) {
  const words = useSelector(
    (state: StoreState) => state.reviewEntriesState.words
  );

  return (
    <MaterialTable<any>
      icons={tableIcons}
      title={<Translate id={"reviewEntries.title"} />}
      columns={columns}
      data={words}
      editable={{
        onRowUpdate: props.onRowUpdate,
      }}
      options={{
        filtering: true,
        pageSize:
          words.length > 0
            ? Math.min(words.length, ROWS_PER_PAGE[0])
            : ROWS_PER_PAGE[0],
        pageSizeOptions: removeDuplicates([
          Math.min(words.length, ROWS_PER_PAGE[0]),
          Math.min(words.length, ROWS_PER_PAGE[1]),
          Math.min(words.length, ROWS_PER_PAGE[2]),
        ]),
      }}
    />
  );
}
