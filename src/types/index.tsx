import { ThunkAction, ThunkDispatch } from "redux-thunk";

import { TempState } from "../components/Temp/TempReducer";
import { TempAction } from "../components/Temp/TempActions";
import { LocalizeState } from "react-localize-redux";
import { LoginState } from "../components/Login/LoginReducer";
import { CreateProjectState } from "../components/CreateProject/CreateProjectReducer";
import { GoalsState, GoalSelectorState } from "./goals";
import { NavState } from "./nav";
import { WordDragState } from "../goals/DraggableWord/reducer";
import { MergeDupStepProps } from "../goals/MergeDupGoal/MergeDupStep/component";
import { CharacterInventoryState } from "../goals/CharInventoryCreation/CharacterInventoryReducer";

//root store structure
export interface StoreState {
  localize: LocalizeState;
  tempState: TempState;
  loginState: LoginState;
  draggedWordState: WordDragState;
  createProjectState: CreateProjectState;
  mergeDupStepProps: MergeDupStepProps;
  goalsState: GoalsState;
  navState: NavState;
  characterInventoryState: CharacterInventoryState;
  goalSelectorState: GoalSelectorState;
}

//root action type
export type TCActions = TempAction; // | otherActions;

//thunk types
export type TCThunkResult<R> = ThunkAction<R, StoreState, null, TCActions>;
export type TCThunkDispatch = ThunkDispatch<StoreState, null, TCActions>;
