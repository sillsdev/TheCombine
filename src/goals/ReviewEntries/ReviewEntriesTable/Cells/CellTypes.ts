import { Word } from "api/models";

export interface CellProps {
  deleteWord?: (wordId: string) => void;
  replaceWord?: (wordId: string, word: Word) => void;
  rowData: Word;
}
