import MaterialTable from "@material-table/core";
import { Typography } from "@mui/material";
import { useSnackbar } from "notistack";
import React, { ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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

// Remove the duplicates from an array
function removeDuplicates<T>(array: T[]): T[] {
  return [...new Set(array)];
}

function getPageSizeOptions(max?: number): number[] {
  if (max === undefined) {
    return ROWS_PER_PAGE;
  }
  return removeDuplicates([
    Math.min(max, ROWS_PER_PAGE[0]),
    Math.min(max, ROWS_PER_PAGE[1]),
    Math.min(max, ROWS_PER_PAGE[2]),
  ]);
}

// Constants
const ROWS_PER_PAGE = [10, 50, 250];
const tableRef: React.RefObject<any> = React.createRef();

export default function ReviewEntriesTable(
  props: ReviewEntriesTableProps
): ReactElement {
  const words = useSelector(
    (state: StoreState) => state.reviewEntriesState.words
  );
  const showDefinitions = useSelector(
    (state: StoreState) => state.currentProjectState.project.definitionsEnabled
  );
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [maxRows, setMaxRows] = useState(0);
  const [pageSizeOptions, setPageSizeOptions] = useState(
    getPageSizeOptions(words.length)
  );

  const updateMaxRows = () => {
    if (tableRef.current) {
      const tableRows = tableRef.current.state.data.length;
      if (tableRows !== maxRows) {
        setMaxRows(tableRows);
      }
    }
  };

  useEffect(() => {
    setPageSizeOptions(getPageSizeOptions(maxRows));
  }, [maxRows, setPageSizeOptions]);

  return (
    <MaterialTable<any>
      tableRef={tableRef}
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
      onFilterChange={updateMaxRows}
      editable={{
        onRowUpdate: (newData: ReviewEntriesWord, oldData: ReviewEntriesWord) =>
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
      options={{
        draggable: false,
        filtering: true,
        pageSize:
          words.length > 0
            ? Math.min(words.length, ROWS_PER_PAGE[0])
            : ROWS_PER_PAGE[0],
        pageSizeOptions: pageSizeOptions,
      }}
    />
  );
}
