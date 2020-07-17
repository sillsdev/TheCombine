import React from "react";
import DataEntryComponent from "../DataEntryComponent";
import SemanticDomainWithSubdomains, {
  baseDomain,
} from "../../../types/SemanticDomain";
import configureMockStore from "redux-mock-store";
import renderer, { ReactTestInstance } from "react-test-renderer";
import { Provider } from "react-redux";
import { DataEntryTable } from "../DataEntryTable/DataEntryTable";
import { DataEntryHeader } from "../DataEntryHeader/DataEntryHeader";

jest.mock("../../TreeView");
jest.mock("../../AppBar/AppBarComponent"); //ReactTestRenderer doesn't like rendering UserMenu
jest.mock("@material-ui/core/Dialog");
jest.mock("../../Pronunciations/Recorder");
const createMockStore = configureMockStore([]);
const mockStore = createMockStore({});

//Needed to mock window until refactored
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
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

    const tableInstances = parentInstance.findAllByType(DataEntryTable);
    const headerInstances = parentInstance.findAllByType(DataEntryHeader);
    expect(tableInstances.length).toBe(1);
    expect(headerInstances.length).toBe(1);
    const tableInstance = tableInstances[0];
    const headerInstance = headerInstances[0];

    const questionSwitch: ReactTestInstance = headerInstance.findByProps({
      id: "questionVisibilitySwitch",
    });
    questionSwitch.props.onChange();
    expect(questionSwitch.props.checked).toBeTruthy();
    const completeButtonHandle = tableInstance.findAllByProps({
      id: "complete",
    })[0];
    completeButtonHandle.props.onClick();
    expect(questionSwitch.props.checked).toBeFalsy();
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
