import { Provider } from "react-redux";
import { ReactTestRenderer, act, create } from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import "tests/reactI18nextMock";

import { CancelConfirmDialog } from "components/Dialogs";
import DeleteCell, {
  buttonId,
  buttonIdCancel,
  buttonIdConfirm,
} from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/DeleteCell";
import { defaultState as reviewEntriesState } from "goals/ReviewEntries/ReviewEntriesComponent/Redux/ReviewEntriesReduxTypes";
import mockWords from "goals/ReviewEntries/ReviewEntriesComponent/tests/WordsMock";

// Dialog uses portals, which are not supported in react-test-renderer.
jest.mock("@mui/material", () => {
  const materialUiCore = jest.requireActual("@mui/material");
  return {
    ...jest.requireActual("@mui/material"),
    Dialog: materialUiCore.Container,
  };
});

jest.mock("backend", () => ({
  deleteFrontierWord: () => mockDeleteFrontierWord(),
}));
jest.mock("types/hooks", () => {
  return {
    ...jest.requireActual("types/hooks"),
    useAppDispatch:
      () =>
      (...args: any[]) =>
        Promise.resolve(args),
  };
});

const mockDeleteFrontierWord = jest.fn();

const mockStore = configureMockStore()({ reviewEntriesState });
const mockWord = mockWords()[0];
const buttonIdDelete = buttonId(mockWord.id);

let cellHandle: ReactTestRenderer;

const renderDeleteCell = async (): Promise<void> => {
  await act(async () => {
    cellHandle = create(
      <Provider store={mockStore}>
        <DeleteCell rowData={mockWord} />
      </Provider>
    );
  });
};

beforeEach(async () => {
  jest.clearAllMocks();
  await renderDeleteCell();
});

describe("DeleteCell", () => {
  it("has working dialog buttons", async () => {
    const dialog = cellHandle.root.findByType(CancelConfirmDialog);
    const deleteButton = cellHandle.root.findByProps({ id: buttonIdDelete });
    const cancelButton = cellHandle.root.findByProps({ id: buttonIdCancel });
    const confButton = cellHandle.root.findByProps({ id: buttonIdConfirm });

    expect(dialog.props.open).toBeFalsy();
    await act(async () => {
      deleteButton.props.onClick();
    });
    expect(dialog.props.open).toBeTruthy();
    await act(async () => {
      cancelButton.props.onClick();
    });
    expect(dialog.props.open).toBeFalsy();
    await act(async () => {
      deleteButton.props.onClick();
    });
    expect(dialog.props.open).toBeTruthy();
    await act(async () => {
      await confButton.props.onClick();
    });
    expect(dialog.props.open).toBeFalsy();
  });

  it("only deletes after confirmation", async () => {
    const deleteButton = cellHandle.root.findByProps({ id: buttonIdDelete });
    const cancelButton = cellHandle.root.findByProps({ id: buttonIdCancel });
    const confButton = cellHandle.root.findByProps({ id: buttonIdConfirm });

    await act(async () => {
      deleteButton.props.onClick();
      cancelButton.props.onClick();
      deleteButton.props.onClick();
    });
    expect(mockDeleteFrontierWord).not.toBeCalled();
    await act(async () => {
      await confButton.props.onClick();
    });
    expect(mockDeleteFrontierWord).toBeCalled();
  });
});
