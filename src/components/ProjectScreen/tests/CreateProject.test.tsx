import { LanguagePicker } from "mui-language-picker";
import { type FormEvent } from "react";
import { Provider } from "react-redux";
import {
  type ReactTestInstance,
  type ReactTestRenderer,
  act,
  create,
} from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import { FileInputButton } from "components/Buttons";
import CreateProject, {
  buttonIdSubmit,
  fieldIdName,
  formId,
  selectIdVern,
} from "components/ProjectScreen/CreateProject";
import { newWritingSystem } from "types/writingSystem";

jest.mock("backend", () => ({
  projectDuplicateCheck: () => mockProjectDuplicateCheck(),
  uploadLiftAndGetWritingSystems: () => mockUploadLiftAndGetWritingSystems(),
}));
// Mock "i18n", else `thrown: "Error: Error: connect ECONNREFUSED ::1:80 [...]`
jest.mock("i18n", () => ({ language: "" }));

const mockProjectDuplicateCheck = jest.fn();
const mockUploadLiftAndGetWritingSystems = jest.fn();

const createMockStore = configureMockStore();
const mockState = { currentProjectState: { project: {} } };
const mockStore = createMockStore(mockState);

const mockChangeEvent = (
  value: string
): { target: Partial<EventTarget & HTMLSelectElement> } => ({
  target: { value },
});
const mockSubmitEvent = (): Partial<FormEvent<HTMLFormElement>> => ({
  preventDefault: jest.fn(),
});

let projectMaster: ReactTestRenderer;
let projectHandle: ReactTestInstance;

beforeAll(async () => {
  await act(async () => {
    projectMaster = create(
      <Provider store={mockStore}>
        <CreateProject />
      </Provider>
    );
  });
  projectHandle = projectMaster.root;
});

beforeEach(() => {
  jest.resetAllMocks();
});

describe("CreateProject", () => {
  it("errors on empty name", async () => {
    const nameField = projectHandle.findByProps({ id: fieldIdName });
    expect(nameField.props.error).toBeFalsy();

    await act(async () => {
      projectHandle
        .findByProps({ id: formId })
        .props.onSubmit(mockSubmitEvent());
    });
    expect(nameField.props.error).toBeTruthy();
  });

  it("errors on taken name", async () => {
    const nameField = projectHandle.findByProps({ id: fieldIdName });
    await act(async () => {
      nameField.props.onChange(mockChangeEvent("non-empty-value"));
    });
    expect(nameField.props.error).toBeFalsy();

    mockProjectDuplicateCheck.mockResolvedValueOnce(true);
    await act(async () => {
      projectHandle
        .findByProps({ id: formId })
        .props.onSubmit(mockSubmitEvent());
    });
    expect(nameField.props.error).toBeTruthy();
  });

  it("disables submit button when no vern lang bcp code", async () => {
    const button = projectHandle.findByProps({ id: buttonIdSubmit });
    expect(button.props.disabled).toBeTruthy();
    const langPickers = projectHandle.findAllByType(LanguagePicker);
    expect(langPickers).toHaveLength(2);

    await act(async () => {
      langPickers[0].props.setCode("non-empty");
    });
    expect(button.props.disabled).toBeFalsy();
  });

  it("disables analysis language pickers when file selected", async () => {
    const button = projectHandle.findByType(FileInputButton);
    expect(projectHandle.findAllByType(LanguagePicker)).toHaveLength(2);

    // File with no writing systems only disables analysis lang picker.
    mockUploadLiftAndGetWritingSystems.mockResolvedValueOnce([]);
    await act(async () => {
      button.props.updateFile(new File([], ""));
    });
    expect(projectHandle.findAllByType(LanguagePicker)).toHaveLength(1);

    // File with writing systems disables both lang pickers.
    mockUploadLiftAndGetWritingSystems.mockResolvedValueOnce([
      newWritingSystem(),
    ]);
    await act(async () => {
      button.props.updateFile(new File([], "oneLang"));
    });
    expect(projectHandle.findAllByType(LanguagePicker)).toHaveLength(0);
  });

  it("offers vern langs when file has some", async () => {
    const button = projectHandle.findByType(FileInputButton);
    const langs = [newWritingSystem("redLang"), newWritingSystem("blueLang")];
    mockUploadLiftAndGetWritingSystems.mockResolvedValueOnce(langs);
    await act(async () => {
      button.props.updateFile(new File([], "twoLang"));
    });
    const vernSelect = projectHandle.findByProps({ id: selectIdVern });
    // Number of options is +2 for the menu title item and an "other" item.
    expect(vernSelect.props.children).toHaveLength(langs.length + 2);
  });
});
