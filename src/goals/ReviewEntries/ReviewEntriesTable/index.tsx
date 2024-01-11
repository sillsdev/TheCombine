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
  VernacularCell,
} from "goals/ReviewEntries/ReviewEntriesTable/Cells";
import { StoreState } from "types";
import {
  compareWordDefinitions,
  compareWordDomains,
  compareWordGlosses,
} from "types/word";
import { compareFlags } from "utilities/wordUtilities";

export default function ReviewEntriesTable(): ReactElement {
  const data = useSelector(
    (state: StoreState) => state.reviewEntriesState.words
  );
  const showDefinitions = useSelector(
    (state: StoreState) => state.currentProjectState.project.definitionsEnabled
  );
  /*const showGrammaticalInfo = useSelector(
    (state: StoreState) =>
      state.currentProjectState.project.grammaticalInfoEnabled
  );*/

  const { t } = useTranslation();

  const columnHelper = createMRTColumnHelper<Word>();

  type CellProps = {
    cell: MRT_Cell<Word, any>;
    row: MRT_Row<Word>;
    renderedCellValue: ReactNode;
  };

  const columns = [
    columnHelper.accessor("vernacular", {
      header: t("reviewEntries.columns.vernacular"),
      Cell: ({ row }: CellProps) => <VernacularCell rowData={row.original} />,
    }),
    columnHelper.accessor((row) => row.senses.length, {
      header: t("reviewEntries.columns.senses"),
      id: "senses",
    }),
    columnHelper.accessor((row) => row.senses.map((s) => s.definitions), {
      header: t("reviewEntries.columns.definitions"),
      id: "definitions",
      sortingFn: (rowA, rowB) =>
        compareWordDefinitions(rowA.original, rowB.original),
      Cell: ({ row }: CellProps) => <DefinitionsCell rowData={row.original} />,
    }),
    columnHelper.accessor((row) => row.senses.map((s) => s.glosses), {
      header: t("reviewEntries.columns.glosses"),
      id: "glosses",
      sortingFn: (rowA, rowB) =>
        compareWordGlosses(rowA.original, rowB.original),
      Cell: ({ row }: CellProps) => <GlossesCell rowData={row.original} />,
    }),
    columnHelper.accessor((row) => row.senses.map((s) => s.semanticDomains), {
      header: t("reviewEntries.columns.domains"),
      id: "domains",
      sortingFn: (rowA, rowB) =>
        compareWordDomains(rowA.original, rowB.original),
      Cell: ({ row }: CellProps) => <DomainsCell rowData={row.original} />,
    }),
    columnHelper.accessor((row) => row.note.text, {
      header: t("reviewEntries.columns.note"),
      id: "note",
      sortingFn: (rowA, rowB) =>
        rowA.original.note.text.localeCompare(rowB.original.note.text),
      Cell: ({ row }: CellProps) => <NoteCell rowData={row.original} />,
    }),
    columnHelper.accessor("flag", {
      header: t("reviewEntries.columns.flag"),
      sortingFn: (rowA, rowB) =>
        compareFlags(rowA.original.flag, rowB.original.flag),
      Cell: ({ row }: CellProps) => <FlagCell rowData={row.original} />,
    }),
    columnHelper.display({
      header: t("reviewEntries.columns.delete"),
      Cell: ({ row }: CellProps) => <DeleteCell rowData={row.original} />,
    }),
  ];

  const table = useMaterialReactTable({
    columns,
    data,
    initialState: { columnVisibility: { definitions: showDefinitions } },
  });

  return <MaterialReactTable table={table} />;
}
