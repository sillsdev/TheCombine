import TreeSemanticDomain, {
  DomainMap,
} from "components/TreeView/TreeSemanticDomain";
import {
  TreeViewAction,
  TreeActionType,
} from "components/TreeView/TreeViewActions";
import { StoreAction, StoreActionTypes } from "rootActions";

export interface TreeViewState {
  currentDomain: TreeSemanticDomain;
  domainMap: DomainMap;
  language: string;
  open: boolean;
}

export const defaultState: TreeViewState = {
  language: "",
  open: false,
  currentDomain: new TreeSemanticDomain(),
  domainMap: {},
};

export const treeViewReducer = (
  state: TreeViewState = defaultState,
  action: StoreAction | TreeViewAction
): TreeViewState => {
  switch (action.type) {
    case TreeActionType.CLOSE_TREE:
      return { ...state, open: false };
    case TreeActionType.OPEN_TREE:
      return { ...state, open: true };
    case TreeActionType.SET_DOMAIN_MAP:
      if (!action.domainMap || !action.language) {
        throw new Error(
          "Cannot set domain map without a domain map and language."
        );
      }
      return {
        ...state,
        currentDomain: action.domainMap[state.currentDomain.id],
        domainMap: action.domainMap,
        language: action.language,
      };
    case TreeActionType.TRAVERSE_TREE:
      if (!action.domain) {
        throw new Error("Cannot traverse tree without specifying domain.");
      }
      return { ...state, currentDomain: action.domain };
    case StoreActionTypes.RESET:
      return defaultState;
    default:
      return state;
  }
};
