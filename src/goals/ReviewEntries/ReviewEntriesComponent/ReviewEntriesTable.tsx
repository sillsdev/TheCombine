import MaterialTable from "@material-table/core";
import { Typography } from "@material-ui/core";
import React, { ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import PositionedSnackbar from "components/SnackBar/SnackBar";
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
  const [toastOpen, setToastOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const { t } = useTranslation();

  //Update the alert message and display it for 3 seconds
  function handleToastUpdate(message: string) {
    setToastMessage(message);
    setToastOpen(true);
    setTimeout(() => {
      setToastMessage("");
      setToastOpen(false);
    }, 3000);
    return;
  }

  function handleToastDisplay(bool: boolean) {
    if (bool)
      return (
        <PositionedSnackbar
          open={toastOpen}
          message={toastMessage}
          vertical={"top"}
          horizontal={"center"}
        />
      );
  }

  return (
    <React.Fragment>
      <MaterialTable<any>
        icons={tableIcons}
        title={
          <Typography component="h1" variant="h4">
            {t("reviewEntries.title")}
          </Typography>
        }
        columns={
          showDefinitions
            ? columns
            : columns.filter((c) => c.title !== ColumnTitle.Definitions)
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
                  handleToastUpdate(t(reason));
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
      {handleToastDisplay(toastOpen)}
    </React.Fragment>
  );
}
