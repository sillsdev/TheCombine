import {
  TreeViewAction,
  TreeActionType,
  TreeViewState,
  defaultState,
} from "components/TreeView/Redux/TreeViewReduxTypes";
import { StoreAction, StoreActionTypes } from "rootActions";

export const treeViewReducer = (
  state: TreeViewState = defaultState,
  action: StoreAction | TreeViewAction
): TreeViewState => {
  switch (action.type) {
    case TreeActionType.CLOSE_TREE:
      return { ...state, open: false };
    case TreeActionType.OPEN_TREE:
      return { ...state, open: true };
    case TreeActionType.RESET_TREE:
      return defaultState;
    case TreeActionType.SET_DOMAIN_LANGUAGE:
      if (!action.language) {
        throw new Error("Cannot set domain language to undefined.");
      }
      return {
        ...state,
        currentDomain: { ...state.currentDomain, lang: action.language },
        language: action.language,
      };
    case TreeActionType.SET_CURRENT_DOMAIN:
      if (!action.domain) {
        throw new Error("Cannot set the current domain to undefined.");
      }
      return { ...state, currentDomain: action.domain };
    case StoreActionTypes.RESET:
      return defaultState;
    default:
      return state;
  }
};
