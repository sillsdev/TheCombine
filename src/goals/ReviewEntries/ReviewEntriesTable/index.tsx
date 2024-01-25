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
      sortDescFirst: false,
    }),

    // Senses column
    columnHelper.accessor((w) => w.senses.length, {
      enableFilterMatchHighlighting: false,
      filterFn: "equals",
      Header: <Typography>#</Typography>,
      header: t("reviewEntries.columns.senses"),
      id: "senses",
      size: 100,
      sortDescFirst: false,
    }),

    // Definitions column
    columnHelper.accessor((w) => w.senses.flatMap((s) => s.definitions), {
      Cell: ({ row }: CellProps) => <DefinitionsCell rowData={row.original} />,
      enableHiding: showDefinitions,
      filterFn: (row, id, filterValue: string) => {
        const definitions = row.getValue<Definition[]>(id);
        const filter = filterValue.trim().toLowerCase();
        return definitions.some((d) => d.text.toLowerCase().includes(filter));
      },
      header: t("reviewEntries.columns.definitions"),
      id: "definitions",
      sortDescFirst: false,
      sortingFn: (rowA, rowB) =>
        compareWordDefinitions(rowA.original, rowB.original),
    }),

    // Glosses column
    columnHelper.accessor((w) => w.senses.flatMap((s) => s.glosses), {
      Cell: ({ row }: CellProps) => <GlossesCell rowData={row.original} />,
      filterFn: (row, id, filterValue: string) => {
        const glosses = row.getValue<Gloss[]>(id);
        const filter = filterValue.trim().toLowerCase();
        return glosses.some((g) => g.def.toLowerCase().includes(filter));
      },
      header: t("reviewEntries.columns.glosses"),
      id: "glosses",
      sortDescFirst: false,
      sortingFn: (rowA, rowB) =>
        compareWordGlosses(rowA.original, rowB.original),
    }),

    // Parts of Speech column
    columnHelper.accessor((w) => w.senses.map((s) => s.grammaticalInfo), {
      Cell: ({ row }: CellProps) => (
        <PartsOfSpeechCell rowData={row.original} />
      ),
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
      header: t("reviewEntries.columns.partsOfSpeech"),
      id: "partsOfSpeech",
      sortDescFirst: false,
      sortingFn: (rowA, rowB) =>
        compareWordGrammaticalInfo(rowA.original, rowB.original),
    }),

    // Domains column
    columnHelper.accessor((w) => w.senses.flatMap((s) => s.semanticDomains), {
      Cell: ({ row }: CellProps) => <DomainsCell rowData={row.original} />,
      filterFn: (row, id, filterValue: string) => {
        /* Numeric id filter expected (periods between digits are optional).
         * Test for exact id match if no final period.
         * Test for initial substring match if final period. */
        const doms = row.getValue<SemanticDomain[]>(id);
        if (!doms.length) {
          // A filter has been typed and there are no domains
          return false;
        }
        if (!filterValue.trim()) {
          // The typed filter is whitespace
          return true;
        }
        let filter = filterValue.replace(/[^0-9\.]/g, "");
        if (!filter) {
          // The typed filter has no digits or periods
          return false;
        }
        // Check if the filter ends with a period rather than a digit
        const finalPeriod = filter.slice(-1) === ".";
        // Remove all periods and put periods between digits
        filter = filter.replace(/\./g, "").split("").join(".");
        if (finalPeriod) {
          // There is a period after the final digit (or no digits)
          return doms.some((d) => d.id.startsWith(filter));
        } else {
          // There is not a period after the final digit
          return doms.some((d) => d.id === filter);
        }
      },
      header: t("reviewEntries.columns.domains"),
      id: "domains",
      sortDescFirst: false,
      sortingFn: (rowA, rowB) =>
        compareWordDomains(rowA.original, rowB.original),
    }),

    // Pronunciations column
    columnHelper.accessor((w) => w.audio, {
      Cell: ({ row }: CellProps) => (
        <PronunciationsCell replaceWord={replaceWord} rowData={row.original} />
      ),
      filterFn: (row, id, filterValue: string) => {
        /* Match either number of pronunciations or a speaker name.
         * (Whitespace will match all audio, even without a speaker.) */
        const audio = row.getValue<Pronunciation[]>(id);
        const filter = filterValue.trim().toLocaleLowerCase();
        return (
          audio.length === parseInt(filter) ||
          audio.some((p) => !filter || speakers[p.speakerId]?.includes(filter))
        );
      },
      header: t("reviewEntries.columns.pronunciations"),
      id: "pronunciations",
      sortDescFirst: false,
    }),

    // Note column
    columnHelper.accessor((w) => w.note.text, {
      Cell: ({ row }: CellProps) => <NoteCell rowData={row.original} />,
      header: t("reviewEntries.columns.note"),
      id: "note",
      sortDescFirst: false,
    }),

    // Flag column
    columnHelper.accessor("flag", {
      Cell: ({ row }: CellProps) => <FlagCell rowData={row.original} />,
      filterFn: (row, id, filterValue: string) => {
        const flag = row.getValue<Flag>(id);
        if (!flag.active) {
          // A filter has been typed and the word isn't flagged
          return false;
        }
        const filter = filterValue.trim().toLowerCase();
        return flag.text.toLowerCase().includes(filter);
      },
      Header: (
        <FlagIcon
          fontSize="small"
          sx={{ color: (t) => t.palette.error.main, maxHeight: 18 }}
        />
      ),
      header: t("reviewEntries.columns.flag"),
      size: 100,
      sortDescFirst: false,
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
    //muiFilterTextFieldProps: () => ({ label: " " }),
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
