import { render, screen } from "@testing-library/react";
import { act, renderHook } from "@testing-library/react-hooks";
import userEvent from "@testing-library/user-event";
import React from "react";
import { Key } from "ts-key-enum";

import "tests/mockReactI18next";

import { SemanticDomainTreeNode } from "api";
import * as backend from "backend";
import TreeSearch, {
  insertDecimalPoints,
  testId,
  TreeSearchProps,
  useTreeSearch,
} from "components/TreeView/TreeSearch";
import domMap, { mapIds } from "components/TreeView/tests/MockSemanticDomain";
import { newSemanticDomainTreeNode } from "types/semanticDomain";

// Handles
const MOCK_ANIMATE = jest.fn((domain: SemanticDomainTreeNode) => {
  console.log("MockAnimateCalled");
  return Promise.resolve();
});
const testProps: TreeSearchProps = {
  currentDomain: newSemanticDomainTreeNode(),
  animate: MOCK_ANIMATE,
};

beforeEach(() => {
  jest.clearAllMocks();
});

function setupSpies(domain: SemanticDomainTreeNode | undefined) {
  jest.spyOn(backend, "getSemanticDomainTreeNode").mockResolvedValue(domain);
  jest
    .spyOn(backend, "getSemanticDomainTreeNodeByName")
    .mockResolvedValue(domain);
}

describe("TreeSearch", () => {
  describe("searchAndSelectDomain", () => {
    async function simulateTypeAndEnter(input: string) {
      // Simulate the user typing a string
      const simulatedInput = {
        target: { value: input },
      } as React.ChangeEvent<HTMLTextAreaElement>;

      const keyboardTarget = new EventTarget();
      // Simulate the user typing the enter key
      const simulatedEnterKey: Partial<React.KeyboardEvent> = {
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
        result.current.searchAndSelectDomain(
          simulatedEnterKey as React.KeyboardEvent
        )
      );
    }

    it("switches semantic domain if given number found", async () => {
      const node = domMap[mapIds.firstKid];
      setupSpies(node);
      await simulateTypeAndEnter(node.id);
      expect(MOCK_ANIMATE).toHaveBeenCalled();
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
      expect((screen.getByTestId(testId) as HTMLInputElement).value).toEqual(
        ""
      );
      await act(
        async () =>
          await userEvent.type(
            screen.getByTestId(testId),
            "flibbertigibbet{enter}"
          )
      );
      expect((screen.getByTestId(testId) as HTMLInputElement).value).toEqual(
        "flibbertigibbet"
      );
      // verify that no attempt to switch domains happened
      expect(MOCK_ANIMATE).toHaveBeenCalledTimes(0);
    });

    it("typing valid domain number navigates and clears input", async () => {
      render(<TreeSearch {...testProps} />);
      expect((screen.getByTestId(testId) as HTMLInputElement).value).toEqual(
        ""
      );
      setupSpies(domMap[mapIds.lastKid]);
      await act(
        async () =>
          await userEvent.type(
            screen.getByTestId(testId),
            `${mapIds.lastKid}{enter}`
          )
      );
      expect((screen.getByTestId(testId) as HTMLInputElement).value).toEqual(
        ""
      );
      // verify that we would switch to the domain requested
      expect(MOCK_ANIMATE).toHaveBeenCalledWith(domMap[mapIds.lastKid]);
    });
  });
});

describe("insertDecimalPoints", () => {
  test.each([
    ["a", "a"],
    ["1a", "1a"],
    ["1", "1"],
    ["1.", "1."],
    ["1.0", "1.0"],
    ["10", "1.0"],
    ["12", "1.2"],
    ["123", "1.2.3"],
    ["1.2.3.", "1.2.3."],
    ["..1", "1"],
    ["1..2", "1.2"],
  ])("inserts correctly", (input, output) => {
    expect(insertDecimalPoints(input)).toBe(output);
  });
});
