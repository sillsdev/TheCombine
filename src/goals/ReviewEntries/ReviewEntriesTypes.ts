import { Goal, GoalName, GoalType } from "types/goals";

export class ReviewEntries extends Goal {
  constructor() {
    super(GoalType.ReviewEntries, GoalName.ReviewEntries);
  }
}

export type EntryEdit = {
  newId: string;
  oldId: string;
};

export interface EntriesEdited {
  entryEdits: EntryEdit[];
}
