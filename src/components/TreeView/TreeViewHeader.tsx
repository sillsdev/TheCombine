import {
  Button,
  ImageList,
  ImageListItem,
  Typography,
} from "@material-ui/core";
import { useCallback, useEffect } from "react";
import { Key } from "ts-key-enum";

import DomainTile, { Direction } from "components/TreeView/DomainTile";
import TreeSemanticDomain from "components/TreeView/TreeSemanticDomain";

export interface TreeHeaderProps {
  currentDomain: TreeSemanticDomain;
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
            onClick={(e) => {
              props.animate(e);
            }}
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
          disabled={!props.currentDomain.parentDomain}
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
            onClick={(e) => {
              props.animate(e);
            }}
            direction={Direction.Right}
          />
        ) : null}
      </ImageListItem>
    </ImageList>
  );
}

// exported for unit testing only
export function useTreeNavigation(props: TreeHeaderProps) {
  // Gets the domain 'navigationAmount' away from the currentDomain (negative to the left, positive to the right)
  function getBrotherDomain(
    navigationAmount: number,
    props: TreeHeaderProps
  ): TreeSemanticDomain | undefined {
    if (props.currentDomain.parentDomain) {
      const brotherDomains = props.currentDomain.parentDomain.subdomains;
      let index = brotherDomains.findIndex(
        (domain) => props.currentDomain.id === domain.id
      );

      index += navigationAmount;
      if (0 <= index && index < brotherDomains.length) {
        return brotherDomains[index];
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
      const domain =
        event.key === Key.ArrowLeft
          ? getBrotherDomain(-1, props)
          : event.key === Key.ArrowRight
          ? getBrotherDomain(1, props)
          : event.key === Key.ArrowUp
          ? props.currentDomain.parentDomain
          : undefined;
      if (domain && domain.id !== props.currentDomain.id) {
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
