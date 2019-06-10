import React from "react";
import { NavState } from "../../types/nav";
import GoalView from "../GoalView";

export const defaultState: NavState = {
  CurrentComponent: <GoalView />
};
