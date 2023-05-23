import { Button, ImageList, ImageListItem } from "@mui/material";
import { ReactElement, useEffect } from "react";
import { Key } from "ts-key-enum";

import { SemanticDomain, SemanticDomainTreeNode } from "api";
import DomainTile, {
  DomainText,
  Direction,
} from "components/TreeView/DomainTile";

export interface TreeHeaderProps {
  currentDomain: SemanticDomainTreeNode;
  animate: (domain: SemanticDomain) => Promise<void>;
}

export function TreeViewHeader(props: TreeHeaderProps): ReactElement {
  const { getNextSibling, getOnlyChild, getParent, getPrevSibling } =
    useTreeNavigation(props);
  const nextSib = getNextSibling();
  const prevSib = getPrevSibling();

  // Navigate tree via arrow keys.
  const getArrowKeyDomain = (e: KeyboardEvent): SemanticDomain | undefined => {
    const rtl = document.body.dir === "rtl";
    switch (e.key) {
      case Key.ArrowLeft:
        return rtl ? nextSib : prevSib;
      case Key.ArrowRight:
        return rtl ? prevSib : nextSib;
      case Key.ArrowUp:
        return getParent();
      case Key.ArrowDown:
        return getOnlyChild();
    }
  };

  const navigateDomainArrowKeys = async (e: KeyboardEvent): Promise<void> => {
    const domain = getArrowKeyDomain(e);
    if (domain) {
      await props.animate(domain);
    }
  };

  // Add event listeners.
  useEffect(() => {
    window.addEventListener("keydown", navigateDomainArrowKeys);
    // Remove event listeners on cleanup.
    return () => {
      window.removeEventListener("keydown", navigateDomainArrowKeys);
    };
  });

  return (
    <ImageList cols={7} gap={20} rowHeight={"auto"}>
      <ImageListItem cols={2}>
        {prevSib && (
          <DomainTile
            domain={prevSib}
            onClick={props.animate}
            direction={Direction.Prev}
          />
        )}
      </ImageListItem>
      <ImageListItem cols={3}>
        <Button
          fullWidth
          size="large"
          color="primary"
          variant="contained"
          disabled={!getParent()}
          onClick={() => props.animate(props.currentDomain)}
          id="current-domain"
          style={{ height: "95%" }}
        >
          <DomainText
            domain={props.currentDomain}
            extraProps={{ minWidth: 200 }}
          />
        </Button>
      </ImageListItem>
      <ImageListItem cols={2}>
        {nextSib && (
          <DomainTile
            domain={nextSib}
            onClick={props.animate}
            direction={Direction.Next}
          />
        )}
      </ImageListItem>
    </ImageList>
  );
}

interface TreeNavigation {
  getNextSibling: () => SemanticDomain | undefined;
  getOnlyChild: () => SemanticDomain | undefined;
  getParent: () => SemanticDomain | undefined;
  getPrevSibling: () => SemanticDomain | undefined;
}

// Export for unit testing.
export function useTreeNavigation(props: TreeHeaderProps): TreeNavigation {
  const dom = props.currentDomain;
  return {
    getNextSibling: () => dom.next,
    getOnlyChild: () =>
      dom.children.length === 1 ? dom.children[0] : undefined,
    getParent: () => dom.parent,
    getPrevSibling: () => dom.previous,
  };
}
