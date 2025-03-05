import { act, render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type ChangeEvent, type KeyboardEvent } from "react";
import { Key } from "ts-key-enum";

import { SemanticDomainTreeNode } from "api/models";
import * as backend from "backend";
import TreeSearch, {
  type TreeSearchProps,
  insertDecimalPoints,
  testId,
  useTreeSearch,
} from "components/TreeView/TreeSearch";
import domMap, { mapIds } from "components/TreeView/tests/SemanticDomainMock";
import { newSemanticDomainTreeNode } from "types/semanticDomain";

// Handles
const MOCK_ANIMATE = jest.fn(() => {
  console.log("MockAnimateCalled");
  return Promise.resolve();
});
const testProps: TreeSearchProps = {
  animate: MOCK_ANIMATE,
  currentDomain: newSemanticDomainTreeNode(),
  customDomains: [],
};

beforeEach(() => {
  jest.clearAllMocks();
});

function getSearchInput(): HTMLInputElement {
  return screen.getByTestId(testId);
}

function setupSpies(domain: SemanticDomainTreeNode | undefined): void {
  jest.spyOn(backend, "getSemanticDomainTreeNode").mockResolvedValue(domain);
  jest
    .spyOn(backend, "getSemanticDomainTreeNodeByName")
    .mockResolvedValue(domain);
}

describe("TreeSearch", () => {
  describe("searchAndSelectDomain", () => {
    async function simulateTypeAndEnter(input: string): Promise<void> {
      // Simulate the user typing a string
      const simulatedInput = {
        target: { value: input },
      } as ChangeEvent<HTMLTextAreaElement>;

      const keyboardTarget = new EventTarget();
      // Simulate the user typing the enter key
      const simulatedEnterKey: Partial<KeyboardEvent> = {
        bubbles: true,
        key: Key.Enter,
        preventDefault: jest.fn(),
        target: keyboardTarget,
      };

      // When testing hooks any call that results in a state change needs to be wrapped in
      // an act call to avoid warnings and make sure the state change is complete before we test
      // for the results
      const { result } = renderHook(() => useTreeSearch(testProps));
      act(() => result.current.handleChange(simulatedInput));
      await act(async () =>
        result.current.searchAndSelectDomain(simulatedEnterKey as KeyboardEvent)
      );
    }

    it("switches semantic domain if given number found", async () => {
      const node = domMap[mapIds.firstKid];
      setupSpies(node);
      await simulateTypeAndEnter(node.id);
      expect(MOCK_ANIMATE).toHaveBeenCalledWith(node);
    });

    it("does not switch semantic domain if given number not found", async () => {
      setupSpies(undefined);
      await simulateTypeAndEnter("99");
      expect(MOCK_ANIMATE).toHaveBeenCalledTimes(0);
    });

    it("does not switch semantic domain on realistic but non-existent subdomain", async () => {
      setupSpies(undefined);
      await simulateTypeAndEnter("1.2.1.1.1.1.1");
      expect(MOCK_ANIMATE).toHaveBeenCalledTimes(0);
    });

    it("switches on a length 5 number", async () => {
      const leafNode = domMap[mapIds.depth5];
      setupSpies(leafNode);
      await simulateTypeAndEnter(mapIds.depth5);
      expect(MOCK_ANIMATE).toHaveBeenCalledWith(leafNode);
    });

    it("switches semantic domain if given name found", async () => {
      const node = domMap[mapIds.firstKid];
      setupSpies(node);
      await simulateTypeAndEnter(node.name);
      expect(MOCK_ANIMATE).toHaveBeenCalledWith(node);
    });

    it("does not switch semantic domain if given name not found", async () => {
      setupSpies(undefined);
      await simulateTypeAndEnter("itsatrap");
      expect(MOCK_ANIMATE).toHaveBeenCalledTimes(0);
    });
  });

  describe("Integration tests, verify component uses hooks to achieve desired UX", () => {
    it("typing non-matching domain search data does not clear input, or attempt to navigate", async () => {
      render(<TreeSearch {...testProps} />);
      expect(getSearchInput().value).toEqual("");
      const searchText = "flibbertigibbet";
      await userEvent.type(getSearchInput(), `${searchText}{enter}`);
      expect(getSearchInput().value).toEqual(searchText);
      // verify that no attempt to switch domains happened
      expect(MOCK_ANIMATE).toHaveBeenCalledTimes(0);
    });

    it("typing valid domain number navigates and clears input", async () => {
      render(<TreeSearch {...testProps} />);
      expect(getSearchInput().value).toEqual("");
      setupSpies(domMap[mapIds.lastKid]);
      await userEvent.type(getSearchInput(), `${mapIds.lastKid}{enter}`);
      expect(getSearchInput().value).toEqual("");
      // verify that we would switch to the domain requested
      expect(MOCK_ANIMATE).toHaveBeenCalledWith(domMap[mapIds.lastKid]);
    });
  });
});

describe("insertDecimalPoints", () => {
  test.each(["a", "1a", "1", "1.", "1.0", "1-2", "1..2", "1.2.3.", ".123"])(
    "does not change",
    (input) => {
      expect(insertDecimalPoints(input)).toBe(input);
    }
  );

  test.each([
    ["10", "1.0"],
    ["12", "1.2"],
    ["123", "1.2.3"],
    ["1.23", "1.2.3"],
    ["12.3", "1.2.3"],
    ["1.23.4", "1.2.3.4"],
  ])("changes correctly", (input, output) => {
    expect(insertDecimalPoints(input)).toBe(output);
  });
});
