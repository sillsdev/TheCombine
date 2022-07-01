import { LoginState } from "components/Login/Redux/LoginReduxTypes";
import { PasswordResetState } from "components/PasswordReset/Redux/ResetReduxTypes";
import { CurrentProjectState } from "components/Project/ProjectReduxTypes";
import { ExportProjectState } from "components/ProjectExport/Redux/ExportProjectReduxTypes";
import { CreateProjectState } from "components/ProjectScreen/CreateProject/Redux/CreateProjectReduxTypes";
import { PronunciationsState } from "components/Pronunciations/Redux/PronunciationsReduxTypes";
import { TreeViewState } from "components/TreeView/TreeViewReducer";
import { CharacterInventoryState } from "goals/CharInventoryCreation/Redux/CharacterInventoryReduxTypes";
import { MergeTreeState } from "goals/MergeDupGoal/Redux/MergeDupReduxTypes";
import { ReviewEntriesState } from "goals/ReviewEntries/ReviewEntriesComponent/Redux/ReviewEntriesReduxTypes";
import { AnalyticsState } from "types/Redux/analyticsReduxTypes";
import { GoalsState } from "types/goals";

//root store structure
export interface StoreState {
  //login
  loginState: LoginState;
  passwordResetState: PasswordResetState;

  //project
  createProjectState: CreateProjectState;
  currentProjectState: CurrentProjectState;
  exportProjectState: ExportProjectState;

  //data entry and review entries
  treeViewState: TreeViewState;
  reviewEntriesState: ReviewEntriesState;
  pronunciationsState: PronunciationsState;

  //goal timeline and current goal
  goalsState: GoalsState;

  //merge duplicates goal
  mergeDuplicateGoal: MergeTreeState;

  //character inventory goal
  characterInventoryState: CharacterInventoryState;

  //analytics state
  analyticsState: AnalyticsState;
}
