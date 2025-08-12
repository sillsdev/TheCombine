import {
  FiberManualRecord,
  Flag as FlagIcon,
  PlayArrow,
} from "@mui/icons-material";
import { Typography } from "@mui/material";
import { createSelector } from "@reduxjs/toolkit";
import {
  MaterialReactTable,
  type MRT_Localization,
  type MRT_PaginationState,
  type MRT_Row,
  type MRT_RowVirtualizer,
  type MRT_VisibilityState,
  createMRTColumnHelper,
  useMaterialReactTable,
} from "material-react-table";
import { type ReactElement, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { GramCatGroup, type GrammaticalInfo, type Word } from "api/models";
import { getAllSpeakers, getFrontierWords, getWord } from "backend";
import { topBarHeight } from "components/LandingPage/TopBar";
import {
  setReviewEntriesColumnOrder,
  setReviewEntriesColumnVisibility,
} from "components/Project/ProjectActions";
import { asyncUpdateEntry } from "goals/Redux/GoalActions";
import * as Cell from "goals/ReviewEntries/ReviewEntriesTable/Cells";
import * as ff from "goals/ReviewEntries/ReviewEntriesTable/filterFn";
import * as sf from "goals/ReviewEntries/ReviewEntriesTable/sortingFn";
import { useAppDispatch, useAppSelector } from "rootRedux/hooks";
import { type StoreState } from "rootRedux/types";
import { type Hash } from "types/hash";

/** Import `material-react-table` localization for given `lang`.
 * (See https://www.material-react-table.com/docs/guides/localization.) */
async function getLocalization(
  lang?: string
): Promise<MRT_Localization | undefined> {
  switch (lang) {
    case "ar":
      return (await import("material-react-table/locales/ar"))
        .MRT_Localization_AR;
    case "es":
      return (await import("material-react-table/locales/es"))
        .MRT_Localization_ES;
    case "fr":
      return (await import("material-react-table/locales/fr"))
        .MRT_Localization_FR;
    case "pt":
      return (await import("material-react-table/locales/pt"))
        .MRT_Localization_PT;
    case "zh":
      return (await import("material-react-table/locales/zh-Hans"))
        .MRT_Localization_ZH_HANS;
    default:
      return;
  }
}

// Constants for custom column/header sizing.
const BaselineColumnSize = 180;
const HeaderActionsWidth = 60; // Assumes initial state density "compact"
const IconColumnSize = 50; // Baseline for a column with a single icon as row content
const IconHeaderHeight = 22; // Height for a small icon as Header
const IconHeaderPaddingTop = "2px"; // Vertical offset for a small icon as Header
const IconHeaderWidth = 20; // Width for a small icon as Header
const SensesHeaderWidth = 15; // Width for # as Header

export enum ColumnId {
  Definitions = "definitions",
  Delete = "delete",
  Domains = "domains",
  Edit = "edit",
  Flag = "flag",
  Glosses = "glosses",
  Note = "note",
  PartOfSpeech = "partOfSpeech",
  Pronunciations = "pronunciations",
  Senses = "senses",
  Vernacular = "vernacular",
}

// Constants for pagination state.
const rowsPerPage = [10, 100];
const initPaginationState: MRT_PaginationState = {
  pageIndex: 0,
  pageSize: rowsPerPage[0],
};
interface RowsPerPageOption {
  label: string;
  value: number;
}

/** Table for reviewing all entries, built with `material-react-table`. */
export default function ReviewEntriesTable(props: {
  disableVirtualization?: boolean;
}): ReactElement {
  const dispatch = useAppDispatch();

  const columnOrder = useAppSelector(
    (state: StoreState) =>
      state.currentProjectState.reviewEntriesColumns.columnOrder
  );
  const columnVisibility: MRT_VisibilityState = useAppSelector(
    // Memoized selector that ensures correct column visibility.
    createSelector(
      [
        (state: StoreState) =>
          state.currentProjectState.reviewEntriesColumns.columnVisibility,
        (state: StoreState) =>
          state.currentProjectState.project.definitionsEnabled,
        (state: StoreState) =>
          state.currentProjectState.project.grammaticalInfoEnabled,
      ],
      (colVis, def, pos) => ({
        ...colVis,
        [ColumnId.Definitions]: (colVis[ColumnId.Definitions] ?? def) && def,
        [ColumnId.PartOfSpeech]: (colVis[ColumnId.PartOfSpeech] ?? pos) && pos,
      })
    )
  );
  const { definitionsEnabled, grammaticalInfoEnabled } = useAppSelector(
    (state: StoreState) => state.currentProjectState.project
  );
  const vernLang = useAppSelector(
    (state: StoreState) =>
      state.currentProjectState.project.vernacularWritingSystem.bcp47
  );

  const autoResetPageIndexRef = useRef(true);
  const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null);

  const [data, setData] = useState<Word[]>([]);
  const [enablePagination, setEnablePagination] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [localization, setLocalization] = useState<
    MRT_Localization | undefined
  >();
  const [pagination, setPagination] = useState(initPaginationState);
  const [speakers, setSpeakers] = useState<Hash<string>>({});

  const { i18n, t } = useTranslation();

  useEffect(() => {
    // https://tanstack.com/table/latest/docs/faq#how-do-i-stop-my-table-state-from-automatically-resetting-when-my-data-changes
    autoResetPageIndexRef.current = true;
  });

  useEffect(() => {
    getAllSpeakers().then((list) =>
      setSpeakers(
        Object.fromEntries(list.map((s) => [s.id, s.name.toLocaleLowerCase()]))
      )
    );
    getFrontierWords().then((frontier) => {
      setData(frontier);
      setEnablePagination(frontier.length > rowsPerPage[0]);
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    getLocalization(i18n.resolvedLanguage).then(setLocalization);
  }, [i18n.resolvedLanguage]);

  /** Removes word with given `id` from the state. */
  const deleteWord = (id: string): void => {
    setData((prev) => {
      // Prevent table from jumping back to first page
      autoResetPageIndexRef.current = false;
      return prev.filter((w) => w.id !== id);
    });
  };

  /** Adds the word update to the current Goal, then
   * replaces word (`.id === oldId`) in the state
   * with word (`.id === newId`) fetched from the backend. */
  const replaceWord = async (oldId: string, newId: string): Promise<void> => {
    await dispatch(asyncUpdateEntry(oldId, newId));
    const newWord = await getWord(newId);
    setData((prev) => {
      // Prevent table from jumping back to first page
      autoResetPageIndexRef.current = false;
      return prev.map((w) => (w.id === oldId ? newWord : w));
    });
  };

  /** Checks if there are any entries and, if so, scrolls to the top of the current page. */
  const scrollToTop = (): void => {
    const virtualizer = rowVirtualizerInstanceRef.current;
    if (virtualizer?.getTotalSize()) {
      virtualizer.scrollToIndex(0);
    }
  };

  const rowsPerPageOptions: RowsPerPageOption[] = rowsPerPage
    .filter((value, i) => i === 0 || value < data.length)
    .map((value) => ({ label: `${value}`, value }));
  if (enablePagination) {
    rowsPerPageOptions.push({
      label: t("reviewEntries.allEntriesPerPageOption"),
      value: data.length,
    });
  }

  const columnHelper = createMRTColumnHelper<Word>();

  type CellProps = { row: MRT_Row<Word> };

  const columns = [
    // Edit column
    columnHelper.display({
      Cell: ({ row }: CellProps) => (
        <Cell.Edit replace={replaceWord} word={row.original} />
      ),
      enableHiding: false,
      Header: "",
      header: t("reviewEntries.columns.edit"),
      id: ColumnId.Edit,
      size: IconColumnSize,
      visibleInShowHideMenu: false,
    }),

    // Vernacular column
    columnHelper.accessor("vernacular", {
      Cell: ({ row }: CellProps) => <Cell.Vernacular word={row.original} />,
      enableColumnOrdering: false,
      enableHiding: false,
      filterFn: ff.filterFnString,
      header: t("reviewEntries.columns.vernacular"),
      id: ColumnId.Vernacular,
      size: BaselineColumnSize - 40,
      sortingFn: sf.sortingFnVernacular(vernLang),
    }),

    // Senses column
    columnHelper.accessor((w) => w.senses.length, {
      enableFilterMatchHighlighting: false,
      filterFn: "equals",
      Header: <Typography>#</Typography>,
      header: t("reviewEntries.columns.sensesCount"),
      id: ColumnId.Senses,
      muiTableHeadCellProps: {
        sx: {
          "& .Mui-TableHeadCell-Content-Wrapper": {
            minWidth: SensesHeaderWidth,
            width: SensesHeaderWidth,
          },
        },
      },
      size: SensesHeaderWidth + HeaderActionsWidth,
    }),

    // Definitions column
    columnHelper.accessor((w) => w.senses.flatMap((s) => s.definitions), {
      Cell: ({ row }: CellProps) => <Cell.Definitions word={row.original} />,
      filterFn: ff.filterFnDefinitions,
      header: t("reviewEntries.columns.definitions"),
      id: ColumnId.Definitions,
      size: BaselineColumnSize + 20,
      sortingFn: sf.sortingFnDefinitions,
      visibleInShowHideMenu: definitionsEnabled,
    }),

    // Glosses column
    columnHelper.accessor((w) => w.senses.flatMap((s) => s.glosses), {
      Cell: ({ row }: CellProps) => <Cell.Glosses word={row.original} />,
      filterFn: ff.filterFnGlosses,
      header: t("reviewEntries.columns.glosses"),
      id: ColumnId.Glosses,
      sortingFn: sf.sortingFnGlosses,
    }),

    // Part of Speech column
    columnHelper.accessor((w) => w.senses.map((s) => s.grammaticalInfo), {
      Cell: ({ row }: CellProps) => <Cell.PartOfSpeech word={row.original} />,
      filterFn: (row, id, filterValue: GramCatGroup) =>
        row
          .getValue<GrammaticalInfo[]>(id)
          .some((gi) => gi.catGroup === filterValue),
      filterSelectOptions: Object.values(GramCatGroup).map((g) => ({
        text: t(`grammaticalCategory.group.${g}`),
        value: g,
      })),
      filterVariant: "select",
      header: t("reviewEntries.columns.partOfSpeech"),
      id: ColumnId.PartOfSpeech,
      sortingFn: sf.sortingFnPartOfSpeech,
      visibleInShowHideMenu: grammaticalInfoEnabled,
    }),

    // Domains column
    columnHelper.accessor((w) => w.senses.flatMap((s) => s.semanticDomains), {
      Cell: ({ row }: CellProps) => <Cell.Domains word={row.original} />,
      filterFn: ff.filterFnDomains,
      header: t("reviewEntries.columns.domains"),
      id: ColumnId.Domains,
      sortingFn: sf.sortingFnDomains,
    }),

    // Pronunciations column
    columnHelper.accessor((w) => w.audio, {
      Cell: ({ row }: CellProps) => (
        <Cell.Pronunciations replace={replaceWord} word={row.original} />
      ),
      filterFn: ff.filterFnPronunciations(speakers),
      Header: (
        <>
          <FiberManualRecord
            fontSize="small"
            sx={{ color: (t) => t.palette.error.main }}
          />
          <PlayArrow
            fontSize="small"
            sx={{ color: (t) => t.palette.success.main }}
          />
        </>
      ),
      header: t("reviewEntries.columns.pronunciations"),
      id: ColumnId.Pronunciations,
      muiTableHeadCellProps: {
        sx: {
          "& .Mui-TableHeadCell-Content-Wrapper": {
            height: IconHeaderHeight,
            minWidth: 2 * IconHeaderWidth,
            paddingTop: IconHeaderPaddingTop,
            width: 2 * IconHeaderWidth,
          },
        },
      },
      size: 3 * IconColumnSize,
    }),

    // Note column
    columnHelper.accessor((w) => w.note.text || undefined, {
      Cell: ({ row }: CellProps) => <Cell.Note word={row.original} />,
      filterFn: ff.filterFnString,
      header: t("reviewEntries.columns.note"),
      id: ColumnId.Note,
      size: BaselineColumnSize - 40,
      sortingFn: sf.sortingFnNote,
    }),

    // Flag column
    columnHelper.accessor("flag", {
      Cell: ({ row }: CellProps) => <Cell.Flag word={row.original} />,
      filterFn: ff.filterFnFlag,
      Header: (
        <FlagIcon
          fontSize="small"
          sx={{ color: (t) => t.palette.error.main }}
        />
      ),
      header: t("reviewEntries.columns.flag"),
      id: ColumnId.Flag,
      muiTableHeadCellProps: {
        sx: {
          "& .Mui-TableHeadCell-Content-Wrapper": {
            height: IconHeaderHeight,
            minWidth: IconHeaderWidth,
            paddingTop: IconHeaderPaddingTop,
            width: IconHeaderWidth,
          },
        },
      },
      size: IconHeaderWidth + HeaderActionsWidth,
      sortingFn: sf.sortingFnFlag,
    }),

    // Delete column
    columnHelper.display({
      Cell: ({ row }: CellProps) => (
        <Cell.Delete delete={deleteWord} word={row.original} />
      ),
      enableHiding: false,
      Header: "",
      header: t("reviewEntries.columns.delete"),
      id: ColumnId.Delete,
      size: IconColumnSize,
      visibleInShowHideMenu: false,
    }),
  ];

  const table = useMaterialReactTable({
    columns,
    data,
    autoResetPageIndex: autoResetPageIndexRef.current,
    columnFilterDisplayMode: "popover",
    enableColumnActions: false,
    enableColumnDragging: false,
    enableColumnOrdering: true,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enableGlobalFilter: false,
    enablePagination,
    enableRowVirtualization: !props.disableVirtualization,
    initialState: { density: "compact" },
    localization,
    muiPaginationProps: { rowsPerPageOptions },
    // Override whiteSpace: "nowrap" from having density: "compact"
    muiTableBodyCellProps: { sx: { whiteSpace: "normal" } },
    // Keep the table from going below the bottom of the page
    muiTableContainerProps: {
      sx: { maxHeight: `calc(100vh - ${enablePagination ? 180 : 130}px)` },
    },
    muiTablePaperProps: { sx: { height: `calc(100vh - ${topBarHeight}px)` } },
    onColumnOrderChange: (updater) =>
      dispatch(setReviewEntriesColumnOrder(updater)),
    onColumnVisibilityChange: (updater) =>
      dispatch(setReviewEntriesColumnVisibility(updater)),
    onPaginationChange: (updater) => {
      setPagination(updater);
      scrollToTop();
    },
    rowVirtualizerInstanceRef,
    sortDescFirst: false,
    state: { columnOrder, columnVisibility, isLoading, pagination },
  });

  return <MaterialReactTable table={table} />;
}
