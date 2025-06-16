import { Button as MockFIP, ButtonProps, Input as MockLP } from "@mui/material";
import "@testing-library/jest-dom";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";

import CreateProject, {
  CreateProjectId,
  CreateProjectTextId,
} from "components/ProjectScreen/CreateProject";
import { defaultState } from "rootRedux/types";
import { newWritingSystem } from "types/writingSystem";

jest.mock("mui-language-picker", () => ({
  ...jest.requireActual("mui-language-picker"),
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
jest.mock("components/Buttons", () => ({
  ...jest.requireActual("components/Buttons"),
  FileInputButton: (props: {
    buttonProps?: ButtonProps & { "data-testid"?: string };
    updateFile: (file: File) => void;
  }) => (
    <MockFIP
      {...props.buttonProps}
      onClick={() => props.updateFile(new File([], "file-name"))}
    />
  ),
}));
// Mock "i18n", else `thrown: "Error: AggregateError [...]`
jest.mock("i18n", () => ({ language: "" }));

const mockLangPickerId = "mock-mui-language-picker";
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
    const inputs = screen.getAllByRole("textbox");
    await userEvent.type(inputs[0], "non-empty-name");
    await userEvent.type(inputs[1], "non-empty-code");
    expect(screen.queryByText(CreateProjectTextId.NameTaken)).toBeNull();

    mockProjectDuplicateCheck.mockResolvedValueOnce(true);
    await userEvent.click(screen.getByTestId(CreateProjectId.ButtonSubmit));
    expect(screen.queryByText(CreateProjectTextId.NameTaken)).toBeTruthy();
  });

  it("disables submit button when empty name or empty vern lang bcp code", async () => {
    const button = screen.getByTestId(CreateProjectId.ButtonSubmit);
    const inputs = screen.getAllByRole("textbox");

    // Start with empty name and vern language: button disabled.
    expect(button).toBeDisabled();

    // Add name but still no vern language: button still disabled.
    await userEvent.type(inputs[0], "non-empty-name");
    expect(button).toBeDisabled();

    // Also add a vern language: button enabled.
    await userEvent.type(inputs[1], "non-empty-code");
    expect(button).toBeEnabled();

    // Change name to whitespace: button disabled again.
    await userEvent.clear(inputs[0]);
    await userEvent.type(inputs[0], "   ");
    expect(button).toBeDisabled();
  });

  it("disables analysis language pickers when file selected", async () => {
    expect(screen.queryAllByTestId(mockLangPickerId)).toHaveLength(2);

    // File with no writing systems only disables analysis lang picker.
    mockUploadLiftAndGetWritingSystems.mockResolvedValueOnce([]);
    await userEvent.click(screen.getByTestId(CreateProjectId.ButtonSelectFile));
    expect(screen.queryAllByTestId(mockLangPickerId)).toHaveLength(1);

    // File with writing systems disables both lang pickers.
    const langs = [newWritingSystem("oneLang"), newWritingSystem("twoLang")];
    mockUploadLiftAndGetWritingSystems.mockResolvedValueOnce(langs);
    await userEvent.click(screen.getByTestId(CreateProjectId.ButtonSelectFile));
    expect(screen.queryAllByTestId(mockLangPickerId)).toHaveLength(0);
  });

  it("offers vern langs when file has some", async () => {
    const langs = [newWritingSystem("redLang"), newWritingSystem("blueLang")];
    mockUploadLiftAndGetWritingSystems.mockResolvedValueOnce(langs);
    expect(screen.queryByTestId(CreateProjectId.SelectVern)).toBeNull();
    expect(screen.queryByRole("combobox")).toBeNull();
    await userEvent.click(screen.getByTestId(CreateProjectId.ButtonSelectFile));

    // Open the select, whose button is a combobox
    expect(screen.queryByTestId(CreateProjectId.SelectVern)).toBeTruthy();
    await userEvent.click(screen.getByRole("combobox"));

    // Number of options is +2 for the menu title item and an "other" item.
    expect(screen.getAllByRole("option")).toHaveLength(langs.length + 2);
  });
});
