import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import LocalizedDataEntryHeader from "../DataEntryHeader";
import configureMockStore from "redux-mock-store";
import SemanticDomainWithSubdomains from "../../../TreeView/SemanticDomain";

const createMockStore = configureMockStore([]);
const mockStore = createMockStore({});

const mockDomain: SemanticDomainWithSubdomains = {
  name: "",
  id: "",
  description: "",
  subdomains: [],
};

describe("Tests DataEntryHeader", () => {
  it("renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(
      <Provider store={mockStore}>
        <LocalizedDataEntryHeader
          domain={mockDomain}
          displaySemanticDomainView={(isGetting: boolean) => null}
        />
      </Provider>,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });
});
