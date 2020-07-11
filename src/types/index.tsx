import { TempState } from "../components/Temp/TempReducer";
import { LocalizeState } from "react-localize-redux";
import { LoginState } from "../components/Login/LoginReducer";
import { CreateProjectState } from "../components/ProjectScreen/CreateProject/CreateProjectReducer";
import { GoalsState, GoalSelectorState } from "./goals";
import { CharacterInventoryState } from "../goals/CharInventoryCreation/CharacterInventoryReducer";
import { Project } from "./project";
import { MergeDuplicateState } from "../goals/MergeDupGoal/mergeDuplicateReducer";
import { TreeViewState } from "../components/TreeView/TreeViewReducer";
import { ReviewEntriesState } from "../goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesReducer";
import { PasswordResetState } from "../components/PasswordReset/reducer";

//root store structure
export interface StoreState {
  //handles localization through react-localize-redux utilities
  localize: LocalizeState;

  //intro windows
  loginState: LoginState;
  createProjectState: CreateProjectState;
  treeViewState: TreeViewState;

  //general cleanup tools
  goalSelectorState: GoalSelectorState;
  goalsState: GoalsState;

  //merge duplicates goal
  mergeDuplicateGoal: MergeDuplicateState;

  //character inventory goal
  characterInventoryState: CharacterInventoryState;

  currentProject: Project;

  // View Final goal
  reviewEntriesState: ReviewEntriesState;

  // Password Reset
  passwordResetState: PasswordResetState;

  //temporary
  tempState: TempState;
}
