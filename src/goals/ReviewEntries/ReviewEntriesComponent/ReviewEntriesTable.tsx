import MaterialTable from "material-table";
import React from "react";
import { Translate } from "react-localize-redux";

import columns from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/CellColumns";
import tableIcons from "goals/ReviewEntries/ReviewEntriesComponent/icons";
import { ReviewEntriesWord } from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";

interface ReviewEntriesTableProps {
  onRowUpdate: (
    newData: ReviewEntriesWord,
    oldData: ReviewEntriesWord
  ) => Promise<void>;
  words: ReviewEntriesWord[];
}

// Remove the duplicates from an array; sugar syntax, as the place it's used is already hideous enough without adding more
function removeDuplicates(array: any[]) {
  return [...new Set(array)];
}

// Constants
const ROWS_PER_PAGE: number[] = [10, 100, 1000];

export default function ReviewEntriesTable(props: ReviewEntriesTableProps) {
  return (
    <MaterialTable<any>
      icons={tableIcons}
      title={<Translate id={"reviewEntries.title"} />}
      columns={columns}
      data={props.words}
      editable={{
        onRowUpdate: props.onRowUpdate,
      }}
      options={{
        filtering: true,
        pageSize:
          props.words.length > 0
            ? Math.min(props.words.length, ROWS_PER_PAGE[0])
            : ROWS_PER_PAGE[0],
        pageSizeOptions: removeDuplicates([
          Math.min(props.words.length, ROWS_PER_PAGE[0]),
          Math.min(props.words.length, ROWS_PER_PAGE[1]),
          Math.min(props.words.length, ROWS_PER_PAGE[2]),
        ]),
      }}
    />
  );
}
