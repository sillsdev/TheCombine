import {
  FiberManualRecord,
  Flag as FlagIcon,
  PlayArrow,
} from "@mui/icons-material";
import { Typography } from "@mui/material";
import {
  type MRT_Row,
  MaterialReactTable,
  createMRTColumnHelper,
  useMaterialReactTable,
} from "material-react-table";
import { type ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import { GramCatGroup, type GrammaticalInfo, type Word } from "api/models";
import { getAllSpeakers, getFrontierWords, getWord } from "backend";
import { topBarHeight } from "components/LandingPage/TopBar";
import * as Cell from "goals/ReviewEntries/ReviewEntriesTable/Cells";
import * as ff from "goals/ReviewEntries/ReviewEntriesTable/filterFn";
import * as sf from "goals/ReviewEntries/ReviewEntriesTable/sortingFn";
import { type StoreState } from "types";
import { type Hash } from "types/hash";

// Constants for custom column/header sizing.
const BaselineColumnSize = 180;
const HeaderActionsWidth = 60; // Assumes initial state density "compact"
const IconColumnSize = 50; // Baseline for a column with a single icon as row content
const IconHeaderHeight = 22; // Height for a small icon as Header
const IconHeaderPaddingTop = "2px"; // Vertical offset for a small icon as Header
const IconHeaderWidth = 20; // Width for a small icon as Header
const SensesHeaderWidth = 15; // Width for # as Header

export default function ReviewEntriesTable(): ReactElement {
  const showDefinitions = useSelector(
    (state: StoreState) => state.currentProjectState.project.definitionsEnabled
  );
  const showGrammaticalInfo = useSelector(
    (state: StoreState) =>
      state.currentProjectState.project.grammaticalInfoEnabled
  );

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<Word[]>([]);
  const [speakers, setSpeakers] = useState<Hash<string>>({});

  const deleteWord = (id: string): void => {
    setData((prev) => prev.filter((w) => w.id !== id));
  };
  const replaceWord = async (oldId: string, newId: string): Promise<void> => {
    const word = await getWord(newId);
    setData((prev) => prev.map((w) => (w.id === oldId ? word : w)));
  };

  useEffect(() => {
    getAllSpeakers().then((list) =>
      setSpeakers(
        Object.fromEntries(list.map((s) => [s.id, s.name.toLocaleLowerCase()]))
      )
    );
    getFrontierWords().then((frontier) => {
      setData(frontier);
      setIsLoading(false);
    });
  }, []);

  const { t } = useTranslation();

  const columnHelper = createMRTColumnHelper<Word>();

  type CellProps = { row: MRT_Row<Word> };

  const columns = [
    // Edit column
    columnHelper.display({
      Cell: ({ row }: CellProps) => (
        <Cell.Edit replace={replaceWord} word={row.original} />
      ),
      enableColumnActions: false,
      enableColumnOrdering: false,
      enableHiding: false,
      Header: "",
      header: t("reviewEntries.materialTable.body.edit"),
      size: IconColumnSize,
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
      header: t("reviewEntries.columns.senses"),
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
      enableHiding: showDefinitions,
      filterFn: ff.filterFnDefinitions,
      header: t("reviewEntries.columns.definitions"),
      id: "definitions",
      size: BaselineColumnSize + 20,
      sortingFn: sf.sortingFnDefinitions,
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
      enableHiding: showGrammaticalInfo,
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
      enableColumnActions: false,
      enableColumnOrdering: false,
      enableHiding: false,
      Header: "",
      header: t("reviewEntries.columns.delete"),
      size: IconColumnSize,
    }),
  ];

  const table = useMaterialReactTable({
    columns,
    data,
    columnFilterDisplayMode: "popover",
    enableColumnActions: false,
    enableColumnDragging: false,
    enableColumnOrdering: true,
    //enableColumnResizing: true,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    //enablePagination: false,
    enableRowVirtualization: true,
    enableGlobalFilter: false,
    enableStickyHeader: true,
    initialState: {
      columnVisibility: {
        definitions: showDefinitions,
        partOfSpeech: showGrammaticalInfo,
      },
      density: "compact",
    },
    muiPaginationProps: { rowsPerPageOptions: [10, 25, 100, 250] },
    // Override whiteSpace: "nowrap" from having density: "compact"
    muiTableBodyCellProps: { sx: { whiteSpace: "normal" } },
    // Keep the table from going below the bottom of the page
    muiTablePaperProps: { sx: { height: `calc(100vh - ${topBarHeight}px)` } },
    muiTableProps: { sx: { maxHeight: `calc(100vh - 200px)` } },
    sortDescFirst: false,
    state: { isLoading: isLoading },
  });

  return <MaterialReactTable table={table} />;
}
