import {
  Button,
  Card,
  GridList,
  GridListTile,
  TextField,
  Typography,
} from "@material-ui/core";
import React, { useCallback, useEffect, useState } from "react";
import Bounce from "react-reveal/Bounce";
import { Key } from "ts-key-enum";

import DomainTile, { Direction } from "components/TreeView/DomainTile";
import TreeSemanticDomain from "components/TreeView/TreeSemanticDomain";

export interface TreeHeaderProps {
  currentDomain: TreeSemanticDomain;
  animate: (domain: TreeSemanticDomain) => Promise<void>;
  bounceState: number;
  bounce: () => void;
}

export function TreeViewHeader(props: TreeHeaderProps) {
  const {
    getLeftBrother,
    getRightBrother,
    searchAndSelectDomain,
    handleChange,
  } = useTreeViewNavigation(props);

  return (
    <GridList cols={9} spacing={20} cellHeight={"auto"}>
      <GridListTile cols={2}>
        {getLeftBrother(props) ? (
          <DomainTile
            domain={getLeftBrother(props)!}
            onClick={(e) => {
              props.animate(e);
              props.bounce();
            }}
            direction={Direction.Left}
          />
        ) : null}
      </GridListTile>
      <GridListTile cols={5}>
        <Card>
          <Bounce spy={props.bounceState} duration={2000}>
            <Button
              fullWidth
              size="large"
              color="primary"
              variant="contained"
              disabled={!props.currentDomain.parentDomain}
              onClick={() => props.animate(props.currentDomain)}
            >
              <div style={{ textTransform: "capitalize" }}>
                <Typography variant="overline">
                  {props.currentDomain.id}
                </Typography>
                <Typography variant="h6">{props.currentDomain.name}</Typography>
              </div>
            </Button>
          </Bounce>
          <TextField
            fullWidth
            id="name"
            label="Find a domain"
            onKeyDown={searchAndSelectDomain}
            onChange={handleChange}
            margin="normal"
            autoComplete="off"
            inputProps={{
              "data-testid": "testSearch",
            }}
          />
        </Card>
      </GridListTile>
      <GridListTile cols={2}>
        {getRightBrother(props) ? (
          <DomainTile
            domain={getRightBrother(props)!}
            onClick={(e) => {
              props.animate(e);
              props.bounce();
            }}
            direction={Direction.Right}
          />
        ) : null}
      </GridListTile>
    </GridList>
  );
}

// exported for unit testing only
export function useTreeViewNavigation(props: TreeHeaderProps) {
  const [input, setInput] = useState(props.currentDomain.id);
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

  // Search for a semantic domain by number
  function searchDomainByNumber(
    parent: TreeSemanticDomain,
    number: string
  ): TreeSemanticDomain | undefined {
    for (const domain of parent.subdomains)
      if (domain.id === number) {
        return domain;
      }
    if (parent.id === number) {
      return parent;
    }
    return undefined;
  }

  // Searches for a semantic domain by name
  function searchDomainByName(
    domain: TreeSemanticDomain,
    target: string
  ): TreeSemanticDomain | undefined {
    let check = (checkAgainst: TreeSemanticDomain | undefined) =>
      checkAgainst && target.toLowerCase() === checkAgainst.name.toLowerCase();
    if (check(domain)) {
      return domain;
    }
    // If there are subdomains
    if (domain.subdomains.length > 0) {
      let tempDomain: TreeSemanticDomain | undefined;
      for (const sub of domain.subdomains) {
        tempDomain = searchDomainByName(sub, target);
        if (check(tempDomain)) {
          return tempDomain;
        }
      }
    }
    return undefined;
  }

  // Dispatch the search for a specified domain, and switches to it if it exists
  function searchAndSelectDomain(event: React.KeyboardEvent) {
    // stopPropagation() prevents keystrokes from reaching ReviewEntries,
    // but requires the search function be called onKeyDown
    if (event.stopPropagation) {
      event.stopPropagation();
    }
    event.bubbles = false;

    if (event.key === Key.Enter) {
      event.preventDefault();
      // Find parent domain
      let parent: TreeSemanticDomain | undefined = props.currentDomain;
      while (parent.parentDomain !== undefined) {
        parent = parent.parentDomain;
      }

      // Search for domain
      if (!isNaN(parseInt(input))) {
        let i: number = 0;
        while (parent) {
          parent = searchDomainByNumber(parent, input.slice(0, i * 2 + 1));
          if (parent && parent.id === input) {
            props.animate(parent);
            props.bounce();
            setInput("");
            (event.target as any).value = "";
            break;
          } else if (parent && parent.subdomains.length === 0) {
            break;
          }
          i++;
        }
      } else {
        parent = searchDomainByName(parent, input);
        if (parent) {
          props.animate(parent);
          props.bounce();
          setInput("");
          (event.target as any).value = "";
        }
      }
    }
  }

  // Change the input on typing
  function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(event.target.value);
  }
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
    searchAndSelectDomain,
    handleChange,
  };
}
