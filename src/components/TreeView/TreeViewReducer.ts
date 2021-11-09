import TreeSemanticDomain from "components/TreeView/TreeSemanticDomain";
import {
  TreeViewAction,
  TreeActionType,
} from "components/TreeView/TreeViewActions";
import { StoreAction, StoreActionTypes } from "rootActions";

export interface TreeViewState {
  currentDomain: TreeSemanticDomain;
  open: boolean;
}

// Parses a list of semantic domains (to be received from backend)
export function createDomains(data: TreeSemanticDomain[]): TreeSemanticDomain {
  const domains: TreeSemanticDomain = {
    ...defaultState.currentDomain,
    subdomains: data,
  };
  addParentDomains(domains);
  return domains;
}

// Adds the parent domains to the information sent by the backend
function addParentDomains(parent: TreeSemanticDomain) {
  if (parent.subdomains) {
    for (const domain of parent.subdomains) {
      domain.parentDomain = parent;
      addParentDomains(domain);
    }
  }
}

// Creates a dummy default state
export const defaultState: TreeViewState = {
  open: false,
  currentDomain: new TreeSemanticDomain(),
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
    case TreeActionType.TRAVERSE_TREE:
      if (!action.payload) {
        throw new Error("Cannot traverse tree without specifying domain.");
      }
      return { ...state, currentDomain: action.payload };
    case StoreActionTypes.RESET:
      return defaultState;
    default:
      return state;
  }
};
