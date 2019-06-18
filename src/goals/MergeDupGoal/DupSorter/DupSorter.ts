import { Word } from "../../../types/word";

export enum SortStyle {
  VERN_ASCENDING,
  VERN_DESCENDING
}

export default class DupSorter {
  type: SortStyle;

  constructor(type: SortStyle = SortStyle.VERN_ASCENDING) {
    this.type = type;
  }

  sort(list: Word[]): Word[] {
    switch (this.type) {
      case SortStyle.VERN_ASCENDING:
        return this.sortByVern(list, true);
      case SortStyle.VERN_DESCENDING:
        return this.sortByVern(list, false);
    }
  }

  private sortByVern(list: Word[], ascending: boolean): Word[] {
    return list.sort((first: Word, other: Word) => {
      if (first.vernacular < other.vernacular) return ascending ? -1 : 1;
      else if (first.vernacular > other.vernacular) return ascending ? 1 : -1;
      else return 0;
    });
  }
}
