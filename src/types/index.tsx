import { LocalizeState } from "react-localize-redux";

import { LoginState } from "../components/Login/LoginReducer";
import { PasswordResetState } from "../components/PasswordReset/reducer";
import { ExportProjectState } from "../components/ProjectExport/ExportProjectReducer";
import { CreateProjectState } from "../components/ProjectScreen/CreateProject/CreateProjectReducer";
import { TempState } from "../components/Temp/TempReducer";
import { TreeViewState } from "../components/TreeView/TreeViewReducer";
import { CharacterInventoryState } from "../goals/CharInventoryCreation/CharacterInventoryReducer";
import { MergeTreeState } from "../goals/MergeDupGoal/MergeDupStep/MergeDupStepReducer";
import { ReviewEntriesState } from "../goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesReducer";
import { GoalsState, GoalSelectorState } from "./goals";
import { Project } from "./project";

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

  //data entry
  treeViewState: TreeViewState;

  //general cleanup tools
  goalSelectorState: GoalSelectorState;
  goalsState: GoalsState;

  //merge duplicates goal
  mergeDuplicateGoal: MergeTreeState;

  //character inventory goal
  characterInventoryState: CharacterInventoryState;

  //review entries goal
  reviewEntriesState: ReviewEntriesState;

  //temporary
  tempState: TempState;
}
