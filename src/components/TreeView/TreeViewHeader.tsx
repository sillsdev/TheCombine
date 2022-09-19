import { Button, ImageList, ImageListItem } from "@material-ui/core";
import { useCallback, useEffect } from "react";
import { Key } from "ts-key-enum";

import { SemanticDomain, SemanticDomainTreeNode } from "api";
import DomainTile, {
  domainText,
  Direction,
} from "components/TreeView/DomainTile";

export interface TreeHeaderProps {
  currentDomain: SemanticDomainTreeNode;
  animate: (domain: SemanticDomainTreeNode) => Promise<void>;
}

export function TreeViewHeader(props: TreeHeaderProps) {
  const { getLeftBrother, getRightBrother } = useTreeNavigation(props);

  return (
    <ImageList cols={7} gap={20} rowHeight={"auto"}>
      <ImageListItem cols={2}>
        {getLeftBrother(props) ? (
          <DomainTile
            domain={getLeftBrother(props)!}
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
          {domainText(props.currentDomain, { minWidth: 200 })}
        </Button>
      </ImageListItem>
      <ImageListItem cols={2}>
        {getRightBrother(props) ? (
          <DomainTile
            domain={getRightBrother(props)!}
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
  function getRightBrother(props: TreeHeaderProps): SemanticDomain | undefined {
    return props.currentDomain.next;
  }

  function getLeftBrother(props: TreeHeaderProps): SemanticDomain | undefined {
    return props.currentDomain.previous;
  }

  // Navigate tree via arrow keys
  const navigateDomainArrowKeys = useCallback(
    (event: KeyboardEvent) => {
      let domain: SemanticDomainTreeNode | undefined;
      switch (event.key) {
        case Key.ArrowLeft:
          domain = getLeftBrother(props);
          break;
        case Key.ArrowRight:
          domain = getRightBrother(props);
          break;
        case Key.ArrowUp:
          if (props.currentDomain.parent !== undefined) {
            domain = props.currentDomain.parent;
          }
          break;
        case Key.ArrowDown:
          if (
            props.currentDomain.children &&
            props.currentDomain.children.length === 1
          ) {
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
    getRightBrother,
    getLeftBrother,
  };
}
