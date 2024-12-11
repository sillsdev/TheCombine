import {
  type MRT_ColumnOrderState,
  type MRT_VisibilityState,
} from "material-react-table";

import { type Project, type Speaker, type User } from "api/models";
import { type Hash } from "types/hash";
import { newProject } from "types/project";

export interface CurrentProjectState {
  project: Project;
  /** For project-level persistance of ReviewEntriesTable's managed states
   * per https://www.material-react-table.com/docs/guides/state-management */
  reviewEntriesColumns: {
    columnOrder: MRT_ColumnOrderState;
    columnVisibility: MRT_VisibilityState;
  };
  semanticDomains?: Hash<string>;
  speaker?: Speaker;
  users: User[];
}

export const defaultState: CurrentProjectState = {
  project: newProject(),
  reviewEntriesColumns: { columnOrder: [], columnVisibility: {} },
  users: [],
};
