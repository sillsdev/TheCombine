import { render } from "@testing-library/react";
import { renderHook } from "@testing-library/react-hooks";
import { Key } from "ts-key-enum";

import {
  TreeViewHeader,
  TreeHeaderProps,
  useTreeNavigation,
} from "components/TreeView/TreeViewHeader";
import domMap, { mapIds } from "components/TreeView/tests/MockSemanticDomain";
import { semDomFromTreeNode } from "types/semanticDomain";

// Handles
const MOCK_ANIMATE = jest.fn();

// Current domain with no siblings, three kids
const testProps: TreeHeaderProps = {
  currentDomain: domMap[mapIds.parent],
  animate: MOCK_ANIMATE,
};
// Current domain with a parent, two siblings, and multiple kids
const twoBrothersManyKids: TreeHeaderProps = {
  currentDomain: domMap[mapIds.middleKid],
  animate: MOCK_ANIMATE,
};
// Current domain with a parent, no siblings, one kid
const noBrothersOneKid: TreeHeaderProps = {
  currentDomain: domMap[mapIds.depth3],
  animate: MOCK_ANIMATE,
};
// Current domain with a parent, no siblings, no kids
const noBrothersNoKids: TreeHeaderProps = {
  currentDomain: domMap[mapIds.depth5],
  animate: MOCK_ANIMATE,
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
  describe("getPrevSibling and getNextSibling", () => {
    it("return undefined when there are no brothers", () => {
      const { result } = renderHook(() => useTreeNavigation(testProps));

      // The top domain (used in testProps) has no brother on either side
      expect(result.current.getPrevSibling(testProps)).toEqual(undefined);
      expect(result.current.getNextSibling(testProps)).toEqual(undefined);
    });

    // getBrotherDomain
    it("return the expected brothers", () => {
      const { result } = renderHook(() =>
        useTreeNavigation(twoBrothersManyKids)
      );

      // The top domain (used in testProps) has no brother on either side
      expect(result.current.getPrevSibling(twoBrothersManyKids)).toEqual(
        semDomFromTreeNode(domMap[mapIds.firstKid])
      );
      expect(result.current.getNextSibling(twoBrothersManyKids)).toEqual(
        semDomFromTreeNode(domMap[mapIds.lastKid])
      );
    });
  });

  describe("typing arrow key", () => {
    it("left arrow moves to left sibling", () => {
      render(<TreeViewHeader {...twoBrothersManyKids} />);
      simulateKey(Key.ArrowLeft);
      expect(MOCK_ANIMATE).toHaveBeenCalled();
      const expectedDom = semDomFromTreeNode(domMap[mapIds.firstKid]);
      expect(MOCK_ANIMATE).toHaveBeenCalledWith(expectedDom);
    });
    it("left arrow does nothing when no left sibling", () => {
      render(<TreeViewHeader {...noBrothersOneKid} />);
      simulateKey(Key.ArrowLeft);
      expect(MOCK_ANIMATE).toHaveBeenCalledTimes(0);
    });
    it("right arrow moves to right sibling", () => {
      render(<TreeViewHeader {...twoBrothersManyKids} />);
      simulateKey(Key.ArrowRight);
      const expectedDom = semDomFromTreeNode(domMap[mapIds.lastKid]);
      expect(MOCK_ANIMATE).toHaveBeenCalledWith(expectedDom);
    });
    it("right arrow does nothing when no right sibling", () => {
      render(<TreeViewHeader {...noBrothersOneKid} />);
      simulateKey(Key.ArrowRight);
      expect(MOCK_ANIMATE).toHaveBeenCalledTimes(0);
    });
    it("up arrow moves to parent domain", () => {
      render(<TreeViewHeader {...twoBrothersManyKids} />);
      simulateKey(Key.ArrowUp);
      expect(MOCK_ANIMATE).toHaveBeenCalled();
      const expectedDom = semDomFromTreeNode(domMap[mapIds.parent]);
      expect(MOCK_ANIMATE).toHaveBeenCalledWith(expectedDom);
    });
    it("down arrow does nothing when multiple kids", () => {
      render(<TreeViewHeader {...twoBrothersManyKids} />);
      simulateKey(Key.ArrowDown);
      expect(MOCK_ANIMATE).toHaveBeenCalledTimes(0);
    });
    it("down arrow moves to only child", () => {
      render(<TreeViewHeader {...noBrothersOneKid} />);
      simulateKey(Key.ArrowDown);
      const expectedDom = semDomFromTreeNode(domMap[mapIds.depth4]);
      expect(MOCK_ANIMATE).toHaveBeenCalledWith(expectedDom);
    });
    it("down arrow does nothing when no kids", () => {
      render(<TreeViewHeader {...noBrothersNoKids} />);
      simulateKey(Key.ArrowDown);
      expect(MOCK_ANIMATE).toHaveBeenCalledTimes(0);
    });
  });
});

function simulateKey(key: Key) {
  const keyDownHandler = eventListeners.get("keydown");
  expect(keyDownHandler).not.toBeUndefined();
  const simulatedArrowKey: Partial<KeyboardEvent> = { key };
  keyDownHandler!.call(null, simulatedArrowKey as Event);
}
