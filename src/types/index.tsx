import { LocalizeState } from "react-localize-redux";

import { LoginState } from "components/Login/Redux/LoginReduxTypes";
import { PasswordResetState } from "components/PasswordReset/Redux/ResetActionTypes";
import { ExportProjectState } from "components/ProjectExport/ExportProjectReducer";
import { CreateProjectState } from "components/ProjectScreen/CreateProject/Redux/CreateProjectReducer";
import { PronunciationsState } from "components/Pronunciations/PronunciationsReducer";
import { TreeViewState } from "components/TreeView/TreeViewReducer";
import { ReviewEntriesState } from "goals/ReviewEntries/ReviewEntriesComponent/Redux/ReviewEntriesReducer";
import { AnalyticsState } from "types/analytics";
import { CharacterInventoryState } from "goals/CharInventoryCreation/Redux/CharacterInventoryReduxTypes";
import { GoalsState } from "types/goals";
import { MergeTreeState } from "goals/MergeDupGoal/MergeDupStep/Redux/MergeDupReduxTypes";
import { Project } from "types/project";

//root store structure
export interface StoreState {
  //handles localization through react-localize-redux utilities
  localize: LocalizeState;

  //login
  loginState: LoginState;
  passwordResetState: PasswordResetState;

  //project
  createProjectState: CreateProjectState;
  currentProject: Project;
  exportProjectState: ExportProjectState;

  //data entry and review entries
  treeViewState: TreeViewState;
  reviewEntriesState: ReviewEntriesState;
  pronunciationsState: PronunciationsState;

  //general cleanup tools
  goalsState: GoalsState;

  //merge duplicates goal
  mergeDuplicateGoal: MergeTreeState;

  //character inventory goal
  characterInventoryState: CharacterInventoryState;

  //analytics state
  analyticsState: AnalyticsState;
}
