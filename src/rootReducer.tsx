import { combineReducers, Reducer } from "redux";

import { StoreState } from "./types";
import { tempReducer } from "./components/Temp/TempReducer";
import { goalsReducer } from "./components/GoalView/GoalViewReducers";
import { navReducer } from "./components/Nav/navReducer";
import { localizeReducer } from "react-localize-redux";
import { dragWordReducer } from "./goals/DraggableWord/reducer";
import { mergeDupStepReducer } from "./goals/MergeDupGoal/MergeDupStep/reducer";
import { loginReducer } from "./components/Login/LoginReducer";
import { createProjectReducer } from "./components/CreateProject/CreateProjectReducer";

export const rootReducer: Reducer<StoreState> = combineReducers<StoreState>({
  localize: localizeReducer,
  tempState: tempReducer,
  mergeDupStepProps: mergeDupStepReducer,
  loginState: loginReducer,
  draggedWord: dragWordReducer
  createProjectState: createProjectReducer,
  goalsState: goalsReducer,
  navState: navReducer
});
