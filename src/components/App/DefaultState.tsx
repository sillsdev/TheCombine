import { defaultState as characterInventoryState } from "../../goals/CharInventoryCreation/CharacterInventoryReducer";
import { defaultState as mergeDuplicateGoal } from "../../goals/MergeDupGoal/MergeDupStep/MergeDupStepReducer";
import { defaultState as reviewEntriesState } from "../../goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesReducer";
import { defaultProject } from "../../types/project";
import { defaultState as loginState } from "../Login/LoginReducer";
import { defaultState as goalTimelineState } from "../GoalTimeline/DefaultState";
import { defaultState as goalSelectorState } from "../GoalTimeline/GoalSelectorScroll/GoalSelectorReducer";
import { defaultState as passwordResetState } from "../PasswordReset/reducer";
import { defaultState as exportProjectState } from "../ProjectExport/ExportProjectReducer";
import { defaultState as createProjectState } from "../ProjectScreen/CreateProject/CreateProjectReducer";
import { defaultState as pronunciationsState } from "../Pronunciations/PronunciationsReducer";
import { defaultState as treeViewState } from "../TreeView/TreeViewReducer";

export const defaultState = {
  //login
  loginState: {
    ...loginState,
  },
  passwordResetState: {
    ...passwordResetState,
  },

  //project
  createProjectState: {
    ...createProjectState,
    name: "Test",
    success: true,
  },
  currentProject: {
    ...defaultProject,
    name: "Project",
  },
  exportProjectState: {
    ...exportProjectState,
  },

  //data entry and review entries
  treeViewState: {
    ...treeViewState,
  },
  reviewEntriesState: {
    ...reviewEntriesState,
  },
  pronunciationsState: {
    ...pronunciationsState,
  },

  //general cleanup tools
  goalSelectorState: {
    ...goalSelectorState,
  },
  goalsState: {
    ...goalTimelineState,
  },

  //merge duplicates goal
  mergeDuplicateGoal: {
    ...mergeDuplicateGoal,
  },

  //character inventory goal
  characterInventoryState: {
    ...characterInventoryState,
  },
};
