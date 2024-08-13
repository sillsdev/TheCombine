import { Fragment, type ReactElement, useEffect } from "react";
import { Key } from "ts-key-enum";

import { type SemanticDomain, type SemanticDomainTreeNode } from "api/models";

export interface TreeNavigatorProps {
  currentDomain: SemanticDomainTreeNode;
  animate: (domain: SemanticDomain) => Promise<void>;
}

export default function TreeNavigator(props: TreeNavigatorProps): ReactElement {
  const {
    getCurrent,
    getFirstChild,
    getNextSibling,
    getParent,
    getPrevSibling,
  } = useTreeNavigation(props);

  // Navigate tree via arrow keys.
  const getKeyDomain = (e: KeyboardEvent): SemanticDomain | undefined => {
    const rtl = document.body.dir === "rtl";
    switch (e.key) {
      case Key.ArrowLeft:
        return rtl ? getNextSibling() : getPrevSibling();
      case Key.ArrowRight:
        return rtl ? getPrevSibling() : getNextSibling();
      case Key.ArrowUp:
        return getParent();
      case Key.ArrowDown:
        return getFirstChild();
      case Key.Enter:
        return getCurrent();
    }
  };

  const navigateDomainByKey = async (e: KeyboardEvent): Promise<void> => {
    const domain = getKeyDomain(e);
    if (domain) {
      await props.animate(domain);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", navigateDomainByKey);
    return () => window.removeEventListener("keydown", navigateDomainByKey);
  });

  return <Fragment />;
}

interface TreeNavigation {
  getCurrent: () => SemanticDomain | undefined;
  getFirstChild: () => SemanticDomain | undefined;
  getNextSibling: () => SemanticDomain | undefined;
  getParent: () => SemanticDomain | undefined;
  getPrevSibling: () => SemanticDomain | undefined;
}

// Export for unit testing.
export function useTreeNavigation(props: TreeNavigatorProps): TreeNavigation {
  const dom = props.currentDomain;
  return {
    getCurrent: () => dom,
    getFirstChild: () => (dom.children.length ? dom.children[0] : undefined),
    getNextSibling: () => dom.next,
    getParent: () => dom.parent,
    getPrevSibling: () => dom.previous,
  };
}
