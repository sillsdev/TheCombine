import { combineReducers, Reducer } from "redux";

import { StoreState } from "./types";
import { tempReducer } from "./components/Temp/TempReducer";
import { goalsReducer } from "./components/GoalTimeline/GoalTimelineReducers";
import { navReducer } from "./components/Navigation/NavigationReducer";
import { localizeReducer } from "react-localize-redux";
import { dragWordReducer } from "./goals/DraggableWord/reducer";
import { mergeDupStepReducer } from "./goals/MergeDupGoal/MergeDupStep/reducer";
import { loginReducer } from "./components/Login/LoginReducer";
import { createProjectReducer } from "./components/CreateProject/CreateProjectReducer";
import { characterInventoryReducer } from "./goals/CharInventoryCreation/CharacterInventoryReducer";
import { goalSelectReducer } from "./components/GoalTimeline/GoalSwitcher/GoalSelectorScroll/GoalSelectorReducer";
import { projectReducer } from "./components/Project/ProjectReducer";

export const rootReducer: Reducer<StoreState> = combineReducers<StoreState>({
  //handles localization through react-localize-redux utilities
  localize: localizeReducer,

  //intro windows
  loginState: loginReducer,
  createProjectState: createProjectReducer,

  //general cleanup tools
  goalSelectorState: goalSelectReducer,
  goalsState: goalsReducer,
  navState: navReducer,

  //merge duplicates goal
  draggedWordState: dragWordReducer,
  mergeDupStepProps: mergeDupStepReducer,

  //character inventory goal
  characterInventoryState: characterInventoryReducer,

  currentProject: projectReducer,

  //temporary
  tempState: tempReducer
});
