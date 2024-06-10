import { Action, PayloadAction } from "@reduxjs/toolkit";

import {
  SemanticDomain,
  SemanticDomainFull,
  SemanticDomainTreeNode,
} from "api/models";
import { getSemanticDomainTreeNode } from "backend";
import {
  resetTreeAction,
  setCurrentDomainAction,
  setDomainLanguageAction,
  setTreeOpenAction,
} from "components/TreeView/Redux/TreeViewReducer";
import { rootId } from "components/TreeView/Redux/TreeViewReduxTypes";
import { StoreState } from "types";
import { StoreStateDispatch } from "types/Redux/actions";
import { treeNodeFromSemDom } from "types/semanticDomain";

// Action Creation Functions

export function closeTree(): PayloadAction {
  return setTreeOpenAction(false);
}

export function openTree(): PayloadAction {
  return setTreeOpenAction(true);
}

export function resetTree(): Action {
  return resetTreeAction();
}

export function setCurrentDomain(
  domain: SemanticDomainTreeNode
): PayloadAction {
  return setCurrentDomainAction(domain);
}

export function setDomainLanguage(language: string): PayloadAction {
  return setDomainLanguageAction(language);
}

// Dispatch Functions

export function traverseTree(domain: SemanticDomain) {
  return async (dispatch: StoreStateDispatch, getState: () => StoreState) => {
    const { id, lang } = domain;
    if (id) {
      const customDoms =
        getState().currentProjectState.project.semanticDomains.filter(
          (d) => d.lang === lang
        );
      const domain =
        id[id.length - 1] === "0"
          ? await createCustomTreeNode(id, customDoms)
          : await getAugmentedTreeNode(id, lang, customDoms);
      if (domain) {
        dispatch(setCurrentDomain(domain));
      }
    }
  };
}

export function initTreeDomain(lang = "") {
  return async (dispatch: StoreStateDispatch, getState: () => StoreState) => {
    await dispatch(
      traverseTree({ ...getState().treeViewState.currentDomain, lang })
    );
  };
}

// Custom domain helper functions

async function getAugmentedTreeNode(
  id: string,
  lang: string,
  customDoms: SemanticDomainFull[]
): Promise<SemanticDomainTreeNode | undefined> {
  const dom = await getSemanticDomainTreeNode(id, lang);
  if (dom) {
    const childId = id === rootId ? "0" : `${id}.0`;
    const customChild = customDoms.find((d) => d.id === childId);
    if (customChild) {
      dom.children = [customChild, ...dom.children];
    }
    if (id[id.length - 1] === "1") {
      const previousId = `${id.substring(0, id.length - 1)}0`;
      dom.previous = customDoms.find((d) => d.id === previousId);
    }
    return dom;
  }
}

async function createCustomTreeNode(
  id: string,
  customDoms: SemanticDomainFull[]
): Promise<SemanticDomainTreeNode | undefined> {
  const customDom = customDoms.find((d) => d.id === id);
  if (customDom) {
    const parentId = id.length > 1 ? id.substring(0, id.length - 2) : rootId;
    const parent = await getSemanticDomainTreeNode(parentId, customDom.lang);
    const next = parent?.children.length ? parent.children[0] : undefined;
    return { ...treeNodeFromSemDom(customDom), parent, next };
  }
}
