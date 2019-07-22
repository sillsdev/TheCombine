import { TreeViewAction, TreeActionType } from "./TreeViewActions";
import SemanticDomain from "./SemanticDomain";
import { StoreAction, StoreActions } from "../../rootActions";

export interface TreeViewState {
  currentdomain: SemanticDomain;
}

// Parses a list of semantic domains (to be received from backend)
export function createDomains(data: SemanticDomain[]): TreeViewState {
  let state: TreeViewState = {
    currentdomain: {
      name: "Semantic Domains",
      id: "",
      subdomains: data
    }
  };
  addParentDomains(state.currentdomain);
  // while (state.currentDomain.subDomains.length > 0)
  //   state.currentDomain = state.currentDomain.subDomains[0];
  return state;
}

// Adds the parent domains to the information sent by the backend
function addParentDomains(parent: SemanticDomain) {
  if (parent.subdomains)
    for (let domain of parent.subdomains) {
      domain.parentDomain = parent;
      addParentDomains(domain);
    }
  //else parent.subDomains = [];
}

// Creates a dummy default state
export const defaultState: TreeViewState = { currentdomain: { name: "", id: "", subdomains: [] } };

export const treeViewReducer = (
  state: TreeViewState = defaultState,
  action: StoreAction | TreeViewAction
): TreeViewState => {
  switch (action.type) {
    case TreeActionType.TRAVERSE_TREE:
      return { ...state, currentdomain: action.payload };
    case StoreActions.RESET:
      return defaultState;
    default:
      return state;
  }
};
