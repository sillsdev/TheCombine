import { Word } from "api/models";

export interface CellProps {
  deleteWord?: (wordId: string) => void;
  replaceWord?: (oldId: string, newId: string) => Promise<void>;
  rowData: Word;
}
