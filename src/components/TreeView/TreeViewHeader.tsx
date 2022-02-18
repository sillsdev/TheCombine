import {
  Button,
  ImageList,
  ImageListItem,
  Typography,
} from "@material-ui/core";
import { useCallback, useEffect } from "react";
import { Key } from "ts-key-enum";

import DomainTile, { Direction } from "components/TreeView/DomainTile";
import TreeSemanticDomain, {
  DomainMap,
} from "components/TreeView/TreeSemanticDomain";

export interface TreeHeaderProps {
  currentDomain: TreeSemanticDomain;
  domainMap: DomainMap;
  animate: (domain: TreeSemanticDomain) => Promise<void>;
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
          disabled={props.currentDomain.parentId === undefined}
          onClick={() => props.animate(props.currentDomain)}
          id="current-domain"
          style={{ height: "95%" }}
        >
          <div style={{ textTransform: "capitalize", minWidth: 200 }}>
            <Typography variant="overline">{props.currentDomain.id}</Typography>
            <Typography variant="h6">{props.currentDomain.name}</Typography>
          </div>
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
  // Gets the domain 'navigationAmount' away from the currentDomain
  // negative to the left, positive to the right
  function getBrotherDomain(
    navigationAmount: number,
    props: TreeHeaderProps
  ): TreeSemanticDomain | undefined {
    if (props.currentDomain.parentId !== undefined) {
      const brotherIds = props.domainMap[props.currentDomain.parentId].childIds;
      const brothers = brotherIds.map((id) => props.domainMap[id]);
      let index = brothers.findIndex((d) => d.id === props.currentDomain.id);
      index += navigationAmount;
      if (0 <= index && index < brothers.length) {
        return brothers[index];
      }
    }
    // No brother domain navigationAmount over from currentDomain
    return undefined;
  }

  function getRightBrother(
    props: TreeHeaderProps
  ): TreeSemanticDomain | undefined {
    return getBrotherDomain(1, props);
  }

  function getLeftBrother(
    props: TreeHeaderProps
  ): TreeSemanticDomain | undefined {
    return getBrotherDomain(-1, props);
  }

  // Navigate tree via arrow keys
  const navigateDomainArrowKeys = useCallback(
    (event: KeyboardEvent) => {
      let domain: TreeSemanticDomain | undefined;
      switch (event.key) {
        case Key.ArrowLeft:
          domain = getBrotherDomain(-1, props);
          break;
        case Key.ArrowRight:
          domain = getBrotherDomain(1, props);
          break;
        case Key.ArrowUp:
          if (props.currentDomain.parentId !== undefined) {
            domain = props.domainMap[props.currentDomain.parentId];
          }
          break;
        case Key.ArrowDown:
          if (props.currentDomain.childIds.length === 1) {
            domain = props.domainMap[props.currentDomain.childIds[0]];
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
