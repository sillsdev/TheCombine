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
  questions: ["Question 1", "Question 2"],
};

describe("Tests DataEntryHeader", () => {
  it("renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(
      <Provider store={mockStore}>
        <LocalizedDataEntryHeader
          domain={mockDomain}
          questionsVisible={false}
          setQuestionVisibility={() => 1} //insert mock here
        />
      </Provider>,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });

  it("No questions should disable switch and show no questions", () => {});
  it("Questions Visible should show questions", () => {});
  it("Questions not visible should hide questions");
  it("Callback should be called on switch click"); //TODO where to test state?
});
