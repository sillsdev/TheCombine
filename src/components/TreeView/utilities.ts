import {
  type SemanticDomainFull,
  type SemanticDomainTreeNode,
} from "api/models";
import {
  getSemanticDomainTreeNode,
  getSemanticDomainTreeNodeByName,
} from "backend";
import { rootId, treeNodeFromSemDom } from "types/semanticDomain";

// Custom domain helper functions

/** Given an id/name and lang of a semantic domain and an array of custom domains,
 * returns the corresponding SemanticDomainTreeNode, either:
 * - If a custom domain, with parent and next sibling added from database;
 * - Otherwise, from the database, with any custom first child or previous sibling added. */
export async function getAugmentedTreeNode(
  idOrName: string,
  lang: string,
  customDoms: SemanticDomainFull[]
): Promise<SemanticDomainTreeNode | undefined> {
  customDoms = customDoms.filter((d) => d.lang === lang);

  let dom = await createCustomTreeNode(idOrName, customDoms);
  if (dom) {
    return dom;
  }

  dom =
    isNaN(parseInt(idOrName)) && idOrName !== rootId
      ? await getSemanticDomainTreeNodeByName(idOrName, lang)
      : await getSemanticDomainTreeNode(idOrName, lang);
  if (dom) {
    const id = dom.id;
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

/** Given the id of a custom domain and an array of custom domains,
 * return a SemanticDomainTreeNode for the desired custom domain.
 * Returned node includes parent and first sibling pulled from the standard domains.
 * (Note: Assumes that the array of custom domains has already been filtered down to the
 * desired semantic domain language.) */
async function createCustomTreeNode(
  idOrName: string,
  customDoms: SemanticDomainFull[]
): Promise<SemanticDomainTreeNode | undefined> {
  const customDom = isNaN(parseInt(idOrName))
    ? customDoms.find((d) => d.name === idOrName)
    : customDoms.find((d) => d.id === idOrName);

  if (customDom) {
    const id = customDom.id;
    const parentId =
      customDom.parentId ||
      (id.length > 1 ? id.substring(0, id.length - 2) : rootId);
    const parent = await getSemanticDomainTreeNode(parentId, customDom.lang);
    const next = parent?.children.length ? parent.children[0] : undefined;
    return { ...treeNodeFromSemDom(customDom), parent, next };
  }
}
