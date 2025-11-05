import { Button as MockFIB, Input as MockLP } from "@mui/material";
import "@testing-library/jest-dom";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReactNode } from "react";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";

import CreateProject, {
  CreateProjectTextId,
} from "components/ProjectScreen/CreateProject";
import { defaultState } from "rootRedux/types";
import { newWritingSystem } from "types/writingSystem";

jest.mock("components/LanguagePicker", () => ({
  __esModule: true,
  /** Mocked with Input that triggers the `setCode`, `setName` props when typed in. */
  default: (props: {
    setCode: (code: string) => void;
    setName: (name: string) => void;
  }) => (
    <MockLP
      data-testid={mockLangPickerId}
      onChange={(e) => {
        props.setCode(e.target.value);
        props.setName(e.target.value);
      }}
    />
  ),
}));

jest.mock("backend", () => ({
  projectDuplicateCheck: () => mockProjectDuplicateCheck(),
  uploadLiftAndGetWritingSystems: () => mockUploadLiftAndGetWritingSystems(),
}));
jest.mock("components/Buttons/FileInputButton", () => ({
  __esModule: true,
  default: (props: {
    children?: ReactNode;
    /** Clicking will call this with a mock file with nonempty file name. */
    updateFile: (file: File) => void;
  }) => (
    <MockFIB onClick={() => props.updateFile(mockFile)}>
      {props.children}
    </MockFIB>
  ),
}));
jest.mock("i18n", () => ({ language: "" })); // else `thrown: "Error: AggregateError`

const mockFile = new File([], "file-name");
const mockLangPickerId = "mock-mui-language-picker";
const mockLangs = [newWritingSystem("oneLang"), newWritingSystem("twoLang")];
const mockProjectDuplicateCheck = jest.fn();
const mockUploadLiftAndGetWritingSystems = jest.fn();

beforeEach(async () => {
  jest.resetAllMocks();
  await act(async () => {
    render(
      <Provider store={configureMockStore()(defaultState)}>
        <CreateProject />
      </Provider>
    );
  });
});

describe("CreateProject", () => {
  it("enables language pickers when name nonempty", async () => {
    // No language pickers by default.
    expect(screen.queryByTestId(mockLangPickerId)).toBeNull();
    const nameInput = screen.getByRole("textbox");

    // Typing in name shows both language pickers.
    await userEvent.type(nameInput, "non-empty-name");
    expect(screen.getAllByTestId(mockLangPickerId)).toHaveLength(2);

    // Clearing name hides both language pickers.
    await userEvent.clear(nameInput);
    expect(screen.queryByTestId(mockLangPickerId)).toBeNull();
  });

  it("keeps language pickers when vernacular language nonempty", async () => {
    // No language pickers by default.
    expect(screen.queryByTestId(mockLangPickerId)).toBeNull();

    // Language pickers don't hide if vernacular language is filled.
    const nameInput = screen.getByRole("textbox");
    await userEvent.type(nameInput, "non-empty-name");
    await userEvent.type(screen.getAllByTestId(mockLangPickerId)[0], "lang");
    await userEvent.clear(nameInput);
    expect(screen.getAllByTestId(mockLangPickerId)).toHaveLength(2);
  });

  it("keeps language pickers when analysis language nonempty", async () => {
    // No language pickers by default.
    expect(screen.queryByTestId(mockLangPickerId)).toBeNull();

    // Language pickers don't hide if analysis language is filled.
    const nameInput = screen.getByRole("textbox");
    await userEvent.type(nameInput, "non-empty-name");
    await userEvent.type(screen.getAllByTestId(mockLangPickerId)[1], "lang");
    await userEvent.clear(nameInput);
    expect(screen.getAllByTestId(mockLangPickerId)).toHaveLength(2);
  });

  it("errors on taken name", async () => {
    // Input project name and vernacular language.
    await userEvent.type(screen.getByRole("textbox"), "non-empty-name");
    await userEvent.type(screen.getAllByTestId(mockLangPickerId)[0], "lang");

    // Error appears when duplicate name submitted.
    expect(screen.queryByText(CreateProjectTextId.NameTaken)).toBeNull();
    mockProjectDuplicateCheck.mockResolvedValueOnce(true);
    await userEvent.click(
      screen.getByRole("button", { name: CreateProjectTextId.Create })
    );
    expect(screen.queryByText(CreateProjectTextId.NameTaken)).toBeTruthy();
  });

  it("disables submit button when name or vernacular language is empty", async () => {
    const button = screen.getByRole("button", {
      name: CreateProjectTextId.Create,
    });

    // Start with empty name and vern language: button disabled.
    expect(button).toBeDisabled();

    // Add name but still no vern language: button still disabled.
    const nameInput = screen.getByRole("textbox");
    await userEvent.type(nameInput, "non-empty-name");
    expect(button).toBeDisabled();

    // Also add a vern language: button enabled.
    await userEvent.type(screen.getAllByTestId(mockLangPickerId)[0], "lang");
    expect(button).toBeEnabled();

    // Change name to whitespace: button disabled again.
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, "   ");
    expect(button).toBeDisabled();
  });

  it("enables 1 language picker when file selected without writing systems", async () => {
    // No language pickers by default.
    expect(screen.queryByTestId(mockLangPickerId)).toBeNull();

    // File with no writing systems only enables vernacular lang picker.
    mockUploadLiftAndGetWritingSystems.mockResolvedValueOnce([]);
    await userEvent.click(screen.getByText(CreateProjectTextId.UploadBrowse));
    expect(screen.getByTestId(mockLangPickerId)).toBeTruthy();
  });

  it("enables 0 language pickers when file selected with writing systems", async () => {
    // No language pickers by default.
    expect(screen.queryByTestId(mockLangPickerId)).toBeNull();

    // File with writing systems enables no lang pickers.
    mockUploadLiftAndGetWritingSystems.mockResolvedValueOnce(mockLangs);
    await userEvent.click(screen.getByText(CreateProjectTextId.UploadBrowse));
    expect(screen.queryByTestId(mockLangPickerId)).toBeNull();
  });

  it("offers vernacular languages when file has some", async () => {
    // No vern combobox selector by default.
    expect(screen.queryByRole("combobox")).toBeNull();

    // Mock-select a file with multiple languages.
    mockUploadLiftAndGetWritingSystems.mockResolvedValueOnce(mockLangs);
    await userEvent.click(screen.getByText(CreateProjectTextId.UploadBrowse));

    // Open the select, whose button is a combobox.
    await userEvent.click(screen.getByRole("combobox"));

    // Number of options is +2 for the menu title item and an "other" item.
    expect(screen.getAllByRole("option")).toHaveLength(mockLangs.length + 2);
  });
});
