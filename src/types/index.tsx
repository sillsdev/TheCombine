import { ThunkAction, ThunkDispatch } from "redux-thunk";

import { TempState } from "../components/Temp/TempReducer";
import { TempAction } from "../components/Temp/TempActions";
import { LocalizeState } from "react-localize-redux";
import { LoginState } from "../components/Login/LoginReducer";
import { CreateProjectState } from "../components/CreateProject/CreateProjectReducer";
import { GoalsState } from "./goals";
import { NavState } from "./nav";

//root store structure
export interface StoreState {
  localize: LocalizeState;
  tempState: TempState;
  loginState: LoginState;
  draggedWord: WordDragState;
  createProjectState: CreateProjectState;
  mergeDupStepProps: MergeDupStepProps;
  goalsState: GoalsState;
  navState: NavState;
}

//root action type
export type TCActions = TempAction; // | otherActions;

//thunk types
export type TCThunkResult<R> = ThunkAction<R, StoreState, null, TCActions>;
export type TCThunkDispatch = ThunkDispatch<StoreState, null, TCActions>;
