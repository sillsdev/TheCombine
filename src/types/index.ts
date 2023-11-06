import { LoginState } from "components/Login/Redux/LoginReduxTypes";
import { CurrentProjectState } from "components/Project/ProjectReduxTypes";
import { ExportProjectState } from "components/ProjectExport/Redux/ExportProjectReduxTypes";
import { PronunciationsState } from "components/Pronunciations/Redux/PronunciationsReduxTypes";
import { TreeViewState } from "components/TreeView/Redux/TreeViewReduxTypes";
import { CharacterInventoryState } from "goals/CharacterInventory/Redux/CharacterInventoryReduxTypes";
import { MergeTreeState } from "goals/MergeDuplicates/Redux/MergeDupsReduxTypes";
import { ReviewEntriesState } from "goals/ReviewEntries/ReviewEntriesComponent/Redux/ReviewEntriesReduxTypes";
import { AnalyticsState } from "types/Redux/analyticsReduxTypes";
import { GoalsState } from "types/goals";

//root store structure
export interface StoreState {
  //login
  loginState: LoginState;

  //project
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
