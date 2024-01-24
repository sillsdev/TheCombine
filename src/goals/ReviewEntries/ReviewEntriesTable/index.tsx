import { Flag as FlagIcon } from "@mui/icons-material";
import { Typography } from "@mui/material";
import {
  createMRTColumnHelper,
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_Row,
  MRT_Cell,
} from "material-react-table";
import { ReactElement, ReactNode, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import {
  Definition,
  Flag,
  Gloss,
  GramCatGroup,
  GrammaticalInfo,
  Pronunciation,
  SemanticDomain,
  Word,
} from "api/models";
import { getAllSpeakers, getFrontierWords, getWord } from "backend";
import { topBarHeight } from "components/LandingPage/TopBar";
import {
  DefinitionsCell,
  DeleteCell,
  DomainsCell,
  EditCell,
  FlagCell,
  GlossesCell,
  NoteCell,
  PartsOfSpeechCell,
  PronunciationsCell,
  VernacularCell,
} from "goals/ReviewEntries/ReviewEntriesTable/Cells";
import { type StoreState } from "types";
import { type Hash } from "types/hash";
import {
  compareWordDefinitions,
  compareWordDomains,
  compareWordGlosses,
  compareWordGrammaticalInfo,
} from "types/word";
import { compareFlags } from "utilities/wordUtilities";

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
    cell: MRT_Cell<Word, any>;
    row: MRT_Row<Word>;
    renderedCellValue: ReactNode;
  };

  const columns = [
    // Edit column
    columnHelper.display({
      Cell: ({ row }: CellProps) => (
        <EditCell replaceWord={replaceWord} rowData={row.original} />
      ),
      enableColumnActions: false,
      enableHiding: false,
      Header: <div />,
      header: t("reviewEntries.materialTable.body.edit"),
      size: 50,
    }),

    // Vernacular column
    columnHelper.accessor("vernacular", {
      Cell: ({ row }: CellProps) => <VernacularCell rowData={row.original} />,
      enableHiding: false,
      header: t("reviewEntries.columns.vernacular"),
    }),

    // Senses column
    columnHelper.accessor((row) => row.senses.length, {
      enableFilterMatchHighlighting: false,
      filterFn: "equals",
      Header: <Typography>#</Typography>,
      header: t("reviewEntries.columns.senses"),
      id: "senses",
      size: 100,
    }),

    // Definitions column
    columnHelper.accessor((row) => row.senses.flatMap((s) => s.definitions), {
      Cell: ({ row }: CellProps) => <DefinitionsCell rowData={row.original} />,
      enableHiding: showDefinitions,
      filterFn: (row, id, filterValue: string) =>
        row
          .getValue<Definition[]>(id)
          .findIndex((d) =>
            d.text.toLowerCase().includes(filterValue.trim().toLowerCase())
          ) !== -1,
      header: t("reviewEntries.columns.definitions"),
      id: "definitions",
      sortingFn: (rowA, rowB) =>
        compareWordDefinitions(rowA.original, rowB.original),
    }),

    // Glosses column
    columnHelper.accessor((row) => row.senses.flatMap((s) => s.glosses), {
      Cell: ({ row }: CellProps) => <GlossesCell rowData={row.original} />,
      filterFn: (row, id, filterValue: string) =>
        row
          .getValue<Gloss[]>(id)
          .findIndex((g) =>
            g.def.toLowerCase().includes(filterValue.trim().toLowerCase())
          ) !== -1,
      header: t("reviewEntries.columns.glosses"),
      id: "glosses",
      sortingFn: (rowA, rowB) =>
        compareWordGlosses(rowA.original, rowB.original),
    }),

    // Parts of Speech column
    columnHelper.accessor((row) => row.senses.map((s) => s.grammaticalInfo), {
      Cell: ({ row }: CellProps) => (
        <PartsOfSpeechCell rowData={row.original} />
      ),
      enableHiding: showGrammaticalInfo,
      filterFn: (row, id, filterValue: GramCatGroup) =>
        row
          .getValue<GrammaticalInfo[]>(id)
          .findIndex((i) => i.catGroup === filterValue) !== -1,
      filterSelectOptions: Object.values(GramCatGroup).map((g) => ({
        text: t(`grammaticalCategory.group.${g}`),
        value: g,
      })),
      filterVariant: "select",
      header: t("reviewEntries.columns.partsOfSpeech"),
      id: "partsOfSpeech",
      sortingFn: (rowA, rowB) =>
        compareWordGrammaticalInfo(rowA.original, rowB.original),
    }),

    // Domains column
    columnHelper.accessor(
      (row) => row.senses.flatMap((s) => s.semanticDomains),
      {
        Cell: ({ row }: CellProps) => <DomainsCell rowData={row.original} />,
        filterFn: (row, id, filterValue: string) => {
          /* Numeric id filter expected (periods between digits are optional).
           * Test for exact id match if no final period.
           * Test for initial substring match if final period. */
          const doms = row.getValue<SemanticDomain[]>(id);
          let filter = filterValue.replace(/[^0-9\.]/g, "");
          if (!filter) {
            return true;
          }
          const finalPeriod = filter.slice(-1) === ".";
          filter = filter.replace(/\./g, "").split("").join(".");
          if (finalPeriod) {
            return doms.findIndex((d) => d.id.startsWith(filter)) !== -1;
          } else {
            return doms.findIndex((d) => d.id === filter) !== -1;
          }
        },
        header: t("reviewEntries.columns.domains"),
        id: "domains",
        sortingFn: (rowA, rowB) =>
          compareWordDomains(rowA.original, rowB.original),
      }
    ),

    // Pronunciations column
    columnHelper.accessor((row) => row.audio, {
      Cell: ({ row }: CellProps) => (
        <PronunciationsCell replaceWord={replaceWord} rowData={row.original} />
      ),
      filterFn: (row, id, filterValue: string) => {
        /* Match either number of pronunciations or a speaker name. */
        const audio = row.getValue<Pronunciation[]>(id);
        const filter = filterValue.trim().toLocaleLowerCase();
        return (
          !filter ||
          audio.length === parseInt(filter) ||
          audio.some((p) => speakers[p.speakerId]?.includes(filter))
        );
      },
      header: t("reviewEntries.columns.pronunciations"),
      id: "pronunciations",
    }),

    // Note column
    columnHelper.accessor((row) => row.note.text, {
      Cell: ({ row }: CellProps) => <NoteCell rowData={row.original} />,
      header: t("reviewEntries.columns.note"),
      id: "note",
    }),

    // Flag column
    columnHelper.accessor("flag", {
      Cell: ({ row }: CellProps) => <FlagCell rowData={row.original} />,
      filterFn: (row, id, filterValue: string) =>
        row
          .getValue<Flag>(id)
          .text.toLowerCase()
          .includes(filterValue.trim().toLowerCase()),
      Header: (
        <FlagIcon
          fontSize="small"
          sx={{ color: (t) => t.palette.error.main, maxHeight: 18 }}
        />
      ),
      header: t("reviewEntries.columns.flag"),
      size: 100,
      sortingFn: (rowA, rowB) =>
        compareFlags(rowA.original.flag, rowB.original.flag),
    }),

    // Delete column
    columnHelper.display({
      Cell: ({ row }: CellProps) => (
        <DeleteCell deleteWord={deleteWord} rowData={row.original} />
      ),
      enableColumnActions: false,
      enableHiding: false,
      Header: <div />,
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
        partsOfSpeech: showGrammaticalInfo,
      },
    },
    muiPaginationProps: { rowsPerPageOptions: [10, 25, 100, 250] },
    //muiTableHeadCellProps: () => ({ sx: { maxHeight: 100 } }),
    muiTablePaperProps: () => ({
      sx: { height: `calc(100vh - ${topBarHeight}px)` },
    }),
    muiTableProps: () => ({ sx: { maxHeight: `calc(100vh - 200px)` } }),
    state: { isLoading: isLoading },
  });

  return <MaterialReactTable table={table} />;
}
