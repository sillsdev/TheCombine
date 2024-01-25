import { Word } from "api/models";

export interface CellProps {
  delete?: (wordId: string) => void;
  replace?: (oldId: string, newId: string) => Promise<void>;
  word: Word;
}
