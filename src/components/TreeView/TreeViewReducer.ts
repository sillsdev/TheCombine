import { TreeViewAction, TreeActionType } from "./TreeViewActions";
import { StoreAction, StoreActions } from "../../rootActions";
import SemanticDomainWithSubdomains, {
  baseDomain,
} from "../../types/SemanticDomain";

export interface TreeViewState {
  currentDomain: SemanticDomainWithSubdomains;
}

export const idToDomainMap = new Map<string, SemanticDomainWithSubdomains>();

// Parses a list of semantic domains (to be received from backend)
export function createDomains(
  data: SemanticDomainWithSubdomains[]
): TreeViewState {
  let state: TreeViewState = {
    currentDomain: {
      ...defaultState.currentDomain,
      subdomains: data,
    },
  };
  addParentDomains(state.currentDomain, idToDomainMap);
  return state;
}

// Adds the parent domains to the information sent by the backend
export function addParentDomains(
  parent: SemanticDomainWithSubdomains,
  idToDomainMap: Map<string, SemanticDomainWithSubdomains>
) {
  idToDomainMap.set(parent.id, parent);
  if (parent.subdomains)
    for (let domain of parent.subdomains) {
      domain.parentDomain = parent.id;
      addParentDomains(domain, idToDomainMap);
    }
}

// Creates a dummy default state
export const defaultState: TreeViewState = {
  currentDomain: baseDomain,
};

export const treeViewReducer = (
  state: TreeViewState = defaultState,
  action: StoreAction | TreeViewAction
): TreeViewState => {
  switch (action.type) {
    case TreeActionType.TRAVERSE_TREE:
      return { ...state, currentDomain: action.payload };
    case StoreActions.RESET:
      return defaultState;
    default:
      return state;
  }
};
