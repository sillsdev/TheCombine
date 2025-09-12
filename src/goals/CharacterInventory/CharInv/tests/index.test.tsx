import {
  act,
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";

import CharInv from "goals/CharacterInventory/CharInv";
import { CharInvCancelSaveIds } from "goals/CharacterInventory/CharInv/CharacterEntry";
import { defaultState } from "rootRedux/types";

jest.mock("goals/CharacterInventory/Redux/CharacterInventoryActions", () => ({
  exit: () => mockExit(),
  loadCharInvData: () => mockLoadCharInvData(),
  uploadAndExit: () => mockUploadAndExit(),
}));
jest.mock("rootRedux/hooks", () => {
  return {
    ...jest.requireActual("rootRedux/hooks"),
    useAppDispatch: () => jest.fn(),
  };
});

const mockExit = jest.fn();
const mockLoadCharInvData = jest.fn();
const mockUploadAndExit = jest.fn();

async function renderCharInvCreation(): Promise<void> {
  await act(async () => {
    render(
      <Provider store={configureMockStore()(defaultState)}>
        <CharInv />
      </Provider>
    );
  });
}

beforeEach(async () => {
  jest.resetAllMocks();
  await renderCharInvCreation();
});

describe("CharInv", () => {
  it("loads data on render", () => {
    expect(mockLoadCharInvData).toHaveBeenCalledTimes(1);
  });

  it("saves inventory on save", async () => {
    expect(mockUploadAndExit).toHaveBeenCalledTimes(0);
    await userEvent.click(screen.getByTestId(CharInvCancelSaveIds.ButtonSave));
    expect(mockUploadAndExit).toHaveBeenCalledTimes(1);
  });

  it("opens a dialogue on cancel, closes on no", async () => {
    expect(screen.queryByRole("dialog")).toBeNull();
    await userEvent.click(
      screen.getByTestId(CharInvCancelSaveIds.ButtonCancel)
    );
    expect(screen.queryByRole("dialog")).toBeTruthy();

    await userEvent.click(
      screen.getByTestId(CharInvCancelSaveIds.DialogCancelButtonNo)
    );
    // Wait for dialog removal, else it's only hidden.
    await waitForElementToBeRemoved(() => screen.queryByRole("dialog"));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("exits on cancel-yes", async () => {
    await userEvent.click(
      screen.getByTestId(CharInvCancelSaveIds.ButtonCancel)
    );
    expect(mockExit).toHaveBeenCalledTimes(0);

    await userEvent.click(
      screen.getByTestId(CharInvCancelSaveIds.DialogCancelButtonYes)
    );
    expect(mockExit).toHaveBeenCalledTimes(1);
  });
});
