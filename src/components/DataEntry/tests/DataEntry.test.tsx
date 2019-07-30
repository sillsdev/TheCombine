import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import ConnectedDataEntryComponent from "../";
import LocalizedDataEntryComponent from "../DataEntryComponent";
import SemanticDomainWithSubdomains from "../../TreeView/SemanticDomain";

const MOCK_TRANSLATE = jest.fn(_ => {
  return "dummy";
});
jest.mock("react-localize-redux", () => {
  const localize = jest.requireActual("react-localize-redux");
  return {
    ...localize,
    getTranslate: jest.fn(_ => {
      return MOCK_TRANSLATE;
    })
  };
});

const createMockStore = configureMockStore([]);

const mockSemanticDomain: SemanticDomainWithSubdomains = {
  name: "",
  id: "",
  subdomains: []
};

const mockState = {
  localize: {
    languages: [],
    translations: null,
    options: null
  },
  treeViewState: {
    currentdomain: mockSemanticDomain
  }
};

const mockStore = createMockStore(mockState);

describe("Tests DataEntryComponent", () => {
  it("connected data entry component renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(
      <Provider store={mockStore}>
        <ConnectedDataEntryComponent />
      </Provider>,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });
  it("localized data entry component renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(
      <Provider store={mockStore}>
        <LocalizedDataEntryComponent domain={mockSemanticDomain} />
      </Provider>,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });
});
