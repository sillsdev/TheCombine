import { LanguagePicker } from "mui-language-picker";
import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import "tests/reactI18nextMock";

import { FileInputButton } from "components/Buttons";
import CreateProject, {
  buttonIdSubmit,
  fieldIdName,
  formId,
  selectIdVern,
} from "components/ProjectScreen/CreateProject";
import { defaultState } from "components/ProjectScreen/CreateProject/Redux/CreateProjectReduxTypes";
import { newWritingSystem } from "types/writingSystem";

jest.mock("backend", () => ({
  projectDuplicateCheck: () => mockProjectDuplicateCheck(),
  uploadLiftAndGetWritingSystems: () => mockUploadLiftAndGetWritingSystems(),
}));

const mockProjectDuplicateCheck = jest.fn();
const mockUploadLiftAndGetWritingSystems = jest.fn();

const createMockStore = configureMockStore();
const mockState = {
  currentProjectState: { project: {} },
  createProjectState: defaultState,
};
const mockStore = createMockStore(mockState);

const mockEvent = (value = "") => ({
  preventDefault: jest.fn(),
  target: { value },
});

let projectMaster: renderer.ReactTestRenderer;
let projectHandle: renderer.ReactTestInstance;
4;

beforeAll(async () => {
  await renderer.act(async () => {
    projectMaster = renderer.create(
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

    await renderer.act(async () => {
      projectHandle.findByProps({ id: formId }).props.onSubmit(mockEvent());
    });
    expect(nameField.props.error).toBeTruthy();
  });

  it("errors on taken name", async () => {
    const nameField = projectHandle.findByProps({ id: fieldIdName });
    await renderer.act(async () => {
      nameField.props.onChange(mockEvent("non-empty"));
    });
    expect(nameField.props.error).toBeFalsy();

    mockProjectDuplicateCheck.mockResolvedValueOnce(true);
    await renderer.act(async () => {
      projectHandle.findByProps({ id: formId }).props.onSubmit(mockEvent());
    });
    expect(nameField.props.error).toBeTruthy();
  });

  it("disables submit button when no vern lang bcp code", async () => {
    const button = projectHandle.findByProps({ id: buttonIdSubmit });
    expect(button.props.disabled).toBeTruthy();
    const langPickers = projectHandle.findAllByType(LanguagePicker);
    expect(langPickers).toHaveLength(2);

    await renderer.act(async () => {
      langPickers[0].props.setCode("non-empty");
    });
    expect(button.props.disabled).toBeFalsy();
  });

  it("disables analysis language pickers when file selected", async () => {
    const button = projectHandle.findByType(FileInputButton);
    expect(projectHandle.findAllByType(LanguagePicker)).toHaveLength(2);

    // File with no writing systems only disables analysis lang picker.
    mockUploadLiftAndGetWritingSystems.mockResolvedValueOnce([]);
    await renderer.act(async () => {
      button.props.updateFile(new File([], ""));
    });
    expect(projectHandle.findAllByType(LanguagePicker)).toHaveLength(1);

    // File with writing systems disables both lang pickers.
    mockUploadLiftAndGetWritingSystems.mockResolvedValueOnce([
      newWritingSystem(),
    ]);
    await renderer.act(async () => {
      button.props.updateFile(new File([], "oneLang"));
    });
    expect(projectHandle.findAllByType(LanguagePicker)).toHaveLength(0);
  });

  it("offers vern langs when file has some", async () => {
    const button = projectHandle.findByType(FileInputButton);
    const langs = [newWritingSystem("redLang"), newWritingSystem("blueLang")];
    mockUploadLiftAndGetWritingSystems.mockResolvedValueOnce(langs);
    await renderer.act(async () => {
      button.props.updateFile(new File([], "twoLang"));
    });
    const vernSelect = projectHandle.findByProps({ id: selectIdVern });
    // Number of options is +2 for the menu title item and an "other" item.
    expect(vernSelect.props.children).toHaveLength(langs.length + 2);
  });
});
