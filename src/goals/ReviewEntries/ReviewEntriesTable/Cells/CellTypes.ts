import { type Word } from "api/models";

export interface ReadonlyCellProps {
  word: Word;
}

export interface CellProps extends ReadonlyCellProps {
  delete: (wordId: string) => Promise<void>;
  replace: (oldId: string, newId: string) => Promise<void>;
}
