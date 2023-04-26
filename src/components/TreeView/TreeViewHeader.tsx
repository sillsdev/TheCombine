import { Button, ImageList, ImageListItem } from "@mui/material";
import { useCallback, useEffect } from "react";
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

export function TreeViewHeader(props: TreeHeaderProps) {
  const { getPrevSibling, getNextSibling } = useTreeNavigation(props);

  return (
    <ImageList cols={7} gap={20} rowHeight={"auto"}>
      <ImageListItem cols={2}>
        {getPrevSibling(props) ? (
          <DomainTile
            domain={getPrevSibling(props)!}
            onClick={props.animate}
            direction={Direction.Left}
          />
        ) : null}
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
        {getNextSibling(props) ? (
          <DomainTile
            domain={getNextSibling(props)!}
            onClick={props.animate}
            direction={Direction.Right}
          />
        ) : null}
      </ImageListItem>
    </ImageList>
  );
}

// exported for unit testing only
export function useTreeNavigation(props: TreeHeaderProps) {
  function getNextSibling(props: TreeHeaderProps): SemanticDomain | undefined {
    return props.currentDomain.next;
  }

  function getPrevSibling(props: TreeHeaderProps): SemanticDomain | undefined {
    return props.currentDomain.previous;
  }

  // Navigate tree via arrow keys
  const navigateDomainArrowKeys = useCallback(
    (event: KeyboardEvent) => {
      const rtl = document.body.dir === "rtl";
      let domain: SemanticDomain | undefined;
      switch (event.key) {
        case Key.ArrowLeft:
          domain = rtl ? getNextSibling(props) : getPrevSibling(props);
          break;
        case Key.ArrowRight:
          domain = rtl ? getPrevSibling(props) : getNextSibling(props);
          break;
        case Key.ArrowUp:
          if (props.currentDomain.parent !== undefined) {
            domain = props.currentDomain.parent;
          }
          break;
        case Key.ArrowDown:
          if (props.currentDomain.children.length === 1) {
            domain = props.currentDomain.children[0];
          }
          break;
      }
      if (domain) {
        props.animate(domain);
      }
    },
    [props]
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
    getNextSibling,
    getPrevSibling,
  };
}
