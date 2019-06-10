import { CREATE_PROJECT, CreateProjectAction } from "./CreateProjectActions";

export interface CreateProjectState {
  name: string;
  success: boolean;
}

export const defaultState: CreateProjectState = {
  name: "",
  success: false
};

export const createProjectReducer = (
  state: CreateProjectState | undefined, //createStore() calls each reducer with undefined state
  action: CreateProjectAction
): CreateProjectState => {
  if (!state) return defaultState;
  switch (action.type) {
    case CREATE_PROJECT:
      console.log("CREATE PROJECT METHOD");
      return { name: action.payload.name, success: true };
    default:
      return state;
  }
};
