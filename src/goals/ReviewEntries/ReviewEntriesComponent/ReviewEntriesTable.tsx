import MaterialTable from "@material-table/core";
import { Typography } from "@material-ui/core";
import { ReactElement } from "react";
import { Translate } from "react-localize-redux";
import { useSelector } from "react-redux";

import columns, {
  ColumnTitle,
} from "goals/ReviewEntries/ReviewEntriesComponent/CellColumns";
import { ReviewEntriesWord } from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";
import tableIcons from "goals/ReviewEntries/ReviewEntriesComponent/icons";
import { StoreState } from "types";

interface ReviewEntriesTableProps {
  onRowUpdate: (
    newData: ReviewEntriesWord,
    oldData: ReviewEntriesWord
  ) => Promise<void>;
}

// Remove the duplicates from an array; sugar syntax, as the place it's used
// is already hideous enough without adding more
function removeDuplicates<T>(array: T[]): T[] {
  return [...new Set(array)];
}

// Constants
const ROWS_PER_PAGE = [10, 100, 250];

export default function ReviewEntriesTable(
  props: ReviewEntriesTableProps
): ReactElement {
  const words = useSelector(
    (state: StoreState) => state.reviewEntriesState.words
  );
  const showDefinitions = useSelector(
    (state: StoreState) => state.currentProjectState.project.definitionsEnabled
  );

  return (
    <Translate>
      {({ translate }): ReactElement => (
        <MaterialTable<any>
          icons={tableIcons}
          title={
            <Typography component="h1" variant="h4">
              {translate("reviewEntries.title")}
            </Typography>
          }
          columns={
            showDefinitions
              ? columns
              : columns.filter((c) => c.field !== ColumnTitle.Definitions)
          }
          data={words}
          editable={{
            onRowUpdate: (
              newData: ReviewEntriesWord,
              oldData: ReviewEntriesWord
            ) =>
              new Promise(async (resolve, reject) => {
                await props
                  .onRowUpdate(newData, oldData)
                  .then(resolve)
                  .catch((reason) => {
                    alert(translate(reason));
                    reject(reason);
                  });
              }),
          }}
          options={{
            draggable: false,
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
      )}
    </Translate>
  );
}
