import TreeSemanticDomain from "components/TreeView/TreeSemanticDomain";
import {
  TreeViewAction,
  TreeActionType,
} from "components/TreeView/TreeViewActions";
import { StoreAction, StoreActionTypes } from "rootActions";

export interface TreeViewState {
  currentDomain: TreeSemanticDomain;
  parentMap: Record<string, TreeSemanticDomain>;
  open: boolean;
}

// Parses a list of semantic domains (to be received from backend)
export function createDomains(data: TreeSemanticDomain[]): {
  currentDomain: TreeSemanticDomain;
  parentMap: Record<string, TreeSemanticDomain>;
} {
  const domains: TreeSemanticDomain = {
    ...defaultState.currentDomain,
    subdomains: data,
  };
  const parentMap = <Record<string, TreeSemanticDomain>>{};
  addParentDomains(domains, parentMap);
  return { currentDomain: domains, parentMap: parentMap };
}

// Adds the parent domains to the information sent by the backend
function addParentDomains(
  parent: TreeSemanticDomain,
  parentMap: Record<string, TreeSemanticDomain>
) {
  if (parent.subdomains) {
    for (const domain of parent.subdomains) {
      parentMap[domain.id] = parent;
      addParentDomains(domain, parentMap);
    }
  }
}

// Creates a dummy default state
export const defaultState: TreeViewState = {
  open: false,
  parentMap: {},
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
      if (!action.domain) {
        throw new Error("Cannot traverse tree without specifying domain.");
      }
      return { ...state, currentDomain: action.domain };
    case TreeActionType.SET_PARENT_MAP:
      if (!action.parentMap) {
        throw new Error("Cannot set parent map, without a parent map");
      }
      return { ...state, parentMap: action.parentMap };
    case StoreActionTypes.RESET:
      return defaultState;
    default:
      return state;
  }
};
