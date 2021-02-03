import { render, screen } from "@testing-library/react";
import { renderHook, act } from "@testing-library/react-hooks";
import userEvent from "@testing-library/user-event";
import React from "react";

import MockDomain from "components/TreeView/tests/MockSemanticDomain";
import {
  TreeViewHeader,
  TreeHeaderProps,
  useTreeViewNavigation,
} from "components/TreeView/TreeViewHeader";
import SemanticDomainWithSubdomains from "types/SemanticDomain";

// Handles
const MOCK_ANIMATE = jest.fn();
const MOCK_BOUNCE = jest.fn();
const MOCK_STOP_PROP = jest.fn();
const testProps: TreeHeaderProps = {
  animate: MOCK_ANIMATE,
  currentDomain: MockDomain,
  bounceState: 0,
  bounce: MOCK_BOUNCE,
};
// These props have a currentDomain with a parent and two brothers
const upOneWithBrothersProps: TreeHeaderProps = {
  animate: MOCK_ANIMATE,
  currentDomain: MockDomain.subdomains[1],
  bounceState: 0,
  bounce: MOCK_BOUNCE,
};
const eventListeners: Map<string, EventListener> = new Map<
  string,
  EventListener
>();

beforeEach(() => {
  jest.clearAllMocks();
  window.addEventListener = jest.fn((event, cb) => {
    eventListeners.set(event, cb as EventListener);
  });
});

describe("TreeViewHeader", () => {
  describe("searchAndSelectDomain", () => {
    function setupSimulatedInputTest(input: string) {
      // Simulate the user typing a string
      const simulatedInput = {
        target: { value: input },
      } as React.ChangeEvent<HTMLTextAreaElement>;

      const keyboardTarget = new EventTarget();
      // Simulate the user typing the enter key
      const simulatedEnterKey: Partial<React.KeyboardEvent> = {
        bubbles: true,
        key: "Enter",
        preventDefault: jest.fn(),
        target: keyboardTarget,
        stopPropagation: MOCK_STOP_PROP,
      };

      return { simulatedInput, simulatedEnterKey };
    }

    it("switches semantic domain if given number found", () => {
      const TEST: string = "1.0";

      const { result } = renderHook(() => useTreeViewNavigation(testProps));

      // Simulate the user typing
      const { simulatedInput, simulatedEnterKey } = setupSimulatedInputTest(
        TEST
      );

      // When testing hooks any call that results in a state change needs to be wrapped in
      // an act call to avoid warnings and make sure the state change is complete before we test
      // for the results
      act(() => result.current.handleChange(simulatedInput));
      act(() =>
        result.current.searchAndSelectDomain(
          simulatedEnterKey as React.KeyboardEvent
        )
      );

      expect(MOCK_STOP_PROP).toHaveBeenCalled();
      expect(MOCK_BOUNCE).toHaveBeenCalled();
      expect(MOCK_ANIMATE).toHaveBeenCalledWith(MockDomain.subdomains[0]);
    });

    it("does not switch semantic domain if given number not found", () => {
      const TEST: string = "10";

      const { result } = renderHook(() => useTreeViewNavigation(testProps));

      // Simulate the user typing
      const { simulatedInput, simulatedEnterKey } = setupSimulatedInputTest(
        TEST
      );

      // When testing hooks any call that results in a state change needs to be wrapped in
      // an act call to avoid warnings and make sure the state change is complete before we test
      // for the results
      act(() => result.current.handleChange(simulatedInput));
      act(() =>
        result.current.searchAndSelectDomain(
          simulatedEnterKey as React.KeyboardEvent
        )
      );

      expect(MOCK_ANIMATE).toHaveBeenCalledTimes(0);
    });

    it("does not switch semantic domain on realistic but non-existent subdomain", () => {
      const TEST: string = "1.2.1.1.1.1";

      const { result } = renderHook(() => useTreeViewNavigation(testProps));

      // Simulate the user typing
      const { simulatedInput, simulatedEnterKey } = setupSimulatedInputTest(
        TEST
      );

      // When testing hooks any call that results in a state change needs to be wrapped in
      // an act call to avoid warnings and make sure the state change is complete before we test
      // for the results
      act(() => result.current.handleChange(simulatedInput));
      act(() =>
        result.current.searchAndSelectDomain(
          simulatedEnterKey as React.KeyboardEvent
        )
      );

      expect(MOCK_ANIMATE).toHaveBeenCalledTimes(0);
    });

    it("switches on a length 5 number", () => {
      const leafNode: SemanticDomainWithSubdomains =
        MockDomain.subdomains[2].subdomains[0].subdomains[0].subdomains[0];

      const { result } = renderHook(() => useTreeViewNavigation(testProps));

      // Simulate the user typing the leafNode.id
      const { simulatedInput, simulatedEnterKey } = setupSimulatedInputTest(
        leafNode.id
      );

      // When testing hooks any call that results in a state change needs to be wrapped in
      // an act call to avoid warnings and make sure the state change is complete before we test
      // for the results
      act(() => result.current.handleChange(simulatedInput));
      act(() =>
        result.current.searchAndSelectDomain(
          simulatedEnterKey as React.KeyboardEvent
        )
      );

      expect(MOCK_ANIMATE).toHaveBeenCalledWith(leafNode);
    });

    it("switches semantic domain if given name found", () => {
      const { result } = renderHook(() => useTreeViewNavigation(testProps));

      const { simulatedInput, simulatedEnterKey } = setupSimulatedInputTest(
        MockDomain.subdomains[0].name
      );

      // When testing hooks any call that results in a state change needs to be wrapped in
      // an act call to avoid warnings and make sure the state change is complete before we test
      // for the results
      act(() => result.current.handleChange(simulatedInput));
      act(() =>
        result.current.searchAndSelectDomain(
          simulatedEnterKey as React.KeyboardEvent
        )
      );

      expect(MOCK_ANIMATE).toHaveBeenCalledWith(MockDomain.subdomains[0]);
    });

    it("does not switch semantic domain if given name not found", () => {
      const TEST: string = "itsatrap";
      const { result } = renderHook(() => useTreeViewNavigation(testProps));
      const { simulatedInput, simulatedEnterKey } = setupSimulatedInputTest(
        TEST
      );
      // When testing hooks any call that results in a state change needs to be wrapped in
      // an act call to avoid warnings and make sure the state change is complete before we test
      // for the results
      act(() => result.current.handleChange(simulatedInput));
      act(() =>
        result.current.searchAndSelectDomain(
          simulatedEnterKey as React.KeyboardEvent
        )
      );

      expect(MOCK_ANIMATE).toHaveBeenCalledTimes(0);
    });
  });

  describe("getLeftBrother and getRightBrother", () => {
    it("return undefined when there are no brothers", () => {
      const { result } = renderHook(() => useTreeViewNavigation(testProps));

      // The top domain (used in testProps) has no brother on either side
      expect(result.current.getLeftBrother(testProps)).toEqual(undefined);
      expect(result.current.getRightBrother(testProps)).toEqual(undefined);
    });

    // getBrotherDomain
    it("return the expected brothers", () => {
      const { result } = renderHook(() =>
        useTreeViewNavigation(upOneWithBrothersProps)
      );

      // The top domain (used in testProps) has no brother on either side
      expect(result.current.getLeftBrother(upOneWithBrothersProps)).toEqual(
        MockDomain.subdomains[0]
      );
      expect(result.current.getRightBrother(upOneWithBrothersProps)).toEqual(
        MockDomain.subdomains[2]
      );
    });
  });

  // Integration tests, verify the component uses the hooks to achieve the desired UX
  it("typing non-matching domain search data does not clear input, or attempt to navigate", () => {
    render(<TreeViewHeader {...upOneWithBrothersProps} />);
    expect(
      (screen.getByTestId("testSearch") as HTMLInputElement).value
    ).toEqual("");
    userEvent.type(screen.getByTestId("testSearch"), "flibbertigibbet{enter}");
    expect(
      (screen.getByTestId("testSearch") as HTMLInputElement).value
    ).toEqual("flibbertigibbet");
    // verify that no attempt to switch domains happened
    expect(MOCK_ANIMATE).toHaveBeenCalledTimes(0);
  });

  it("typing valid domain number navigates and clears input", () => {
    render(<TreeViewHeader {...upOneWithBrothersProps} />);
    expect(
      (screen.getByTestId("testSearch") as HTMLInputElement).value
    ).toEqual("");
    userEvent.type(screen.getByTestId("testSearch"), "1.2{enter}");
    expect(
      (screen.getByTestId("testSearch") as HTMLInputElement).value
    ).toEqual("");
    // verify that we're testing with the matching domain
    expect(MockDomain.subdomains[2].id).toEqual("1.2");
    // verify that we would switch to the domain requested
    expect(MOCK_ANIMATE).toHaveBeenCalledWith(MockDomain.subdomains[2]);
  });

  it("typing right arrow key moves to right sibling", () => {
    render(<TreeViewHeader {...upOneWithBrothersProps} />);
    const keyDownHandler = eventListeners.get("keydown");
    expect(keyDownHandler).not.toBeUndefined();
    const simulatedArrowKey: Partial<KeyboardEvent> = {
      key: "ArrowRight",
    };
    keyDownHandler!.call(null, simulatedArrowKey as Event);
    // verify that we would switch to the domain requested
    expect(MOCK_ANIMATE).toHaveBeenCalledWith(MockDomain.subdomains[2]);
  });

  it("typing left arrow key moves to left sibling", () => {
    render(<TreeViewHeader {...upOneWithBrothersProps} />);
    const keyDownHandler = eventListeners.get("keydown");
    expect(keyDownHandler).not.toBeUndefined();
    const simulatedArrowKey: Partial<KeyboardEvent> = {
      key: "ArrowLeft",
    };
    keyDownHandler!.call(null, simulatedArrowKey as Event);
    // verify that we would switch to the domain requested
    expect(MOCK_ANIMATE).toHaveBeenCalledWith(MockDomain.subdomains[0]);
  });

  it("typing up arrow key moves to parent domain", () => {
    render(<TreeViewHeader {...upOneWithBrothersProps} />);
    const keyDownHandler = eventListeners.get("keydown");
    expect(keyDownHandler).not.toBeUndefined();
    const simulatedArrowKey: Partial<KeyboardEvent> = {
      key: "ArrowUp",
    };
    keyDownHandler!.call(null, simulatedArrowKey as Event);
    // verify that we would switch to the domain requested
    expect(MOCK_ANIMATE).toHaveBeenCalledWith(MockDomain);
  });
});
