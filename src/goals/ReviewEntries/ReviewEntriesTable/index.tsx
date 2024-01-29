import { Flag as FlagIcon } from "@mui/icons-material";
import { Typography } from "@mui/material";
import {
  MaterialReactTable,
  type MRT_Row,
  //type MRT_Cell,
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

  type CellProps = {
    //cell: MRT_Cell<Word, any>;
    row: MRT_Row<Word>;
    //renderedCellValue: ReactNode;
  };

  const columns = [
    // Edit column
    columnHelper.display({
      Cell: ({ row }: CellProps) => (
        <Cell.Edit replace={replaceWord} word={row.original} />
      ),
      enableColumnActions: false,
      enableHiding: false,
      Header: "",
      header: t("reviewEntries.materialTable.body.edit"),
      size: 50,
    }),

    // Vernacular column
    columnHelper.accessor("vernacular", {
      Cell: ({ row }: CellProps) => <Cell.Vernacular word={row.original} />,
      enableHiding: false,
      header: t("reviewEntries.columns.vernacular"),
    }),

    // Senses column
    columnHelper.accessor((w) => w.senses.length, {
      enableFilterMatchHighlighting: false,
      filterFn: "equals",
      Header: <Typography>#</Typography>,
      header: t("reviewEntries.columns.senses"),
      id: "senses",
      size: 100,
    }),

    // Definitions column
    columnHelper.accessor((w) => w.senses.flatMap((s) => s.definitions), {
      Cell: ({ row }: CellProps) => <Cell.Definitions word={row.original} />,
      enableHiding: showDefinitions,
      filterFn: ff.filterFnDefinitions,
      header: t("reviewEntries.columns.definitions"),
      id: "definitions",
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
      header: t("reviewEntries.columns.pronunciations"),
      id: "pronunciations",
    }),

    // Note column
    columnHelper.accessor((w) => w.note.text, {
      Cell: ({ row }: CellProps) => <Cell.Note word={row.original} />,
      header: t("reviewEntries.columns.note"),
      id: "note",
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
      size: 100,
      sortingFn: sf.sortingFnFlag,
    }),

    // Delete column
    columnHelper.display({
      Cell: ({ row }: CellProps) => (
        <Cell.Delete delete={deleteWord} word={row.original} />
      ),
      enableColumnActions: false,
      enableHiding: false,
      Header: "",
      header: t("reviewEntries.columns.delete"),
      size: 50,
    }),
  ];

  const table = useMaterialReactTable({
    columns,
    data,
    enableColumnActions: false,
    //enableColumnResizing: true,
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
    },
    //muiFilterTextFieldProps: () => ({ label: " " }),
    muiPaginationProps: { rowsPerPageOptions: [10, 25, 100, 250] },
    //muiTableHeadCellProps: () => ({ sx: { maxHeight: 100 } }),
    muiTablePaperProps: () => ({
      sx: { height: `calc(100vh - ${topBarHeight}px)` },
    }),
    muiTableProps: () => ({ sx: { maxHeight: `calc(100vh - 200px)` } }),
    sortDescFirst: false,
    state: { isLoading: isLoading },
  });

  return <MaterialReactTable table={table} />;
}
