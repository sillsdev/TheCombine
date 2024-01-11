import {
  createMRTColumnHelper,
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_Row,
} from "material-react-table";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import { Word } from "api/models";
import {
  DeleteCell,
  FlagCell,
  VernacularCell,
} from "goals/ReviewEntries/ReviewEntriesTable/Cells";
import { StoreState } from "types";
import { compareFlags } from "utilities/wordUtilities";

export default function ReviewEntriesTable(): ReactElement {
  const data = useSelector(
    (state: StoreState) => state.reviewEntriesState.words
  );
  /*const showDefinitions = useSelector(
    (state: StoreState) => state.currentProjectState.project.definitionsEnabled
  );
  const showGrammaticalInfo = useSelector(
    (state: StoreState) =>
      state.currentProjectState.project.grammaticalInfoEnabled
  );*/

  const { t } = useTranslation();

  const columnHelper = createMRTColumnHelper<Word>();

  type CellProps = { row: MRT_Row<Word> };

  const columns = [
    columnHelper.accessor("vernacular", {
      header: t("reviewEntries.columns.vernacular"),
      Cell: ({ row }: CellProps) => <VernacularCell rowData={row.original} />,
    }),
    columnHelper.accessor((row) => row.senses.length, {
      header: t("reviewEntries.columns.senses"),
      id: "senses",
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

  const table = useMaterialReactTable({ columns, data });

  return <MaterialReactTable table={table} />;
}
