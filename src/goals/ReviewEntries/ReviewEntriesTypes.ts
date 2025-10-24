import { Goal, GoalName, GoalType } from "types/goals";

export class ReviewEntries extends Goal {
  constructor() {
    super(GoalType.ReviewEntries, GoalName.ReviewEntries);
  }
}

export type EntryEdit = {
  /** Id of the entry resulting from the edit, or undefined if deleted. */
  newId?: string;
  /** Id of the entry that was edited. */
  oldId: string;
};

export interface EntriesEdited {
  entryEdits: EntryEdit[];
}
