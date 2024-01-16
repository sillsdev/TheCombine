import { Edit } from "@mui/icons-material";
import {
  createMRTColumnHelper,
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_Row,
  MRT_Cell,
} from "material-react-table";
import { ReactElement, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import { Word } from "api/models";
import {
  DefinitionsCell,
  DeleteCell,
  DomainsCell,
  FlagCell,
  GlossesCell,
  NoteCell,
  PartsOfSpeechCell,
  PronunciationsCell,
  VernacularCell,
} from "goals/ReviewEntries/ReviewEntriesTable/Cells";
import { StoreState } from "types";
import {
  compareWordDefinitions,
  compareWordDomains,
  compareWordGlosses,
  compareWordGrammaticalInfo,
} from "types/word";
import { compareFlags } from "utilities/wordUtilities";
import { appBarHeight } from "components/AppBar/AppBarTypes";

export default function ReviewEntriesTable(): ReactElement {
  const data = useSelector(
    (state: StoreState) => state.reviewEntriesState.words
  );
  const showDefinitions = useSelector(
    (state: StoreState) => state.currentProjectState.project.definitionsEnabled
  );
  const showGrammaticalInfo = useSelector(
    (state: StoreState) =>
      state.currentProjectState.project.grammaticalInfoEnabled
  );

  const { t } = useTranslation();

  const columnHelper = createMRTColumnHelper<Word>();

  type CellProps = {
    cell: MRT_Cell<Word, any>;
    row: MRT_Row<Word>;
    renderedCellValue: ReactNode;
  };

  const columns = [
    columnHelper.display({
      Cell: ({}: CellProps) => <Edit />,
      enableColumnActions: false,
      enableHiding: false,
      Header: <div />,
      header: t("reviewEntries.materialTable.body.edit"),
      size: 1,
    }),
    columnHelper.accessor("vernacular", {
      Cell: ({ row }: CellProps) => <VernacularCell rowData={row.original} />,
      enableHiding: false,
      header: t("reviewEntries.columns.vernacular"),
    }),
    columnHelper.accessor((row) => row.senses.length, {
      enableFilterMatchHighlighting: false,
      filterFn: "equals",
      header: t("reviewEntries.columns.senses"),
      id: "senses",
    }),
    columnHelper.accessor((row) => row.senses.map((s) => s.definitions), {
      Cell: ({ row }: CellProps) => <DefinitionsCell rowData={row.original} />,
      enableHiding: showDefinitions,
      header: t("reviewEntries.columns.definitions"),
      id: "definitions",
      sortingFn: (rowA, rowB) =>
        compareWordDefinitions(rowA.original, rowB.original),
    }),
    columnHelper.accessor((row) => row.senses.map((s) => s.glosses), {
      Cell: ({ row }: CellProps) => <GlossesCell rowData={row.original} />,
      header: t("reviewEntries.columns.glosses"),
      id: "glosses",
      sortingFn: (rowA, rowB) =>
        compareWordGlosses(rowA.original, rowB.original),
    }),
    columnHelper.accessor((row) => row.senses.map((s) => s.grammaticalInfo), {
      Cell: ({ row }: CellProps) => (
        <PartsOfSpeechCell rowData={row.original} />
      ),
      enableHiding: showGrammaticalInfo,
      header: t("reviewEntries.columns.partOfSpeech"),
      id: "partsOfSpeech",
      sortingFn: (rowA, rowB) =>
        compareWordGrammaticalInfo(rowA.original, rowB.original),
    }),
    columnHelper.accessor((row) => row.senses.map((s) => s.semanticDomains), {
      Cell: ({ row }: CellProps) => <DomainsCell rowData={row.original} />,
      header: t("reviewEntries.columns.domains"),
      id: "domains",
      sortingFn: (rowA, rowB) =>
        compareWordDomains(rowA.original, rowB.original),
    }),
    columnHelper.accessor((row) => row.audio.length, {
      Cell: ({ row }: CellProps) => (
        <PronunciationsCell rowData={row.original} />
      ),
      filterFn: "equals",
      header: t("reviewEntries.columns.pronunciations"),
      id: "pronunciations",
    }),
    columnHelper.accessor((row) => row.note.text, {
      Cell: ({ row }: CellProps) => <NoteCell rowData={row.original} />,
      header: t("reviewEntries.columns.note"),
      id: "note",
    }),
    columnHelper.accessor("flag", {
      Cell: ({ row }: CellProps) => <FlagCell rowData={row.original} />,
      header: t("reviewEntries.columns.flag"),
      sortingFn: (rowA, rowB) =>
        compareFlags(rowA.original.flag, rowB.original.flag),
    }),
    columnHelper.display({
      Cell: ({ row }: CellProps) => <DeleteCell rowData={row.original} />,
      enableColumnActions: false,
      enableHiding: false,
      header: t("reviewEntries.columns.delete"),
      Header: <div />,
      size: 1,
    }),
  ];

  const table = useMaterialReactTable({
    columns,
    data,
    //enableColumnResizing: true,
    enableFullScreenToggle: false,
    //enablePagination: false,
    enableRowVirtualization: true,
    enableStickyHeader: true,
    initialState: {
      columnVisibility: {
        definitions: showDefinitions,
        partsOfSpeech: showGrammaticalInfo,
      },
    },
    /*muiTableProps: () => ({
      style: { height: `calc(50% - ${appBarHeight}px)` },
    }),*/
  });

  return <MaterialReactTable table={table} />;
}
