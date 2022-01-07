import { Grid, TextField } from "@material-ui/core";
import React, { ReactElement, useState } from "react";
import { Translate } from "react-localize-redux";
import { Key } from "ts-key-enum";

import TreeSemanticDomain from "components/TreeView/TreeSemanticDomain";

export interface TreeSearchProps {
  currentDomain: TreeSemanticDomain;
  animate: (domain: TreeSemanticDomain) => Promise<void>;
}

export const testId = "testSearch";

export default function TreeSearch(props: TreeSearchProps): ReactElement {
  const { input, handleChange, searchAndSelectDomain, searchError } =
    useTreeSearch(props);

  return (
    <Grid style={{ maxWidth: 200 }}>
      <Translate>
        {({ translate }) => (
          <TextField
            fullWidth
            id="domain-tree-search-field"
            label={translate("treeView.findDomain").toString()}
            // Use onKeyUp so that this fires after onChange, to facilitate
            // error state clearing.
            onKeyUp={searchAndSelectDomain}
            onChange={handleChange}
            margin="normal"
            autoComplete="off"
            inputProps={{ "data-testid": testId }}
            value={input}
            error={searchError}
            helperText={
              searchError
                ? translate("treeView.domainNotFound").toString()
                : undefined
            }
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

interface TreeSearchState {
  input: string;
  handleChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  searchAndSelectDomain: (event: React.KeyboardEvent) => void;
  searchError: boolean;
}

// exported for unit testing only
export function useTreeSearch(props: TreeSearchProps): TreeSearchState {
  const [input, setInput] = useState<string>("");
  const [searchError, setSearchError] = useState<boolean>(false);

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
    const check = (checkAgainst: TreeSemanticDomain | undefined) =>
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

  /** Animate the parent and clear search input after successfully searching
   * for a new domain.*/
  function animateSuccessfulSearch(
    parent: TreeSemanticDomain,
    event: React.KeyboardEvent
  ): void {
    props.animate(parent);
    setInput("");
    (event.target as any).value = "";
    setSearchError(false);
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
        let i = 0;
        while (parent !== undefined) {
          parent = searchDomainByNumber(parent, input.slice(0, i * 2 + 1));
          if (parent !== undefined && parent.id === input) {
            animateSuccessfulSearch(parent, event);
            // Return to indicate success and skip setting error state.
            return;
          } else if (parent !== undefined && parent.subdomains.length === 0) {
            break;
          }
          i++;
        }
      } else {
        parent = searchDomainByName(parent, input);
        if (parent !== undefined) {
          animateSuccessfulSearch(parent, event);
          // Return to indicate success and skip setting error state.
          return;
        }
      }
      // Did not find a domain through either numerical or textual search.
      setSearchError(true);
    }
  }

  // Change the input on typing
  function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(insertDecimalPoints(event.target.value));
    // Reset the error dialogue when input is changes to avoid showing an error
    // when a valid domain is entered, but Enter hasn't been pushed yet.
    setSearchError(false);
  }

  return {
    input,
    handleChange,
    searchAndSelectDomain,
    searchError,
  };
}
