import React from "react";
import DataEntryComponent from "../DataEntryComponent";
import SemanticDomainWithSubdomains, {
  baseDomain,
} from "../../../types/SemanticDomain";
import configureMockStore from "redux-mock-store";
import renderer, {
  ReactTestInstance,
  ReactTestRenderer,
} from "react-test-renderer";
import { Provider } from "react-redux";
import { DataEntryTable } from "../DataEntryTable/DataEntryTable";
import { DataEntryHeader } from "../DataEntryHeader/DataEntryHeader";

jest.mock("../DataEntryHeader/DataEntryHeader");
jest.mock("../DataEntryTable/DataEntryTable");
jest.mock("../../TreeView");
jest.mock("../../AppBar/AppBarComponent"); //ReactTestRenderer doesn't like rendering UserMenu
jest.mock("@material-ui/core/Dialog");
const createMockStore = configureMockStore([]);
const mockStore = createMockStore({});

let testRenderer: ReactTestRenderer;
// const newDomain = { ...baseDomain, questions: ["Q1", "Q2", "Q3"] };

// beforeEach(() => {
//   renderer.act(() => {
//     testRenderer = renderer.create(
//       <Provider store={mockStore}>
//         <DataEntryComponent domain={newDomain} />
//       </Provider>
//     );
//   });
// });
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
describe("Tests DataEntryComponent", () => {
  fit("Questions hidden on complete clicked", () => {
    const newDomain = { ...baseDomain, questions: ["Q1", "Q2", "Q3"] };
    const parentInstance: ReactTestInstance = createDataEntryComponentInstance(
      newDomain
    );
    // parentInstance.instance.setState({ questionsVisible: true }, () => {
    const tableInstance = parentInstance.findAllByType(DataEntryTable)[0];
    tableInstance.findByProps({ id: "complete" }).props.onClick();
    const headerInstance = parentInstance.findAllByType(DataEntryHeader)[0];
    newDomain.questions.forEach((questionString, index) => {
      let question: ReactTestInstance = headerInstance.findByProps({
        id: `q${index}`,
      });
      expect(question.props.children).toEqual(questionString);
    });
    // });
  });
});

function createDataEntryComponentInstance(
  dom: SemanticDomainWithSubdomains
): ReactTestInstance {
  return renderer.create(
    <Provider store={mockStore}>
      <DataEntryComponent domain={dom} />
    </Provider>
  ).root;
}
