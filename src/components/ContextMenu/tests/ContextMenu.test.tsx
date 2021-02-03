import React, { ReactElement } from "react";
import renderer, {
  ReactTestInstance,
  ReactTestRenderer,
} from "react-test-renderer";

import ContextMenu, {
  ContextMenu as ContextMenuClass,
  MenuType,
} from "components/ContextMenu/ContextMenu";

// Mock DOM
jest.autoMockOn();

// Mocking document's search function
document.getElementsByClassName = jest.fn((name: string) => {
  return ({
    item: (index: number) => {
      let tmp: HTMLElement = documentHandle as any;
      return {
        ...tmp,
        addEventListener: MOCK_ADD,
        removeEventListener: MOCK_REM,
        className: name,
      };
    },
    namedItem: jest.fn(),
  } as any) as HTMLCollectionOf<Element>;
});

// Mocking setState to listen for the call
const MOCK_SET = jest.fn();
ContextMenuClass.prototype.setState = MOCK_SET;

// Constants used in testing
const MOCK_ADD = jest.fn((name: string, callback: (event: any) => void) => {
  if (name === "contextmenu") documentRightClick = callback;
});
const MOCK_REM = jest.fn((_) => {
  // TODO: Should this lint be disabled?
  // eslint-disable-next-line no-restricted-globals
  if (name === "contextmenu") documentRightClick = jest.fn;
});
const MOCK_EVENT = {
  preventDefault: jest.fn(),
  stopPropagation: jest.fn(),
} as any;

const CLASS_WITH_DROPDOWN: string = "dropdown";
const CLASS_WITHOUT_DROPDOWN: string = "noDropdown";
const TEST_OPTIONS: MenuType[] = [
  ["option0", jest.fn()],
  ["options1", jest.fn()],
];

// Variables used in testing
var documentHandle: ReactElement;
var documentRightClick: (event: any) => void;

var contextMaster: ReactTestRenderer;
var contextHandle: ReactTestInstance;

beforeAll(() => {
  documentHandle = (
    <div
      className={CLASS_WITH_DROPDOWN}
      onContextMenu={(e) => {
        documentRightClick(e);
      }}
    />
  );
  renderer.act(() => {
    contextMaster = renderer.create(
      <div>
        {documentHandle}
        <ContextMenu anchorName={CLASS_WITH_DROPDOWN} options={TEST_OPTIONS} />
      </div>
    );
  });
  contextHandle = contextMaster.root.findByType(ContextMenuClass);
});
afterAll(() => {
  // Clear calls to mock set
  MOCK_SET.mockClear();
  MOCK_EVENT.preventDefault.mockClear();
  MOCK_EVENT.stopPropagation.mockClear();
  for (let i: number = 0; i < TEST_OPTIONS.length; i++)
    (TEST_OPTIONS[i][1] as any).mockClear();
});

describe("Testing the ContextMenu via a mock component", () => {
  it("Should have extracted the correct anchor (ensures that the tests are valid)", () => {
    expect(renderer.create(contextHandle.instance.anchor).toJSON()).toEqual(
      renderer.create(documentHandle).toJSON()
    );
  });

  it("Opens when openMenu called with target being proper element", () => {
    contextHandle.instance.openMenu({
      ...MOCK_EVENT,
      currentTarget: <div className={CLASS_WITHOUT_DROPDOWN} />,
    });
    expect(MOCK_SET).toBeCalledTimes(0);

    contextHandle.instance.openMenu({
      ...MOCK_EVENT,
      currentTarget: contextHandle.instance.anchor,
    });
    expect(MOCK_SET).toHaveBeenCalledWith({ isOpen: true });
  });

  it("Closes upon closeMenu being called", () => {
    contextHandle.instance.state.isOpen = true;
    contextHandle.instance.closeMenu(MOCK_EVENT);

    handleCloseTest();
  });

  it("Calls the function passed in upon having a click to the menu item", () => {
    let subCard: ReactElement = contextHandle.instance.mapItems(
      TEST_OPTIONS[0],
      0
    );
    subCard.props.onClick(MOCK_EVENT);

    handleCloseTest();
    expect(TEST_OPTIONS[0][1]).toHaveBeenCalled();
  });
});

function handleCloseTest() {
  expect(MOCK_SET).toHaveBeenCalledWith({ isOpen: false });
  expect(MOCK_EVENT.stopPropagation).toHaveBeenCalled();
}
