import { ThemeProvider } from "@mui/material/styles";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";

import TreeView, { TreeViewIds } from "components/TreeView";
import { defaultState as treeViewState } from "components/TreeView/Redux/TreeViewReduxTypes";
import mockMap, { mapIds } from "components/TreeView/tests/SemanticDomainMock";
import theme from "types/theme";
import { newWritingSystem } from "types/writingSystem";
import { setMatchMedia } from "utilities/testingLibraryUtilities";

jest.mock("rootRedux/hooks", () => {
  return {
    ...jest.requireActual("rootRedux/hooks"),
    useAppDispatch: () => jest.fn(),
  };
});

const mockStore = configureMockStore()({
  treeViewState: { ...treeViewState, currentDomain: mockMap[mapIds.parent] },
  currentProjectState: {
    project: { semDomWritingSystem: newWritingSystem() },
  },
});

const muiSM = 600;

describe("TreeView", () => {
  it("renders without top button in xs windows", async () => {
    await renderTree(undefined, muiSM - 1);
    expect(screen.queryByTestId(TreeViewIds.ButtonTop)).toBeNull();
  });

  it("renders with top button in sm+ windows", async () => {
    await renderTree(undefined, muiSM);
    expect(screen.queryByTestId(TreeViewIds.ButtonTop)).toBeTruthy();
  });

  it("renders with no exit button by default", async () => {
    await renderTree();
    expect(screen.queryByTestId(TreeViewIds.ButtonExit)).toBeNull();
  });

  it("exits via exit button", async () => {
    const mockExit = jest.fn();
    await renderTree(mockExit);
    expect(mockExit).not.toHaveBeenCalled();
    await userEvent.click(screen.getByTestId(TreeViewIds.ButtonExit));
    expect(mockExit).toHaveBeenCalledTimes(1);
  });

  it("exits via escape key", async () => {
    const mockExit = jest.fn();
    await renderTree(mockExit);
    expect(mockExit).not.toHaveBeenCalled();
    await userEvent.keyboard("{Escape}");
    expect(mockExit).toHaveBeenCalledTimes(1);
  });
});

async function renderTree(exit?: () => void, width?: number): Promise<void> {
  // Required (along with a `ThemeProvider`) for `useMediaQuery` to work
  setMatchMedia(width);

  await act(async () => {
    render(
      <ThemeProvider theme={theme}>
        <Provider store={mockStore}>
          <TreeView returnControlToCaller={jest.fn()} exit={exit} />
        </Provider>
      </ThemeProvider>
    );
  });
}
