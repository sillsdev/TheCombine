import { Button, ImageList, ImageListItem } from "@mui/material";
import { ReactElement, useCallback, useEffect } from "react";
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
  const { getPrevSibling, getNextSibling } = useTreeNavigation(props);
  const prevSib = getPrevSibling(props);
  const nextSib = getNextSibling(props);

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
          disabled={!props.currentDomain.parent}
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
  getNextSibling: (props: TreeHeaderProps) => SemanticDomain | undefined;
  getPrevSibling: (props: TreeHeaderProps) => SemanticDomain | undefined;
}

// exported for unit testing only
export function useTreeNavigation(props: TreeHeaderProps): TreeNavigation {
  const { animate, currentDomain } = props;

  // Navigate tree via arrow keys
  const getArrowKeyDomain = useCallback(
    (e: KeyboardEvent): SemanticDomain | undefined => {
      const rtl = document.body.dir === "rtl";
      switch (e.key) {
        case Key.ArrowLeft:
          return rtl ? currentDomain.next : currentDomain.previous;
        case Key.ArrowRight:
          return rtl ? currentDomain.previous : currentDomain.next;
        case Key.ArrowUp:
          return currentDomain.parent;
        case Key.ArrowDown:
          if (currentDomain.children.length === 1) {
            return currentDomain.children[0];
          }
      }
    },
    [currentDomain]
  );

  const navigateDomainArrowKeys = useCallback(
    async (e: KeyboardEvent): Promise<void> => {
      const domain = getArrowKeyDomain(e);
      if (domain) {
        await animate(domain);
      }
    },
    [animate, getArrowKeyDomain]
  );

  // Add event listeners
  useEffect(() => {
    window.addEventListener("keydown", navigateDomainArrowKeys);
    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener("keydown", navigateDomainArrowKeys);
    };
  }, [navigateDomainArrowKeys]);

  return {
    getNextSibling: (props: TreeHeaderProps) => props.currentDomain.next,
    getPrevSibling: (props: TreeHeaderProps) => props.currentDomain.previous,
  };
}
