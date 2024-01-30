import { defaultState as goalTimelineState } from "components/GoalTimeline/DefaultState";
import { defaultState as loginState } from "components/Login/Redux/LoginReduxTypes";
import { defaultState as currentProjectState } from "components/Project/ProjectReduxTypes";
import { defaultState as exportProjectState } from "components/ProjectExport/Redux/ExportProjectReduxTypes";
import { defaultState as pronunciationsState } from "components/Pronunciations/Redux/PronunciationsReduxTypes";
import { defaultState as treeViewState } from "components/TreeView/Redux/TreeViewReduxTypes";
import { defaultState as characterInventoryState } from "goals/CharacterInventory/Redux/CharacterInventoryReduxTypes";
import { defaultState as mergeDuplicateGoal } from "goals/MergeDuplicates/Redux/MergeDupsReduxTypes";
import { defaultState as analyticsState } from "types/Redux/analyticsReduxTypes";

export const defaultState = {
  //login and signup
  loginState: { ...loginState },

  //project
  currentProjectState: { ...currentProjectState },
  exportProjectState: { ...exportProjectState },

  //data entry and review entries goal
  treeViewState: { ...treeViewState },
  pronunciationsState: { ...pronunciationsState },

  //goal timeline and current goal
  goalsState: { ...goalTimelineState },

  //merge duplicates goal and review deferred duplicates goal
  mergeDuplicateGoal: { ...mergeDuplicateGoal },

  //character inventory goal
  characterInventoryState: { ...characterInventoryState },

  //analytics state
  analyticsState: { ...analyticsState },
};
