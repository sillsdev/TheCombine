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
  const [maxRows, setMaxRows] = useState(words.length);
  const [pageState, setPageState] = useState(getPageState(words.length));

  const updateMaxRows = () => {
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
      var i = 0;
      while (i < options.length - 1 && options[i] < prevState.pageSize) {
        i++;
      }
      return { pageSize: options[i], pageSizeOptions: options };
    });
  }, [maxRows, setPageState]);

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
      options={{ draggable: false, filtering: true, ...pageState }}
    />
  );
}
