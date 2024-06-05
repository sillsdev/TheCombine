import {
  FiberManualRecord,
  Flag as FlagIcon,
  PlayArrow,
} from "@mui/icons-material";
import { Typography } from "@mui/material";
import {
  MaterialReactTable,
  type MRT_Localization,
  type MRT_PaginationState,
  type MRT_Row,
  type MRT_RowVirtualizer,
  createMRTColumnHelper,
  useMaterialReactTable,
} from "material-react-table";
import { type ReactElement, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { GramCatGroup, type GrammaticalInfo, type Word } from "api/models";
import { getAllSpeakers, getFrontierWords, getWord } from "backend";
import { topBarHeight } from "components/LandingPage/TopBar";
import * as Cell from "goals/ReviewEntries/ReviewEntriesTable/Cells";
import * as ff from "goals/ReviewEntries/ReviewEntriesTable/filterFn";
import * as sf from "goals/ReviewEntries/ReviewEntriesTable/sortingFn";
import { type StoreState } from "types";
import { type Hash } from "types/hash";
import { useAppSelector } from "types/hooks";

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
  const showDefinitions = useAppSelector(
    (state: StoreState) => state.currentProjectState.project.definitionsEnabled
  );
  const showGrammaticalInfo = useAppSelector(
    (state: StoreState) =>
      state.currentProjectState.project.grammaticalInfoEnabled
  );

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
    setData((prev) => prev.filter((w) => w.id !== id));
  };

  /** Replaces word (`.id === oldId`) in the state
   * with word (`.id === newId`) fetched from the backend. */
  const replaceWord = async (oldId: string, newId: string): Promise<void> => {
    const newWord = await getWord(newId);
    setData((prev) => prev.map((w) => (w.id === oldId ? newWord : w)));
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
      size: IconColumnSize,
      visibleInShowHideMenu: false,
    }),

    // Vernacular column
    columnHelper.accessor("vernacular", {
      Cell: ({ row }: CellProps) => <Cell.Vernacular word={row.original} />,
      enableColumnOrdering: false,
      enableHiding: false,
      header: t("reviewEntries.columns.vernacular"),
      size: BaselineColumnSize - 40,
    }),

    // Senses column
    columnHelper.accessor((w) => w.senses.length, {
      enableFilterMatchHighlighting: false,
      filterFn: "equals",
      Header: <Typography>#</Typography>,
      header: t("reviewEntries.columns.sensesCount"),
      id: "senses",
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
      id: "definitions",
      size: BaselineColumnSize + 20,
      sortingFn: sf.sortingFnDefinitions,
      visibleInShowHideMenu: showDefinitions,
    }),

    // Glosses column
    columnHelper.accessor((w) => w.senses.flatMap((s) => s.glosses), {
      Cell: ({ row }: CellProps) => <Cell.Glosses word={row.original} />,
      filterFn: ff.filterFnGlosses,
      header: t("reviewEntries.columns.glosses"),
      id: "glosses",
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
      id: "partOfSpeech",
      sortingFn: sf.sortingFnPartOfSpeech,
      visibleInShowHideMenu: showGrammaticalInfo,
    }),

    // Domains column
    columnHelper.accessor((w) => w.senses.flatMap((s) => s.semanticDomains), {
      Cell: ({ row }: CellProps) => <Cell.Domains word={row.original} />,
      filterFn: ff.filterFnDomains,
      header: t("reviewEntries.columns.domains"),
      id: "domains",
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
      id: "pronunciations",
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
      header: t("reviewEntries.columns.note"),
      id: "note",
      size: BaselineColumnSize - 40,
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
      size: IconColumnSize,
      visibleInShowHideMenu: false,
    }),
  ];

  const table = useMaterialReactTable({
    columns,
    data,
    columnFilterDisplayMode: "popover",
    enableColumnActions: false,
    enableColumnDragging: false,
    enableColumnOrdering: true,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enableGlobalFilter: false,
    enablePagination,
    enableRowVirtualization: !props.disableVirtualization,
    initialState: {
      columnVisibility: {
        definitions: showDefinitions,
        partOfSpeech: showGrammaticalInfo,
      },
      density: "compact",
    },
    localization,
    muiPaginationProps: { rowsPerPageOptions },
    // Override whiteSpace: "nowrap" from having density: "compact"
    muiTableBodyCellProps: { sx: { whiteSpace: "normal" } },
    // Keep the table from going below the bottom of the page
    muiTableContainerProps: {
      sx: { maxHeight: `calc(100vh - ${enablePagination ? 180 : 130}px)` },
    },
    muiTablePaperProps: { sx: { height: `calc(100vh - ${topBarHeight}px)` } },
    onPaginationChange: (updater) => {
      setPagination(updater);
      scrollToTop();
    },
    rowVirtualizerInstanceRef,
    sortDescFirst: false,
    state: { isLoading, pagination },
  });

  return <MaterialReactTable table={table} />;
}
