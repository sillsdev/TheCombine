import TreeSemanticDomain from "components/TreeView/TreeSemanticDomain";
import {
  TreeViewAction,
  TreeActionType,
} from "components/TreeView/TreeViewActions";
import { StoreAction, StoreActionTypes } from "rootActions";

export interface TreeViewState {
  currentDomain: TreeSemanticDomain;
}

// Parses a list of semantic domains (to be received from backend)
export function createDomains(data: TreeSemanticDomain[]): TreeViewState {
  let state: TreeViewState = {
    currentDomain: {
      ...defaultState.currentDomain,
      subdomains: data,
    },
  };
  addParentDomains(state.currentDomain);
  // while (state.currentDomain.subDomains.length > 0)
  //   state.currentDomain = state.currentDomain.subDomains[0];
  return state;
}

// Adds the parent domains to the information sent by the backend
function addParentDomains(parent: TreeSemanticDomain) {
  if (parent.subdomains) {
    for (const domain of parent.subdomains) {
      domain.parentDomain = parent;
      addParentDomains(domain);
    }
  }
  //else parent.subDomains = [];
}

// Creates a dummy default state
export const defaultState: TreeViewState = {
  currentDomain: new TreeSemanticDomain(),
};

export const treeViewReducer = (
  state: TreeViewState = defaultState,
  action: StoreAction | TreeViewAction
): TreeViewState => {
  switch (action.type) {
    case TreeActionType.TRAVERSE_TREE:
      return { ...state, currentDomain: action.payload };
    case StoreActionTypes.RESET:
      return defaultState;
    default:
      return state;
  }
};
