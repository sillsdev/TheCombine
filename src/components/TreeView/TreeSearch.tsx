import { Grid, TextField } from "@material-ui/core";
import React, { useState } from "react";
import { Translate } from "react-localize-redux";
import { Key } from "ts-key-enum";

import TreeSemanticDomain from "components/TreeView/TreeSemanticDomain";

export interface TreeSearchProps {
  currentDomain: TreeSemanticDomain;
  animate: (domain: TreeSemanticDomain) => Promise<void>;
}

export const testId = "testSearch";

export default function TreeSearch(props: TreeSearchProps) {
  const { searchAndSelectDomain, input, handleChange } = useTreeSearch(props);

  return (
    <Grid style={{ maxWidth: 200 }}>
      <Translate>
        {({ translate }) => (
          <TextField
            fullWidth
            id="domain-tree-search-field"
            label={translate("treeView.findDomain").toString()}
            onKeyDown={searchAndSelectDomain}
            onChange={handleChange}
            margin="normal"
            autoComplete="off"
            inputProps={{ "data-testid": testId }}
            value={input}
          />
        )}
      </Translate>
    </Grid>
  );
}

/** Automatically convert a string of form 123 to 1.2.3. */
export function insertDecimalPoints(value: string): string {
  // Test if input is strictly of the form: 1.2.3 or 123
  if (/^[.\d]+$/.test(value) && !value.endsWith(".")) {
    // Automatically insert decimal points between two numbers.
    value = value
      .replace(/\./g, "")
      .split("")
      .map((char) => `${char}.`)
      .join("")
      .slice(0, -1);
  }

  return value;
}

// exported for unit testing only
export function useTreeSearch(props: TreeSearchProps) {
  const [input, setInput] = useState("");

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
    setInput(insertDecimalPoints(event.target.value));
  }

  return {
    searchAndSelectDomain,
    input,
    handleChange,
  };
}
