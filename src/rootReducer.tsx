import { combineReducers, Reducer } from "redux";

import { StoreState } from "./types";
import { tempReducer } from "./components/Temp/TempReducer";
import { goalsReducer } from "./components/GoalView/GoalUIReducer";
import { localizeReducer } from "react-localize-redux";
import { loginReducer } from "./components/Login/LoginReducer";
import { createProjectReducer } from "./components/CreateProject/CreateProjectReducer";

export const rootReducer: Reducer<StoreState> = combineReducers<StoreState>({
  localize: localizeReducer,
  tempState: tempReducer,
  loginState: loginReducer,
  createProjectState: createProjectReducer,
  goalsState: goalsReducer
});
