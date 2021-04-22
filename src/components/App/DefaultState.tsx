import { defaultState as characterInventoryState } from "goals/CharInventoryCreation/Redux/CharacterInventoryReducer";
import { defaultState as mergeDuplicateGoal } from "goals/MergeDupGoal/MergeDupStep/Redux/MergeDupStepReducer";
import { defaultState as reviewEntriesState } from "goals/ReviewEntries/ReviewEntriesComponent/Redux/ReviewEntriesReducer";
import { defaultProject } from "types/project";
import { defaultState as analyticsState } from "types/analytics";
import { defaultState as loginState } from "components/Login/Redux/LoginReducer";
import { defaultState as goalTimelineState } from "components/GoalTimeline/DefaultState";
import { defaultState as passwordResetState } from "components/PasswordReset/Redux/ResetReducer";
import { defaultState as exportProjectState } from "components/ProjectExport/ExportProjectReducer";
import { defaultState as createProjectState } from "components/ProjectScreen/CreateProject/Redux/CreateProjectReducer";
import { defaultState as pronunciationsState } from "components/Pronunciations/PronunciationsReducer";
import { defaultState as treeViewState } from "components/TreeView/TreeViewReducer";

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

  //analytics state
  analyticsState: {
    ...analyticsState,
  },
};
