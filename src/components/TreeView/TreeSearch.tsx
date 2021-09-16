import { Grid, TextField } from "@material-ui/core";
import React, { useState } from "react";
import { Key } from "ts-key-enum";

import TreeSemanticDomain from "components/TreeView/TreeSemanticDomain";

export interface TreeSearchProps {
  currentDomain: TreeSemanticDomain;
  animate: (domain: TreeSemanticDomain) => Promise<void>;
}

export const testId = "testSearch";

export default function TreeSearch(props: TreeSearchProps) {
  const { searchAndSelectDomain, handleChange } = useTreeSearch(props);

  return (
    <Grid style={{ maxWidth: 200 }}>
      <TextField
        fullWidth
        id="domain-tree-search-field"
        label="Find a domain"
        onKeyDown={searchAndSelectDomain}
        onChange={handleChange}
        margin="normal"
        autoComplete="off"
        inputProps={{ "data-testid": testId }}
      />
    </Grid>
  );
}

// exported for unit testing only
export function useTreeSearch(props: TreeSearchProps) {
  const [input, setInput] = useState(props.currentDomain.id);

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

  return {
    searchAndSelectDomain,
    handleChange,
  };
}
