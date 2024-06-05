import { Grid, TextField } from "@mui/material";
import {
  type ChangeEvent,
  type KeyboardEvent,
  type ReactElement,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { Key } from "ts-key-enum";

import { type SemanticDomainTreeNode } from "api/models";
import {
  getSemanticDomainTreeNode,
  getSemanticDomainTreeNodeByName,
} from "backend";

export interface TreeSearchProps {
  currentDomain: SemanticDomainTreeNode;
  animate: (domain: SemanticDomainTreeNode) => Promise<void>;
}

export const testId = "testSearch";

export default function TreeSearch(props: TreeSearchProps): ReactElement {
  const { t } = useTranslation();
  const { input, handleChange, searchAndSelectDomain, searchError, setInput } =
    useTreeSearch(props);

  const handleOnKeyUp = (event: KeyboardEvent): void => {
    event.bubbles = false;
    if (event.key === Key.Enter) {
      // Use onKeyUp so that this fires after onChange, to facilitate
      // error state clearing.
      event.stopPropagation();
      searchAndSelectDomain(event);
    } else if (event.key === Key.Backspace)
      if (input && input[input.length - 1] === ".") {
        setInput(input.slice(0, input.length - 1));
      }
  };

  return (
    <Grid style={{ maxWidth: 200 }}>
      <TextField
        variant="standard"
        fullWidth
        id="domain-tree-search-field"
        label={t("treeView.findDomain")}
        onKeyDown={stopPropagation}
        onChange={handleChange}
        onKeyUp={handleOnKeyUp}
        margin="normal"
        autoComplete="off"
        inputProps={{ "data-testid": testId }}
        value={input}
        error={searchError}
        helperText={searchError ? t("treeView.domainNotFound") : undefined}
      />
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
  handleChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  searchAndSelectDomain: (event: KeyboardEvent) => void;
  searchError: boolean;
  setInput: (text: string) => void;
}

// Exported for unit testing only
export function useTreeSearch(props: TreeSearchProps): TreeSearchState {
  const [input, setInput] = useState<string>("");
  const [searchError, setSearchError] = useState<boolean>(false);
  const lang = props.currentDomain.lang;

  // Searches for a semantic domain by name
  async function searchDomainByName(
    target: string
  ): Promise<SemanticDomainTreeNode | undefined> {
    return await getSemanticDomainTreeNodeByName(target, lang);
  }

  /** Animate the domain and clear search input after successfully searching
   * for a new domain. */
  function animateSuccessfulSearch(
    domain: SemanticDomainTreeNode,
    event: KeyboardEvent
  ): void {
    props.animate(domain);
    setInput("");
    (event.target as any).value = "";
    setSearchError(false);
  }

  // Dispatch the search for a specified domain, and switches to it if it exists
  async function searchAndSelectDomain(event: KeyboardEvent): Promise<void> {
    // Search for domain
    let domain: SemanticDomainTreeNode | undefined;
    if (!isNaN(parseInt(input))) {
      domain = await getSemanticDomainTreeNode(input, lang);
    } else {
      domain = await searchDomainByName(input);
    }
    if (domain) {
      animateSuccessfulSearch(domain, event);
      // Return to indicate success and skip setting error state.
      return;
    }
    // Did not find a domain through either numerical or textual search.
    setSearchError(true);
  }

  // Change the input on typing
  function handleChange(event: ChangeEvent<HTMLTextAreaElement>): void {
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
    setInput,
  };
}

// Prevents keystrokes from reaching parent components; must be called onKeyDown
function stopPropagation(event: KeyboardEvent): void {
  if (event.stopPropagation) {
    event.stopPropagation();
  }
}
