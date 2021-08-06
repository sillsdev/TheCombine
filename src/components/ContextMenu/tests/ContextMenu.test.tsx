import { ReactElement } from "react";
import renderer, {
  ReactTestInstance,
  ReactTestRenderer,
} from "react-test-renderer";

import ContextMenu, {
  MenuType,
  RIGHT_CLICK,
} from "components/ContextMenu/ContextMenu";

// Mock DOM
jest.autoMockOn();

// Mocking document's search function
document.getElementsByClassName = jest.fn((className: string) => {
  return {
    item: () => ({
      ...documentHandle,
      addEventListener: MOCK_ADD,
      className,
    }),
    namedItem: jest.fn(),
  } as any as HTMLCollectionOf<Element>;
});

// Mocking setState to listen for the call
const MOCK_SET = jest.fn();
ContextMenu.prototype.setState = MOCK_SET;

// Constants used in testing
const MOCK_ADD = jest.fn((name: string, callback: (event: any) => void) => {
  if (name === RIGHT_CLICK) {
    documentRightClick = callback;
  }
});
const MOCK_EVENT = {
  preventDefault: jest.fn(),
  stopPropagation: jest.fn(),
};

const CLASS_WITH_DROPDOWN = "dropdown";
const CLASS_WITHOUT_DROPDOWN = "noDropdown";
const TEST_OPTIONS: MenuType[] = [
  ["option0", jest.fn()],
  ["option1", jest.fn()],
];

// Variables used in testing
let documentHandle: ReactElement;
let documentRightClick: (event: any) => void;

let contextMaster: ReactTestRenderer;
let contextHandle: ReactTestInstance;

beforeAll(() => {
  documentHandle = (
    <div className={CLASS_WITH_DROPDOWN} onContextMenu={documentRightClick} />
  );
  renderer.act(() => {
    contextMaster = renderer.create(
      <div>
        {documentHandle}
        <ContextMenu anchorName={CLASS_WITH_DROPDOWN} options={TEST_OPTIONS} />
      </div>
    );
  });
  contextHandle = contextMaster.root.findByType(ContextMenu);
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
    const subCard: ReactElement = contextHandle.instance.mapItems(
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
