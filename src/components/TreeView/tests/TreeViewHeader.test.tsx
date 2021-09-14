import { render } from "@testing-library/react";
import { renderHook } from "@testing-library/react-hooks";
import { Key } from "ts-key-enum";

import MockDomain from "components/TreeView/tests/MockSemanticDomain";
import {
  TreeViewHeader,
  TreeHeaderProps,
  useTreeNavigation,
} from "components/TreeView/TreeViewHeader";

// Handles
const MOCK_ANIMATE = jest.fn();
const testProps: TreeHeaderProps = {
  animate: MOCK_ANIMATE,
  currentDomain: MockDomain,
};
// These props have a currentDomain with a parent and two brothers
const upOneWithBrothersProps: TreeHeaderProps = {
  animate: MOCK_ANIMATE,
  currentDomain: MockDomain.subdomains[1],
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
  describe("getLeftBrother and getRightBrother", () => {
    it("return undefined when there are no brothers", () => {
      const { result } = renderHook(() => useTreeNavigation(testProps));

      // The top domain (used in testProps) has no brother on either side
      expect(result.current.getLeftBrother(testProps)).toEqual(undefined);
      expect(result.current.getRightBrother(testProps)).toEqual(undefined);
    });

    // getBrotherDomain
    it("return the expected brothers", () => {
      const { result } = renderHook(() =>
        useTreeNavigation(upOneWithBrothersProps)
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

  describe("typing arrow key", () => {
    it("right arrow moves to right sibling", () => {
      render(<TreeViewHeader {...upOneWithBrothersProps} />);
      simulateKey(Key.ArrowRight);
      expect(MOCK_ANIMATE).toHaveBeenCalledWith(MockDomain.subdomains[2]);
    });

    it("left arrow moves to left sibling", () => {
      render(<TreeViewHeader {...upOneWithBrothersProps} />);
      simulateKey(Key.ArrowLeft);
      expect(MOCK_ANIMATE).toHaveBeenCalledWith(MockDomain.subdomains[0]);
    });

    it("up arrow moves to parent domain", () => {
      render(<TreeViewHeader {...upOneWithBrothersProps} />);
      simulateKey(Key.ArrowUp);
      expect(MOCK_ANIMATE).toHaveBeenCalledWith(MockDomain);
    });
  });
});

function simulateKey(key: Key) {
  const keyDownHandler = eventListeners.get("keydown");
  expect(keyDownHandler).not.toBeUndefined();
  const simulatedArrowKey: Partial<KeyboardEvent> = { key };
  keyDownHandler!.call(null, simulatedArrowKey as Event);
}
