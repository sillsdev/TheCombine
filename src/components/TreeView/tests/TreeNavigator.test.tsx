import { render, renderHook } from "@testing-library/react";
import { Key } from "ts-key-enum";

import TreeNavigator, {
  TreeNavigatorProps,
  useTreeNavigation,
} from "components/TreeView/TreeNavigator";
import domMap, { mapIds } from "components/TreeView/tests/SemanticDomainMock";
import { semDomFromTreeNode } from "types/semanticDomain";

// Handles
const MOCK_ANIMATE = jest.fn();

// Head domain with no parent, no siblings, one kid
const headNode: TreeNavigatorProps = {
  currentDomain: domMap[mapIds.head],
  animate: MOCK_ANIMATE,
};
// Current domain with a parent, no siblings, three kid
const parentOfThree: TreeNavigatorProps = {
  currentDomain: domMap[mapIds.parent],
  animate: MOCK_ANIMATE,
};
// Current domain with a parent, two siblings, three kids
const twoBrothersManyKids: TreeNavigatorProps = {
  currentDomain: domMap[mapIds.middleKid],
  animate: MOCK_ANIMATE,
};
// Current domain with a parent, no siblings, one kid
const noBrothersOneKid: TreeNavigatorProps = {
  currentDomain: domMap[mapIds.depth3],
  animate: MOCK_ANIMATE,
};
// Current domain with a parent, no siblings, no kids
const noBrothersNoKids: TreeNavigatorProps = {
  currentDomain: domMap[mapIds.depth5],
  animate: MOCK_ANIMATE,
};

const eventListeners: Map<string, EventListener> = new Map<
  string,
  EventListener
>();

beforeEach(() => {
  window.addEventListener = jest.fn((event, cb) => {
    eventListeners.set(event, cb as EventListener);
  });
});

describe("TreeNavigator", () => {
  describe("useTreeNavigation", () => {
    it("returns undefined when no parent/sibling", () => {
      // The domain headNode has no parent or siblings.
      const { current } = renderHook(() => useTreeNavigation(headNode)).result;
      expect(current.getNextSibling()).toBeUndefined();
      expect(current.getParent()).toBeUndefined();
      expect(current.getPrevSibling()).toBeUndefined();
    });

    it("getFirstChild returns undefined if no children", () => {
      const { current } = renderHook(() =>
        useTreeNavigation(noBrothersNoKids)
      ).result;
      expect(current.getFirstChild()).toBeUndefined();
    });

    it("getFirstChild returns first if at least one child", () => {
      const { current } = renderHook(() =>
        useTreeNavigation(parentOfThree)
      ).result;
      expect(current.getFirstChild()).toEqual(
        semDomFromTreeNode(domMap[mapIds.firstKid])
      );
    });

    it("returns the expected parent and siblings", () => {
      // The domain twoBrothersManyKids is the middle child of parentDomain.
      const { current } = renderHook(() =>
        useTreeNavigation(twoBrothersManyKids)
      ).result;
      expect(current.getNextSibling()).toEqual(
        semDomFromTreeNode(domMap[mapIds.lastKid])
      );
      expect(current.getParent()).toEqual(
        semDomFromTreeNode(domMap[mapIds.parent])
      );
      expect(current.getPrevSibling()).toEqual(
        semDomFromTreeNode(domMap[mapIds.firstKid])
      );
    });
  });

  describe("typing arrow key", () => {
    it("left arrow moves to left sibling", () => {
      render(<TreeNavigator {...twoBrothersManyKids} />);
      simulateKey(Key.ArrowLeft);
      expect(MOCK_ANIMATE).toHaveBeenCalled();
      const expectedDom = semDomFromTreeNode(domMap[mapIds.firstKid]);
      expect(MOCK_ANIMATE).toHaveBeenCalledWith(expectedDom);
    });
    it("left arrow does nothing when no left sibling", () => {
      render(<TreeNavigator {...noBrothersOneKid} />);
      simulateKey(Key.ArrowLeft);
      expect(MOCK_ANIMATE).toHaveBeenCalledTimes(0);
    });
    it("right arrow moves to right sibling", () => {
      render(<TreeNavigator {...twoBrothersManyKids} />);
      simulateKey(Key.ArrowRight);
      const expectedDom = semDomFromTreeNode(domMap[mapIds.lastKid]);
      expect(MOCK_ANIMATE).toHaveBeenCalledWith(expectedDom);
    });
    it("right arrow does nothing when no right sibling", () => {
      render(<TreeNavigator {...noBrothersOneKid} />);
      simulateKey(Key.ArrowRight);
      expect(MOCK_ANIMATE).toHaveBeenCalledTimes(0);
    });
    it("up arrow moves to parent domain", () => {
      render(<TreeNavigator {...twoBrothersManyKids} />);
      simulateKey(Key.ArrowUp);
      expect(MOCK_ANIMATE).toHaveBeenCalled();
      const expectedDom = semDomFromTreeNode(domMap[mapIds.parent]);
      expect(MOCK_ANIMATE).toHaveBeenCalledWith(expectedDom);
    });
    it("down arrow moves when multiple kids", () => {
      render(<TreeNavigator {...twoBrothersManyKids} />);
      simulateKey(Key.ArrowDown);
      expect(MOCK_ANIMATE).toHaveBeenCalledTimes(1);
    });
    it("down arrow moves to only child", () => {
      render(<TreeNavigator {...noBrothersOneKid} />);
      simulateKey(Key.ArrowDown);
      const expectedDom = semDomFromTreeNode(domMap[mapIds.depth4]);
      expect(MOCK_ANIMATE).toHaveBeenCalledWith(expectedDom);
    });
    it("down arrow does nothing when no kids", () => {
      render(<TreeNavigator {...noBrothersNoKids} />);
      simulateKey(Key.ArrowDown);
      expect(MOCK_ANIMATE).toHaveBeenCalledTimes(0);
    });
  });
});

function simulateKey(key: Key): void {
  const keyDownHandler = eventListeners.get("keydown");
  expect(keyDownHandler).not.toBeUndefined();
  const simulatedArrowKey: Partial<KeyboardEvent> = { key };
  keyDownHandler!.call(null, simulatedArrowKey as Event);
}
