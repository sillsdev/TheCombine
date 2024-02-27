import { Provider } from "react-redux";
import { ReactTestRenderer, act, create } from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import "localization/mocks/reactI18nextMock";

import { DeleteButtonWithDialog } from "components/Buttons";
import { defaultState as reviewEntriesState } from "goals/ReviewEntries/Redux/ReviewEntriesReduxTypes";
import DeleteCell from "goals/ReviewEntries/ReviewEntriesTable/CellComponents/DeleteCell";
import mockWords from "goals/ReviewEntries/tests/WordsMock";

// Dialog uses portals, which are not supported in react-test-renderer.
jest.mock("@mui/material", () => {
  const materialUiCore = jest.requireActual("@mui/material");
  return {
    ...jest.requireActual("@mui/material"),
    Dialog: materialUiCore.Container,
  };
});

jest.mock("backend", () => ({
  deleteFrontierWord: () => jest.fn(),
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

const mockStore = configureMockStore()({ reviewEntriesState });
const mockWord = mockWords()[0];

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
  it("renders", () => {
    cellHandle.root.findByType(DeleteButtonWithDialog);
  });
});
