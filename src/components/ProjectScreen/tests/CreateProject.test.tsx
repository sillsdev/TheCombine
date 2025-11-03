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
  /** Mocked with Input that triggers the `setCode` prop when typed in. */
  LanguagePicker: (props: { setCode: (code: string) => void }) => (
    <MockLP
      data-testid={mockLangPickerId}
      onChange={(e) => props.setCode(e.target.value)}
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
  it("errors on taken name", async () => {
    // Input project name and vernacular language.
    const nameInput = screen.getByRole("textbox");
    await userEvent.type(nameInput, "non-empty-name");
    const vernInput = screen.getAllByRole("textbox")[1];
    await userEvent.type(vernInput, "non-empty-code");

    // Error appears when duplicate name submitted.
    expect(screen.queryByText(CreateProjectTextId.NameTaken)).toBeNull();
    mockProjectDuplicateCheck.mockResolvedValueOnce(true);
    await userEvent.click(
      screen.getByRole("button", { name: CreateProjectTextId.Create })
    );
    expect(screen.queryByText(CreateProjectTextId.NameTaken)).toBeTruthy();
  });

  it("disables submit button when empty name or empty vern lang bcp code", async () => {
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
    const vernInput = screen.getAllByRole("textbox")[1];
    await userEvent.type(vernInput, "non-empty-code");
    expect(button).toBeEnabled();

    // Change name to whitespace: button disabled again.
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, "   ");
    expect(button).toBeDisabled();
  });

  it("disables language picker(s) when file selected", async () => {
    // Hides language pickers until project name is typed.
    expect(screen.queryByTestId(mockLangPickerId)).toBeNull();
    await userEvent.type(screen.getByRole("textbox"), "non-empty-name");
    expect(screen.queryAllByTestId(mockLangPickerId)).toHaveLength(2);

    // File with no writing systems only disables analysis lang picker.
    mockUploadLiftAndGetWritingSystems.mockResolvedValueOnce([]);
    await userEvent.click(screen.getByText(CreateProjectTextId.UploadBrowse));
    expect(screen.queryAllByTestId(mockLangPickerId)).toHaveLength(1);

    // File with writing systems disables both lang pickers.
    mockUploadLiftAndGetWritingSystems.mockResolvedValueOnce(mockLangs);
    await userEvent.click(screen.getByText(CreateProjectTextId.UploadBrowse));
    expect(screen.queryAllByTestId(mockLangPickerId)).toHaveLength(0);
  });

  it("offers vern langs when file has some", async () => {
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
