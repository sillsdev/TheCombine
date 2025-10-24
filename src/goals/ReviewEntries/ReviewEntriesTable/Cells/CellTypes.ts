import { type Word } from "api/models";

export interface CellProps {
  delete?: (wordId: string) => Promise<void>;
  replace?: (oldId: string, newId: string) => Promise<void>;
  word: Word;
}
