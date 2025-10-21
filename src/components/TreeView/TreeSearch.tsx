import {
  type ChangeEvent,
  type KeyboardEvent,
  type ReactElement,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { Key } from "ts-key-enum";

import {
  type SemanticDomainFull,
  type SemanticDomainTreeNode,
} from "api/models";
import { getAugmentedTreeNode } from "components/TreeView/utilities";
import { NormalizedTextField } from "utilities/fontComponents";

export interface TreeSearchProps {
  currentDomain: SemanticDomainTreeNode;
  customDomains: SemanticDomainFull[];
  animate: (domain: SemanticDomainTreeNode) => Promise<void>;
}

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
    <NormalizedTextField
      id="domain-tree-search-field"
      label={t("treeView.findDomain")}
      onKeyDown={stopPropagation}
      onChange={handleChange}
      onKeyUp={handleOnKeyUp}
      margin="normal"
      autoComplete="off"
      slotProps={{ htmlInput: { maxLength: 99 }, inputLabel: { shrink: true } }}
      value={input}
      error={searchError}
      helperText={searchError ? t("treeView.domainNotFound") : undefined}
    />
  );
}

/** Adds periods to a string of digits.
 * If string is digits with at most 1 period between each digit
 * (e.g.: 1234, 12.34, 123.4, 1.23.4),
 * then removes all periods (e.g.: 1234)
 * and inserts a period between each digit (e.g.: 1.2.3.4).
 *
 * Note: doesn't act on strings with double/initial/final period (e.g.: .2.3.4, 1..3.4),
 * because a user may be changing a digit (e.g.: 1.0.3.4 -> 1..3.4 -> 1.2.3.4). */
export function insertDecimalPoints(value: string): string {
  if (/^\d(\.?\d)+$/.test(value)) {
    value = value.replace(/\./g, "").split("").join(".");
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
    const domain = await getAugmentedTreeNode(input, lang, props.customDomains);
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
