import { Provider } from "react-redux";
import { type ReactTestRenderer, act, create } from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import CharacterDetail from "goals/CharacterInventory/CharInv/CharacterDetail";
import {
  buttonIdCancel,
  buttonIdConfirm,
  buttonIdSubmit,
} from "goals/CharacterInventory/CharInv/CharacterDetail/FindAndReplace";
import CharacterReplaceDialog from "goals/CharacterInventory/CharInv/CharacterDetail/FindAndReplace/CharacterReplaceDialog";
import { defaultState } from "goals/CharacterInventory/Redux/CharacterInventoryReduxTypes";
import { type StoreState } from "types";
import { testInstanceHasText } from "utilities/testRendererUtilities";

// Dialog uses portals, which are not supported in react-test-renderer.
jest.mock("@mui/material", () => {
  const materialUiCore = jest.requireActual("@mui/material");
  return {
    ...jest.requireActual("@mui/material"),
    Dialog: materialUiCore.Container,
  };
});

jest.mock("components/Project/ProjectActions", () => ({}));
jest.mock(
  "goals/CharacterInventory/CharInv/CharacterDetail/FindAndReplace/FindAndReplaceActions",
  () => ({
    findAndReplace: () => mockFindAndReplace(),
  })
);
jest.mock("types/hooks", () => {
  return {
    ...jest.requireActual("types/hooks"),
    useAppDispatch: () => (args: any) => Promise.resolve(args),
  };
});

const mockClose = jest.fn();
const mockFindAndReplace = jest.fn();

let charMaster: ReactTestRenderer;

const mockChar = "#";
// mockPrefix is a single character whose only appearance in the component
// is in an example of a word containing the mockChar.
const mockPrefix = "@";
const mockWord = mockPrefix + mockChar;
const mockState: Partial<StoreState> = {
  characterInventoryState: { ...defaultState, allWords: [mockWord] },
};
const mockStore = configureMockStore()(mockState);

async function renderCharacterDetail(): Promise<void> {
  await act(async () => {
    charMaster = create(
      <Provider store={mockStore}>
        <CharacterDetail character={mockChar} close={mockClose} />
      </Provider>
    );
  });
}

beforeEach(async () => {
  jest.resetAllMocks();
  await renderCharacterDetail();
});

describe("CharacterDetail", () => {
  it("renders with example word", () => {
    expect(testInstanceHasText(charMaster.root, mockPrefix)).toBeTruthy();
  });

  describe("FindAndReplace", () => {
    it("has working dialog", async () => {
      const dialog = charMaster.root.findByType(CharacterReplaceDialog);
      const submitButton = charMaster.root.findByProps({ id: buttonIdSubmit });
      const cancelButton = charMaster.root.findByProps({ id: buttonIdCancel });
      const confButton = charMaster.root.findByProps({ id: buttonIdConfirm });

      expect(dialog.props.open).toBeFalsy();
      await act(async () => {
        submitButton.props.onClick();
      });
      expect(dialog.props.open).toBeTruthy();
      await act(async () => {
        cancelButton.props.onClick();
      });
      expect(dialog.props.open).toBeFalsy();
      await act(async () => {
        submitButton.props.onClick();
      });
      expect(dialog.props.open).toBeTruthy();
      await act(async () => {
        await confButton.props.onClick();
      });
      expect(dialog.props.open).toBeFalsy();
    });

    it("only submits after confirmation", async () => {
      const submitButton = charMaster.root.findByProps({ id: buttonIdSubmit });
      const cancelButton = charMaster.root.findByProps({ id: buttonIdCancel });
      const confButton = charMaster.root.findByProps({ id: buttonIdConfirm });

      await act(async () => {
        submitButton.props.onClick();
        cancelButton.props.onClick();
        submitButton.props.onClick();
      });
      expect(mockFindAndReplace).not.toHaveBeenCalled();
      await act(async () => {
        await confButton.props.onClick();
      });
      expect(mockFindAndReplace).toHaveBeenCalled();
    });
  });
});
