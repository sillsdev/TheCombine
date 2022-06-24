import { Provider } from "react-redux";
import renderer, {
  ReactTestInstance,
  ReactTestRenderer,
} from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import TreeDepiction from "components/TreeView/TreeDepiction";
import TreeView from "components/TreeView/TreeViewComponent";
import { defaultState as treeViewState } from "components/TreeView/TreeViewReducer";
import mockMap, {
  jsonDomain as mockDomain,
} from "components/TreeView/tests/MockSemanticDomain";
import { newWritingSystem } from "types/writingSystem";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (str: string) => str }),
  withTranslation: () => (Component: any) => {
    Component.defaultProps = {
      ...Component.defaultProps,
      t: (s: string) => s,
      i18n: { resolvedLanguage: "" },
    };
    return Component;
  },
}));

var treeMaster: ReactTestRenderer;
var treeHandle: ReactTestInstance;

// Mock out Zoom to avoid issues with portals
jest.mock("@material-ui/core", () => {
  const realMaterialUi = jest.requireActual("@material-ui/core");
  return {
    ...realMaterialUi,
    Zoom: realMaterialUi.Container,
  };
});

const mockStore = configureMockStore()({
  treeViewState: {
    ...treeViewState,
    currentDomain: mockMap[mockDomain.id],
    domainMap: mockMap,
  },
  currentProjectState: {
    project: { semDomWritingSystem: newWritingSystem() },
  },
});

beforeAll(() => {
  createTree();
});

describe("TreeView", () => {
  it("Renders without crashing", () => {
    createTree();
    expect(treeHandle).toBeTruthy();
  });
});

function createTree(): void {
  renderer.act(() => {
    treeMaster = renderer.create(
      <Provider store={mockStore}>
        <TreeView returnControlToCaller={jest.fn()} />
      </Provider>
    );
  });
  treeHandle = treeMaster.root.findByType(TreeDepiction).instance;
}
