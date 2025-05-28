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

const muiMd = 900;

describe("TreeView", () => {
  for (const width of [muiMd - 1, muiMd + 1]) {
    describe(width < muiMd ? "renders narrow" : "renders wide", () => {
      beforeAll(() => {
        // Required (along with a `ThemeProvider`) for `useMediaQuery` to work
        setMatchMedia(width);
      });

      describe("without exit", () => {
        beforeEach(async () => {
          await renderTree(undefined);
        });

        it("has top button", async () => {
          expect(screen.queryByTestId(TreeViewIds.ButtonTop)).toBeTruthy();
        });

        it("has no exit button", async () => {
          expect(screen.queryByTestId(TreeViewIds.ButtonExit)).toBeNull();
        });
      });

      describe("with exit", () => {
        const mockExit = jest.fn();

        beforeEach(async () => {
          mockExit.mockClear();
          await renderTree(mockExit);
        });

        it("has top button", async () => {
          expect(screen.queryByTestId(TreeViewIds.ButtonTop)).toBeTruthy();
        });

        it("exits via exit button", async () => {
          expect(mockExit).not.toHaveBeenCalled();
          await userEvent.click(screen.getByTestId(TreeViewIds.ButtonExit));
          expect(mockExit).toHaveBeenCalledTimes(1);
        });

        it("exits via escape key", async () => {
          expect(mockExit).not.toHaveBeenCalled();
          await userEvent.keyboard("{Escape}");
          expect(mockExit).toHaveBeenCalledTimes(1);
        });
      });
    });
  }
});

async function renderTree(exit?: () => void): Promise<void> {
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
