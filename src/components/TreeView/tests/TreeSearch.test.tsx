import { render, screen } from "@testing-library/react";
import { act, renderHook } from "@testing-library/react-hooks";
import userEvent from "@testing-library/user-event";
import React from "react";
import { Key } from "ts-key-enum";

import MockDomain from "components/TreeView/tests/MockSemanticDomain";
import TreeSearch, {
  testId,
  TreeSearchProps,
  useTreeSearch,
} from "components/TreeView/TreeSearch";

// Handles
const MOCK_ANIMATE = jest.fn();
const MOCK_STOP_PROP = jest.fn();
const testProps: TreeSearchProps = {
  animate: MOCK_ANIMATE,
  currentDomain: MockDomain,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("TreeSearch", () => {
  describe("searchAndSelectDomain", () => {
    function simulateTypeAndEnter(input: string) {
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
        stopPropagation: MOCK_STOP_PROP,
      };

      // When testing hooks any call that results in a state change needs to be wrapped in
      // an act call to avoid warnings and make sure the state change is complete before we test
      // for the results
      const { result } = renderHook(() => useTreeSearch(testProps));
      act(() => result.current.handleChange(simulatedInput));
      act(() =>
        result.current.searchAndSelectDomain(
          simulatedEnterKey as React.KeyboardEvent
        )
      );
    }

    it("switches semantic domain if given number found", () => {
      simulateTypeAndEnter("1.0");
      expect(MOCK_STOP_PROP).toHaveBeenCalled();
      expect(MOCK_ANIMATE).toHaveBeenCalledWith(MockDomain.subdomains[0]);
    });

    it("does not switch semantic domain if given number not found", () => {
      simulateTypeAndEnter("10");
      expect(MOCK_ANIMATE).toHaveBeenCalledTimes(0);
    });

    it("does not switch semantic domain on realistic but non-existent subdomain", () => {
      simulateTypeAndEnter("1.2.1.1.1.1");
      expect(MOCK_ANIMATE).toHaveBeenCalledTimes(0);
    });

    it("switches on a length 5 number", () => {
      const leafNode =
        MockDomain.subdomains[2].subdomains[0].subdomains[0].subdomains[0];
      simulateTypeAndEnter(leafNode.id);
      expect(MOCK_ANIMATE).toHaveBeenCalledWith(leafNode);
    });

    it("switches semantic domain if given name found", () => {
      simulateTypeAndEnter(MockDomain.subdomains[0].name);
      expect(MOCK_ANIMATE).toHaveBeenCalledWith(MockDomain.subdomains[0]);
    });

    it("does not switch semantic domain if given name not found", () => {
      simulateTypeAndEnter("itsatrap");
      expect(MOCK_ANIMATE).toHaveBeenCalledTimes(0);
    });
  });

  describe("Integration tests, verify component uses hooks to achieve desired UX", () => {
    test("typing non-matching domain search data does not clear input, or attempt to navigate", () => {
      render(<TreeSearch {...testProps} />);
      expect((screen.getByTestId(testId) as HTMLInputElement).value).toEqual(
        ""
      );
      userEvent.type(screen.getByTestId(testId), "flibbertigibbet{enter}");
      expect((screen.getByTestId(testId) as HTMLInputElement).value).toEqual(
        "flibbertigibbet"
      );
      // verify that no attempt to switch domains happened
      expect(MOCK_ANIMATE).toHaveBeenCalledTimes(0);
    });

    test("typing valid domain number navigates and clears input", () => {
      render(<TreeSearch {...testProps} />);
      expect((screen.getByTestId(testId) as HTMLInputElement).value).toEqual(
        ""
      );
      userEvent.type(screen.getByTestId(testId), "1.2{enter}");
      expect((screen.getByTestId(testId) as HTMLInputElement).value).toEqual(
        ""
      );
      // verify that we're testing with the matching domain
      expect(MockDomain.subdomains[2].id).toEqual("1.2");
      // verify that we would switch to the domain requested
      expect(MOCK_ANIMATE).toHaveBeenCalledWith(MockDomain.subdomains[2]);
    });
  });
});
